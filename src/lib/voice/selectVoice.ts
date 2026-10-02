import { Lang } from '../types';

export interface VoiceLike {
  name: string;
  lang: string;
  default?: boolean;
  localService?: boolean;
}

export const LOCALE_MAP: Record<Lang, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  ta: 'ta-IN',
};

/**
 * Normalizes language tags (e.g. 'ta_IN' -> 'ta-in', 'TA-in' -> 'ta-in').
 */
export function normalizeLangTag(tag: string): string {
  if (!tag) return '';
  return tag.trim().replace(/_/g, '-').toLowerCase();
}

/**
 * Checks if a voice is strictly compatible with Tamil.
 */
export function isTamilCompatible(voice: VoiceLike): boolean {
  const normLang = normalizeLangTag(voice.lang);
  const normName = voice.name.toLowerCase();

  // Language tag matches ta-in, ta-lk, ta-sg, or ta
  if (normLang === 'ta-in' || normLang.startsWith('ta-') || normLang === 'ta') {
    return true;
  }

  // Name indicates Tamil and language tag is not an incompatible language (like en-* or hi-*)
  if (
    normName.includes('tamil') ||
    normName.includes('தமிழ்') ||
    normName.includes('valluvar') ||
    normName.includes('pallavi') ||
    normName.includes('latha') ||
    normName.includes('kani')
  ) {
    if (!normLang.startsWith('en') && !normLang.startsWith('hi') && !normLang.startsWith('zh')) {
      return true;
    }
  }

  return false;
}

/**
 * Checks if a voice is strictly compatible with Hindi.
 */
export function isHindiCompatible(voice: VoiceLike): boolean {
  const normLang = normalizeLangTag(voice.lang);
  const normName = voice.name.toLowerCase();

  if (normLang === 'hi-in' || normLang.startsWith('hi-') || normLang === 'hi') {
    return true;
  }

  if (
    normName.includes('hindi') ||
    normName.includes('हिन्दी') ||
    normName.includes('kalpana') ||
    normName.includes('hemant') ||
    normName.includes('madhav')
  ) {
    if (!normLang.startsWith('en') && !normLang.startsWith('ta') && !normLang.startsWith('zh')) {
      return true;
    }
  }

  return false;
}

/**
 * Checks if a voice is strictly compatible with English (preferring en-IN).
 */
export function isEnglishCompatible(voice: VoiceLike): boolean {
  const normLang = normalizeLangTag(voice.lang);
  return normLang.startsWith('en') || normLang === 'en';
}

/**
 * Robustly selects a voice matching the target language.
 * Strict Invariant: NEVER fall back to English or Hindi when Tamil is requested.
 * Returns null if no genuine compatible voice is found.
 */
export function selectVoice<T extends VoiceLike>(options: {
  language: Lang | string;
  voices: T[];
}): T | null {
  const { language, voices } = options;
  if (!voices || voices.length === 0) return null;

  const targetLang: string = language || 'en';

  if (targetLang === 'ta' || targetLang === 'ta-IN' || targetLang.startsWith('ta')) {
    // 1. Exact ta-IN match
    const exactTaIn = voices.find((v) => normalizeLangTag(v.lang) === 'ta-in');
    if (exactTaIn) return exactTaIn;

    // 2. Regional ta-* match (e.g. ta-LK, ta-SG)
    const regionalTa = voices.find((v) => normalizeLangTag(v.lang).startsWith('ta-'));
    if (regionalTa) return regionalTa;

    // 3. Generic ta match
    const genericTa = voices.find((v) => normalizeLangTag(v.lang) === 'ta');
    if (genericTa) return genericTa;

    // 4. Tamil name match with compatible tag
    const nameTa = voices.find((v) => isTamilCompatible(v));
    if (nameTa) return nameTa;

    // Reject non-Tamil voices completely!
    return null;
  }

  if (targetLang === 'hi' || targetLang === 'hi-IN' || targetLang.startsWith('hi')) {
    // 1. Exact hi-IN match
    const exactHiIn = voices.find((v) => normalizeLangTag(v.lang) === 'hi-in');
    if (exactHiIn) return exactHiIn;

    // 2. Regional hi-* match
    const regionalHi = voices.find((v) => normalizeLangTag(v.lang).startsWith('hi-'));
    if (regionalHi) return regionalHi;

    // 3. Generic hi match
    const genericHi = voices.find((v) => normalizeLangTag(v.lang) === 'hi');
    if (genericHi) return genericHi;

    // 4. Hindi name match
    const nameHi = voices.find((v) => isHindiCompatible(v));
    if (nameHi) return nameHi;

    return null;
  }

  // English fallback:
  // 1. Prefer en-IN for Indian context
  const exactEnIn = voices.find((v) => normalizeLangTag(v.lang) === 'en-in');
  if (exactEnIn) return exactEnIn;

  // 2. Any English voice
  const anyEn = voices.find((v) => isEnglishCompatible(v));
  if (anyEn) return anyEn;

  return null;
}
