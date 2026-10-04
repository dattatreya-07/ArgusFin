import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createCanonicalReportPacket } from '@/lib/report/packet';
import { generateRequestId, logAppEvent } from '@/lib/observability';

const prepareReportSchema = z.object({
  locale: z.enum(['en', 'hi', 'ta']).default('en'),
  jurisdiction: z.string().default('IN'),
  sourceChannel: z.enum(['website', 'telegram', 'whatsapp']).default('website'),
  rawUserInput: z.string().max(10000).optional(),
  incidentDate: z.string().optional(),
  platform: z.string().optional(),
  claimedEntityOrAdvisor: z.string().optional(),
  websiteOrDomain: z.string().optional(),
  totalClaimedLoss: z.number().nonnegative().optional(),
  transactions: z
    .array(
      z.object({
        utrNumber: z.string().optional(),
        amount: z.number().nonnegative(),
        beneficiaryAccountOrUpi: z.string().optional(),
        date: z.string().optional(),
        paymentMethod: z.string().optional(),
      })
    )
    .optional(),
  narrative: z.string().max(10000).optional(),
  credentialsShared: z.boolean().default(false),
  otpShared: z.boolean().default(false),
  remoteAccessGranted: z.boolean().default(false),
  analysisResult: z
    .object({
      riskBand: z.string(),
      confidence: z.number(),
      signals: z.array(z.string()),
      explanation: z.string().optional(),
      citations: z
        .array(
          z.object({
            sourceId: z.string(),
            title: z.string(),
            url: z.string().nullable(),
          })
        )
        .optional(),
    })
    .optional(),
});

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const requestId = req.headers.get('x-request-id') || generateRequestId();

  try {
    let raw: any;
    try {
      raw = await req.json();
    } catch {
      return NextResponse.json(
        {
          requestId,
          status: 'INVALID_INPUT',
          error: { code: 'VALIDATION_ERROR', message: 'Malformed JSON payload.' },
        },
        { status: 400 }
      );
    }

    const parseRes = prepareReportSchema.safeParse(raw);
    if (!parseRes.success) {
      return NextResponse.json(
        {
          requestId,
          status: 'INVALID_INPUT',
          error: { code: 'VALIDATION_ERROR', details: parseRes.error.flatten() },
        },
        { status: 400 }
      );
    }

    const input = parseRes.data;
    const packet = createCanonicalReportPacket(input);

    const durationMs = Date.now() - startTime;
    logAppEvent({
      name: 'report_prepare_success',
      requestId,
      route: '/api/report/prepare',
      subsystem: 'report',
      status: 'success',
      language: input.locale,
      durationMs,
    });

    return NextResponse.json(
      {
        requestId,
        status: 'READY',
        packet,
      },
      { status: 200 }
    );
  } catch (err: any) {
    logAppEvent({
      name: 'report_prepare_failed',
      requestId,
      route: '/api/report/prepare',
      subsystem: 'report',
      status: 'failure',
      errorCode: 'INTERNAL_ERROR',
      durationMs: Date.now() - startTime,
    });

    return NextResponse.json(
      {
        requestId,
        status: 'UNAVAILABLE',
        error: { code: 'INTERNAL_ERROR', message: 'Failed to prepare report packet.' },
      },
      { status: 500 }
    );
  }
}
