import { OcrResult, OcrProcessingOptions, OcrProvider } from './ocrTypes';
import { tesseractMultilingualProvider } from './tesseractProvider';
import { preprocessOcrImage } from './preprocess';
import { detectScriptFromText } from './languageDetection';
import { maskPII } from '@/lib/mask';

export class MultilingualOcrService {
  private primaryProvider: OcrProvider;

  constructor(provider: OcrProvider = tesseractMultilingualProvider) {
    this.primaryProvider = provider;
  }

  /**
   * Complete multi-stage OCR extraction pipeline:
   * Validation -> Preprocess -> Multi-Script OCR -> Confidence Review -> Post-Processing
   */
  public async extractTextFromImage(
    imageData: string,
    options: OcrProcessingOptions = {}
  ): Promise<OcrResult> {
    const startTime = Date.now();

    if (!imageData || imageData.trim().length === 0) {
      return {
        text: '',
        language: 'eng',
        confidence: 0,
        provider: this.primaryProvider.name,
        warnings: ['Empty or invalid image data provided.'],
        isLowConfidence: true,
        durationMs: 0,
      };
    }

    // Step 1: Preprocessing (contrast enhancement, grayscale normalization)
    let processedImageData = imageData;
    if (imageData.startsWith('data:image/')) {
      const preprocessRes = await preprocessOcrImage(imageData, {
        enhanceContrast: options.enhanceContrast ?? true,
        binarize: options.binarize ?? false,
      });
      processedImageData = preprocessRes.processedImage;
    }

    // Step 2: Multi-Script OCR Execution
    const ocrResult = await this.primaryProvider.processImage(processedImageData, options);

    // Step 3: Script & Language Analysis
    const scriptInfo = detectScriptFromText(ocrResult.text);

    // Step 4: Confidence & Quality Checks
    const warnings = [...ocrResult.warnings];
    const isLowConfidence = ocrResult.confidence < 60 || ocrResult.text.length === 0;

    if (isLowConfidence && ocrResult.text.length > 0) {
      if (!warnings.some((w) => w.includes('low OCR confidence'))) {
        warnings.push('Some text could not be read reliably. Please verify the extracted message.');
      }
    }

    // Step 5: Final Privacy Gate (Mask any PII found in OCR output)
    const sanitized = maskPII(ocrResult.text).masked;

    return {
      text: sanitized,
      language: scriptInfo.primaryLanguage,
      confidence: ocrResult.confidence,
      provider: ocrResult.provider,
      warnings,
      isLowConfidence,
      durationMs: Date.now() - startTime,
    };
  }
}

export const multilingualOcrService = new MultilingualOcrService();
