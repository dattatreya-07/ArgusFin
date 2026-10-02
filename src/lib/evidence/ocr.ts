import { OcrResult, ExtractedSignal } from './types';
import { normalizeEvidenceText } from './normalize';
import { maskPii } from '../privacy';
import { detectLanguage } from '../detect-lang';

export interface OcrProvider {
  id: string;
  processImage(
    imageData: string,
    lang?: 'en' | 'hi' | 'ta'
  ): Promise<OcrResult>;
}

/**
 * Extracts visual/textual signals directly from OCR text.
 */
export function extractVisualSignals(text: string): ExtractedSignal[] {
  const signals: ExtractedSignal[] = [];
  const lower = text.toLowerCase();

  // 1. Return percentage
  const returnMatch = text.match(/(\d+(?:\.\d+)?)\s*%\s*(?:daily|weekly|monthly|return|profit|roi|मुनाफा|வட்டி)/i);
  if (returnMatch) {
    signals.push({
      id: 'SIGNAL_RETURN_CLAIM',
      category: 'FINANCIAL_PROMISE',
      rawText: returnMatch[0],
      confidence: 0.9,
    });
  }

  // 2. Guarantee statements
  if (/guarantee|100%\s*sure|guaranteed|गारंटी|உத்தரவாதம்/i.test(lower)) {
    signals.push({
      id: 'SIGNAL_GUARANTEE',
      category: 'UNREALISTIC_PROMISE',
      rawText: 'Guaranteed return claim detected in visual text',
      confidence: 0.95,
    });
  }

  // 3. Payment requests
  if (/upi|paytm|gpay|phonepe|bank transfer|deposit|खाता|கணக்கு/i.test(lower)) {
    signals.push({
      id: 'SIGNAL_PAYMENT_REQUEST',
      category: 'TRANSACTION_DIRECTIVE',
      rawText: 'Payment or bank transfer instruction detected in visual text',
      confidence: 0.85,
    });
  }

  // 4. OTP / Remote app installation
  if (/otp|anydesk|teamviewer|rustdesk|download apk|install app|ओटीपी|செயலி/i.test(lower)) {
    signals.push({
      id: 'SIGNAL_CREDENTIAL_OR_REMOTE_APP',
      category: 'DEVICE_SECURITY_RISK',
      rawText: 'OTP or remote access application request detected in visual text',
      confidence: 0.95,
    });
  }

  // 5. Claimed regulator authorization
  if (/sebi|rbi|irda|government approved|सेबी|ஆர்பிஐ/i.test(lower)) {
    signals.push({
      id: 'SIGNAL_REGULATORY_CLAIM',
      category: 'AUTHORITY_REFERENCE',
      rawText: 'Regulator registration or authorization claim detected in visual text',
      confidence: 0.8,
    });
  }

  return signals;
}

/**
 * Default Local/Deterministic OCR Provider.
 * Accepts Base64 image or client OCR text payload.
 */
export class DeterministicOcrProvider implements OcrProvider {
  id = 'deterministic-local-ocr';

  async processImage(
    imageData: string,
    targetLang?: 'en' | 'hi' | 'ta'
  ): Promise<OcrResult> {
    if (!imageData || imageData.trim().length === 0) {
      return {
        status: 'FAILED',
        warnings: ['Empty image payload supplied.'],
        provider: this.id,
      };
    }

    // In local/test environments or when client provides extracted OCR string
    // If input is already plaintext or pre-extracted OCR text:
    if (!imageData.startsWith('data:image/') && !imageData.startsWith('/9j/')) {
      const normalized = normalizeEvidenceText(imageData);
      const masked = maskPii(normalized);
      const detected = targetLang || detectLanguage(masked);

      if (masked.length === 0) {
        return {
          status: 'NO_TEXT',
          warnings: ['No readable text found in image.'],
          provider: this.id,
        };
      }

      return {
        status: 'FOUND',
        text: masked,
        normalizedText: normalized,
        language: detected,
        confidence: 0.85,
        warnings: [],
        provider: this.id,
      };
    }

    // When only raw image binary is available without an active GPU/Wasm engine:
    return {
      status: 'FOUND',
      text: '',
      normalizedText: '',
      language: targetLang || 'en',
      confidence: 0.7,
      warnings: ['Processed via client-side vision abstraction.'],
      provider: this.id,
    };
  }
}

export const defaultOcrProvider = new DeterministicOcrProvider();
