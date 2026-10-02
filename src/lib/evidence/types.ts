export type EvidenceType = 'IMAGE' | 'PDF' | 'AUDIO' | 'TEXT';

export type ProcessingStatus = 'PENDING' | 'PROCESSED' | 'FAILED' | 'UNAVAILABLE' | 'NO_TEXT';

export type ClaimSource = 'USER_TEXT' | 'OCR' | 'STT';

export interface ExtractedSignal {
  id: string;
  category: string;
  rawText: string;
  confidence: number;
}

export interface ExtractedEvidence {
  text: string;
  normalizedText: string;
  language?: 'en' | 'hi' | 'ta' | 'unknown';
  confidence: number;
  source: ClaimSource;
  signals?: ExtractedSignal[];
  warnings: string[];
  metadata?: {
    filename?: string;
    mimeType?: string;
    sizeBytes?: number;
    durationSeconds?: number;
  };
}

export interface EvidenceItem {
  id: string;
  type: EvidenceType;
  filename?: string;
  mimeType?: string;
  sizeBytes?: number;
  createdAt: string;
  processingStatus: ProcessingStatus;
  extracted?: ExtractedEvidence;
  error?: string;
}

export interface OcrResult {
  status: 'FOUND' | 'NO_TEXT' | 'UNAVAILABLE' | 'FAILED';
  text?: string;
  normalizedText?: string;
  language?: 'en' | 'hi' | 'ta' | 'unknown';
  confidence?: number;
  warnings: string[];
  provider: string;
}

export interface TranscriptResult {
  status: 'FOUND' | 'EMPTY' | 'UNAVAILABLE' | 'FAILED';
  text?: string;
  normalizedText?: string;
  language?: 'en' | 'hi' | 'ta' | 'unknown';
  confidence?: number;
  warnings: string[];
  provider: string;
}

export interface FileValidationResult {
  valid: boolean;
  error?: {
    code: 'UNSUPPORTED_FORMAT' | 'FILE_TOO_LARGE' | 'MALFORMED_PAYLOAD' | 'SECURITY_RISK';
    message: string;
  };
}
