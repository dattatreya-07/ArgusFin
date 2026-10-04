import { Lang } from '@/lib/types';
import { detectLanguage } from '@/lib/detect-lang';

export interface NormalizedResult {
  normalizedText: string;
  extractedUrls: string[];
  detectedLang: Lang;
  hasAmbiguousNumbers: boolean;
}

const URL_REGEX = /(https?:\/\/[^\s<>"{}|\\^`]+)/gi;

export function normalizeCanonicalInput(
  text: string = '',
  urls: string[] = [],
  declaredLang?: Lang
): NormalizedResult {
  // 1. Strip control characters except newline and tab
  let cleanText = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // 2. Safe whitespace collapse (preserve newlines for block context)
  cleanText = cleanText
    .split('\n')
    .map((line) => line.trim().replace(/\s+/g, ' '))
    .join('\n')
    .trim();

  // 3. URL Extraction (combine explicit URLs and embedded text URLs)
  const textUrls: string[] = [];
  let match: RegExpExecArray | null;
  const regex = new RegExp(URL_REGEX);
  while ((match = regex.exec(cleanText)) !== null) {
    if (match[1] && !textUrls.includes(match[1])) {
      textUrls.push(match[1]);
    }
  }

  const combinedUrls = Array.from(new Set([...urls, ...textUrls]));

  // 4. Language Detection
  const detectedLang: Lang = declaredLang || detectLanguage(cleanText);

  // 5. Check if text contains ambiguous numbers (e.g. returns without clear timeframe)
  const hasAmbiguousNumbers = /\b\d+(\.\d+)?%\b/.test(cleanText) && !/\b(day|days|month|months|year|years|daily|monthly|annual|p\.a\.)\b/i.test(cleanText);

  return {
    normalizedText: cleanText,
    extractedUrls: combinedUrls,
    detectedLang,
    hasAmbiguousNumbers,
  };
}
