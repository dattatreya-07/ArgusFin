import { ImageEvidence } from '../../ocr/types';
import { CanonicalInput } from '../types';
import { analyzeScam } from '../analyze';
import { extractVisualSignals } from '../../evidence/ocr';

/**
 * Maps ImageEvidence object to CanonicalInput for unified scam decision engine.
 */
export function mapImageEvidenceToCanonicalInput(evidence: ImageEvidence): CanonicalInput {
  // Collect all URLs from OCR text + QR codes
  const urls: string[] = [...evidence.extractedUrls];
  for (const qr of evidence.qrCodes) {
    if (qr.extractedUrl && !urls.includes(qr.extractedUrl)) {
      urls.push(qr.extractedUrl);
    }
  }

  // Combine OCR text + QR payload summary as untrusted text evidence
  let aggregatedText = evidence.ocrText || '';
  if (evidence.qrCodes.length > 0) {
    const qrSummaries = evidence.qrCodes
      .map((qr) => `[QR Code Payload (${qr.type}): ${qr.rawValue}]`)
      .join('\n');
    aggregatedText = aggregatedText
      ? `${aggregatedText}\n\n${qrSummaries}`
      : qrSummaries;
  }

  // Extract visual signals from OCR text
  const visualSignals = extractVisualSignals(aggregatedText);

  return {
    source: 'IMAGE',
    text: aggregatedText,
    urls,
    attachments: [
      {
        type: 'image',
        mimeType: evidence.mimeType,
        content: `Image ID: ${evidence.id}`,
      },
    ],
    metadata: {
      imageId: evidence.id,
      originalFilename: evidence.filename,
      dimensions: evidence.width && evidence.height ? `${evidence.width}x${evidence.height}` : undefined,
      sizeBytes: evidence.sizeBytes,
      ocrBlockCount: evidence.ocrBlocks.length,
      ocrConfidence: evidence.ocrConfidence,
      qrCount: evidence.qrCodes.length,
      qrCodes: evidence.qrCodes,
      visualSignals,
      untrustedEvidence: true,
      screenshotAuthenticityVerified: false, // Critical principle
    },
    privacyStatus: evidence.privacyStatus,
    provenance: {
      timestamp: new Date().toISOString(),
      channelId: 'IMAGE_UPLOAD_PIPELINE',
    },
  };
}

/**
 * Runs the unified scam analysis pipeline on an image evidence payload.
 */
export async function analyzeImageScam(evidence: ImageEvidence) {
  const canonicalInput = mapImageEvidenceToCanonicalInput(evidence);
  const result = await analyzeScam(canonicalInput);

  // Annotate result with image limitations & evidence provenance
  return {
    ...result,
    evidenceProvenance: {
      imageId: evidence.id,
      source: 'IMAGE' as const,
      ocrBlockCount: evidence.ocrBlocks.length,
      qrCount: evidence.qrCodes.length,
      privacyStatus: evidence.privacyStatus,
    },
    limitations: [
      ...result.limitations,
      'OCR text and QR payloads are untrusted evidence and do not prove transaction or account authenticity.',
    ],
  };
}
