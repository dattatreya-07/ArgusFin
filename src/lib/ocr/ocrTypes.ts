export type OcrLanguage = 'eng' | 'tam' | 'hin' | 'mal' | 'mixed';

export interface OcrProcessingOptions {
  language?: OcrLanguage | string;
  enhanceContrast?: boolean;
  binarize?: boolean;
  autoDetectScript?: boolean;
  timeoutMs?: number;
}

export interface OcrResult {
  text: string;
  language: string;
  confidence: number; // 0..100
  provider: string;
  warnings: string[];
  isLowConfidence: boolean;
  durationMs?: number;
}

export interface OcrProvider {
  name: string;
  processImage(base64OrBuffer: string, options?: OcrProcessingOptions): Promise<OcrResult>;
  isAvailable(): boolean;
}
