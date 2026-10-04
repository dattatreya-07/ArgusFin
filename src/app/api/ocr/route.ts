import { NextRequest, NextResponse } from 'next/server';
import { extractEvidenceFromImage } from '@/lib/ocr/extract';
import { analyzeImageScam } from '@/lib/scam/adapters/image';
import { generateRequestId, logAppEvent } from '@/lib/observability';

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const requestId = req.headers.get('x-request-id') || generateRequestId();

  try {
    const contentType = req.headers.get('content-type') || '';
    let imagePayload: string | Buffer = '';
    let filename: string | undefined;
    let mimeType: string | undefined;
    let qrPayloads: string[] | undefined;

    if (contentType.includes('application/json')) {
      const body = await req.json();
      imagePayload = body.image || body.base64 || body.ocrText || '';
      filename = body.filename;
      mimeType = body.mimeType;
      qrPayloads = body.qrPayloads;
    } else {
      // Form data payload handling
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      if (file) {
        const arrayBuffer = await file.arrayBuffer();
        imagePayload = Buffer.from(arrayBuffer);
        filename = file.name;
        mimeType = file.type;
      }
    }

    if (!imagePayload) {
      return NextResponse.json(
        {
          requestId,
          error: {
            code: 'INVALID_INPUT',
            message: 'Image file or base64 payload is required.',
          },
        },
        { status: 400 }
      );
    }

    const { validation, evidence } = await extractEvidenceFromImage(imagePayload, {
      filename,
      mimeType,
      qrPayloads,
    });

    if (!validation.valid || !evidence) {
      return NextResponse.json(
        {
          requestId,
          error: {
            code: 'VALIDATION_FAILED',
            message: validation.error || 'Failed to process image payload.',
          },
        },
        { status: 422 }
      );
    }

    // Pass extracted evidence into canonical scam decision engine
    const analysis = await analyzeImageScam(evidence);

    logAppEvent({
      name: 'request_completed',
      requestId,
      route: '/api/ocr',
      subsystem: 'ocr',
      status: 'success',
      durationMs: Date.now() - startTime,
    });

    return NextResponse.json({
      requestId,
      validation,
      evidence: {
        id: evidence.id,
        filename: evidence.filename,
        mimeType: evidence.mimeType,
        sizeBytes: evidence.sizeBytes,
        ocrBlocksCount: evidence.ocrBlocks.length,
        extractedUrls: evidence.extractedUrls,
        qrCodes: evidence.qrCodes,
        privacyStatus: evidence.privacyStatus,
      },
      analysis,
    });
  } catch (err) {
    logAppEvent({
      name: 'request_failed',
      requestId,
      route: '/api/ocr',
      subsystem: 'ocr',
      status: 'failure',
      durationMs: Date.now() - startTime,
    });

    return NextResponse.json(
      {
        requestId,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred while processing the image.',
        },
      },
      { status: 500 }
    );
  }
}
