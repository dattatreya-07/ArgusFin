import { OcrLanguage } from './ocrTypes';

/**
 * Script Unicode Ranges:
 * - Devanagari (Hindi): \u0900-\u097F
 * - Tamil: \u0B80-\u0BFF
 * - Malayalam: \u0D00-\u0D7F
 * - Basic Latin / ASCII: \u0020-\u007E
 */

export interface ScriptDistribution {
  latin: number;
  devanagari: number;
  tamil: number;
  malayalam: number;
  totalCharacters: number;
}

export function detectScriptFromText(sampleText: string): {
  primaryLanguage: OcrLanguage;
  distribution: ScriptDistribution;
  isMixed: boolean;
} {
  if (!sampleText || sampleText.trim().length === 0) {
    return {
      primaryLanguage: 'eng',
      distribution: { latin: 0, devanagari: 0, tamil: 0, malayalam: 0, totalCharacters: 0 },
      isMixed: false,
    };
  }

  let latin = 0;
  let devanagari = 0;
  let tamil = 0;
  let malayalam = 0;

  for (let i = 0; i < sampleText.length; i++) {
    const code = sampleText.charCodeAt(i);
    if ((code >= 65 && code <= 90) || (code >= 97 && code <= 122)) {
      latin++;
    } else if (code >= 0x0900 && code <= 0x097f) {
      devanagari++;
    } else if (code >= 0x0b80 && code <= 0x0bff) {
      tamil++;
    } else if (code >= 0x0d00 && code <= 0x0d7f) {
      malayalam++;
    }
  }

  const total = latin + devanagari + tamil + malayalam;
  const dist: ScriptDistribution = {
    latin,
    devanagari,
    tamil,
    malayalam,
    totalCharacters: total,
  };

  if (total === 0) {
    return { primaryLanguage: 'eng', distribution: dist, isMixed: false };
  }

  const nonLatinTotal = devanagari + tamil + malayalam;
  const isMixed = latin > 0 && nonLatinTotal > 0;

  if (tamil >= devanagari && tamil >= malayalam && tamil > 0) {
    return { primaryLanguage: isMixed ? 'tam' : 'tam', distribution: dist, isMixed };
  }
  if (malayalam >= devanagari && malayalam >= tamil && malayalam > 0) {
    return { primaryLanguage: isMixed ? 'mal' : 'mal', distribution: dist, isMixed };
  }
  if (devanagari >= tamil && devanagari >= malayalam && devanagari > 0) {
    return { primaryLanguage: isMixed ? 'hin' : 'hin', distribution: dist, isMixed };
  }

  return { primaryLanguage: 'eng', distribution: dist, isMixed: false };
}

/**
 * Maps application locale code to Tesseract traineddata language codes.
 */
export function mapLocaleToOcrModel(locale?: string): string {
  const loc = (locale || 'en').toLowerCase().trim();
  if (loc.startsWith('ta') || loc === 'tam') {
    return 'tam+eng';
  }
  if (loc.startsWith('ml') || loc === 'mal') {
    return 'mal+eng';
  }
  if (loc.startsWith('hi') || loc === 'hin') {
    return 'hin+eng';
  }
  return 'eng';
}
