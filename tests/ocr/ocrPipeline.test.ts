import { describe, it, expect } from 'vitest';
import { detectScriptFromText, mapLocaleToOcrModel } from '@/lib/ocr/languageDetection';
import { multilingualOcrService } from '@/lib/ocr/ocrService';
import { preprocessOcrImage } from '@/lib/ocr/preprocess';

describe('Workstream B — Multilingual OCR Pipeline', () => {
  it('1. Script Detection accurately detects Tamil script', () => {
    const tamilSample = 'உங்கள் முதலீடு ₹50,000 ஆகும். உடனடியாக பணம் அனுப்பவும்.';
    const res = detectScriptFromText(tamilSample);
    expect(res.primaryLanguage).toBe('tam');
    expect(res.distribution.tamil).toBeGreaterThan(0);
  });

  it('2. Script Detection accurately detects Malayalam script', () => {
    const malSample = 'നിങ്ങളുടെ നിക്ഷേപം ഇരട്ടിയാകും. ഉടൻ രജിസ്റ്റർ ചെയ്യുക.';
    const res = detectScriptFromText(malSample);
    expect(res.primaryLanguage).toBe('mal');
    expect(res.distribution.malayalam).toBeGreaterThan(0);
  });

  it('3. Script Detection accurately detects Hindi Devanagari script', () => {
    const hindiSample = 'गारंटीकृत 20% दैनिक रिटर्न प्राप्त करें।';
    const res = detectScriptFromText(hindiSample);
    expect(res.primaryLanguage).toBe('hin');
    expect(res.distribution.devanagari).toBeGreaterThan(0);
  });

  it('4. Script Detection accurately detects Mixed Script (English + Indic)', () => {
    const mixedSample = 'Join our VIP WhatsApp Group for guaranteed 10% daily yield! உடனடியாக இணையுங்கள்.';
    const res = detectScriptFromText(mixedSample);
    expect(res.isMixed).toBe(true);
    expect(res.distribution.latin).toBeGreaterThan(0);
    expect(res.distribution.tamil).toBeGreaterThan(0);
  });

  it('5. Locale Mapping correctly maps regional locales to multi-script Tesseract models', () => {
    expect(mapLocaleToOcrModel('ta')).toBe('tam+eng');
    expect(mapLocaleToOcrModel('ml')).toBe('mal+eng');
    expect(mapLocaleToOcrModel('hi')).toBe('hin+eng');
    expect(mapLocaleToOcrModel('en')).toBe('eng');
  });

  it('6. OCR Pipeline processes text payload with automatic PII masking', async () => {
    const rawImageText = 'Payment transfer to badactor@upi or call +919876543210 for prize claim';
    const result = await multilingualOcrService.extractTextFromImage(rawImageText, {
      language: 'eng',
    });

    expect(result.text).not.toContain('+919876543210');
    expect(result.text).not.toContain('badactor@upi');
    expect(result.text).toContain('[PHONE]');
    expect(result.text).toContain('[UPI]');
    expect(result.isLowConfidence).toBe(false);
  });

  it('7. OCR Pipeline handles empty/invalid image gracefully with warnings', async () => {
    const result = await multilingualOcrService.extractTextFromImage('', { language: 'eng' });
    expect(result.confidence).toBe(0);
    expect(result.isLowConfidence).toBe(true);
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it('8. Preprocessing handles non-browser environment safely without crashing', async () => {
    const res = await preprocessOcrImage('sample-data', { enhanceContrast: true });
    expect(res.processedImage).toBe('sample-data');
    expect(res.enhanced).toBe(false);
  });
});
