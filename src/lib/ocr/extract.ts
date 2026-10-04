import { ImageEvidence, ImageValidationResult, OcrBlock } from './types';
import { validateImageInput } from './validate';
import { normalizeOcrText, detectPromptInjectionInOcr } from './normalize';
import { processQrPayload } from './qr';
import { extractUrls } from '../scam/url';
import { maskPII } from '../mask';
import { defaultOcrProvider } from '../evidence/ocr';

export interface ImageExtractionOptions {
  filename?: string;
  mimeType?: string;
  sizeBytes?: number;
  width?: number;
  height?: number;
  qrPayloads?: string[];
  targetLang?: 'en' | 'hi' | 'ta';
  providedOcrText?: string;
}

/**
 * Primary entry point for unified, privacy-preserving image evidence extraction.
 * Extracts OCR text, bounding blocks, QR payloads, and URLs without executing instructions.
 */
export async function extractEvidenceFromImage(
  imageData: string | Buffer,
  options: ImageExtractionOptions = {}
): Promise<{ validation: ImageValidationResult; evidence?: ImageEvidence }> {
  // 1. Validate image payload & bounds
  const validation = validateImageInput({
    buffer: typeof imageData !== 'string' ? imageData : undefined,
    base64: typeof imageData === 'string' ? imageData : undefined,
    mimeType: options.mimeType,
    sizeBytes: options.sizeBytes,
    width: options.width,
    height: options.height,
    allowTextOnly: Boolean(options.providedOcrText),
  });

  if (!validation.valid) {
    return { validation };
  }

  const id = `img-ev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  let rawOcrText = options.providedOcrText || '';
  let ocrConfidence = 0.9;

  // 2. Perform OCR if text was not directly provided
  if (!rawOcrText && imageData) {
    const strData = typeof imageData === 'string' ? imageData : imageData.toString('base64');
    const ocrResult = await defaultOcrProvider.processImage(strData, options.targetLang);
    if (ocrResult.status === 'FOUND' && ocrResult.text) {
      rawOcrText = ocrResult.text;
      ocrConfidence = ocrResult.confidence || 0.85;
    }
  }

  // 3. Safe normalization
  const normalizedOcr = normalizeOcrText(rawOcrText);

  // 4. Privacy PII masking
  const piiResult = maskPII(normalizedOcr);
  const sanitizedOcr = piiResult.masked;
  const masksCount = Object.values(piiResult.counts).reduce((acc, c) => acc + c, 0);

  // 5. Prompt injection inspection (flagged for audit, treated purely as text data)
  const injectionInfo = detectPromptInjectionInOcr(sanitizedOcr);

  // 6. Split into structured OCR blocks
  const lines = sanitizedOcr.split('\n').filter((l) => l.trim().length > 0);
  const ocrBlocks: OcrBlock[] = lines.map((line, idx) => ({
    id: `${id}-block-${idx + 1}`,
    text: line,
    confidence: ocrConfidence,
    lineIndex: idx + 1,
    untrustedContent: true,
  }));

  // 7. URL Extraction from OCR text
  const extractedUrls = extractUrls(sanitizedOcr);

  // 8. QR Code Decoding
  const qrCodes = (options.qrPayloads || []).map((payload, idx) =>
    processQrPayload(payload, idx)
  );

  // Also check if any extracted URLs came from QR codes or text
  const evidence: ImageEvidence = {
    id,
    filename: options.filename ? options.filename.split(/[/\\]/).pop() : undefined,
    mimeType: validation.mimeType || 'image/jpeg',
    sizeBytes: validation.sizeBytes || 0,
    width: validation.width,
    height: validation.height,
    ocrText: sanitizedOcr,
    ocrBlocks,
    ocrConfidence,
    extractedUrls,
    qrCodes,
    provenance: 'IMAGE',
    privacyStatus: masksCount > 0 ? 'MASKED' : 'NO_SENSITIVE_DATA_DETECTED',
  };

  return { validation, evidence };
}
