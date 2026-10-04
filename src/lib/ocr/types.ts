export type ImageMimeType = 'image/jpeg' | 'image/png' | 'image/webp';
export type QrType = 'QR_URL' | 'QR_PAYMENT_URI' | 'QR_TEXT' | 'QR_UNKNOWN';

export interface QrEvidence {
  id: string;
  rawValue: string;
  type: QrType;
  extractedUrl?: string;
  parsedPayment?: {
    scheme: string;
    merchantName?: string;
    amount?: number;
    currency?: string;
  };
  urlEvidence?: any;
}

export interface OcrBlock {
  id: string;
  text: string;
  confidence?: number;
  lineIndex: number;
  untrustedContent: true;
}

export interface ImageValidationResult {
  valid: boolean;
  mimeType?: string;
  sizeBytes?: number;
  width?: number;
  height?: number;
  error?: string;
}

export interface ImageEvidence {
  id: string;
  filename?: string;
  mimeType: string;
  sizeBytes: number;
  width?: number;
  height?: number;
  ocrText: string;
  ocrBlocks: OcrBlock[];
  ocrConfidence: number;
  extractedUrls: string[];
  qrCodes: QrEvidence[];
  provenance: 'IMAGE' | 'SCREENSHOT' | 'OCR' | 'QR_URL';
  privacyStatus: 'MASKED' | 'NO_SENSITIVE_DATA_DETECTED';
}
