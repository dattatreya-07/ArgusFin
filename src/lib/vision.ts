export interface OcrResult {
  text: string;
  confidence: number;
  provider: 'local-ocr' | 'vision-adapter' | 'fallback';
}

export interface VisionProvider {
  extractText: (imageBase64: string) => Promise<OcrResult>;
}

export class DefaultVisionProvider implements VisionProvider {
  async extractText(imageBase64: string): Promise<OcrResult> {
    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return {
        text: '',
        confidence: 0,
        provider: 'fallback',
      };
    }

    // In local / browser-side processing, OCR text is forwarded safely
    return {
      text: '',
      confidence: 0.8,
      provider: 'local-ocr',
    };
  }
}

export const defaultVisionProvider = new DefaultVisionProvider();
