import { Lang } from '../types';

export type VoiceLocale = Lang | 'en' | 'hi' | 'ta' | 'ml' | 'en-IN' | 'hi-IN' | 'ta-IN' | 'ml-IN';

export interface VoiceLike {
  name: string;
  lang: string;
  default?: boolean;
  localService?: boolean;
}

export const LOCALE_MAP: Record<string, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  ta: 'ta-IN',
  ml: 'ml-IN',
  'en-IN': 'en-IN',
  'hi-IN': 'hi-IN',
  'ta-IN': 'ta-IN',
  'ml-IN': 'ml-IN',
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

  // Language tag matches ta-in, ta-lk, ta-sg, ta-my, ta, or tam
  if (normLang === 'ta-in' || normLang.startsWith('ta-') || normLang === 'ta' || normLang === 'tam') {
    return true;
  }

  // Name indicates Tamil and language tag is not an incompatible language (like en-* or hi-*)
  if (
    normName.includes('tamil') ||
    normName.includes('தமிழ்') ||
    normName.includes('valluvar') ||
    normName.includes('pallavi') ||
    normName.includes('latha') ||
    normName.includes('kani') ||
    normName.includes('ananya') ||
    normName.includes('saranya') ||
    normName.includes('kumar')
  ) {
    if (
      !normLang.startsWith('en') &&
      !normLang.startsWith('hi') &&
      !normLang.startsWith('zh') &&
      !normLang.startsWith('es') &&
      !normLang.startsWith('ml')
    ) {
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

  if (normLang === 'hi-in' || normLang.startsWith('hi-') || normLang === 'hi' || normLang === 'hin') {
    return true;
  }

  if (
    normName.includes('hindi') ||
    normName.includes('हिन्दी') ||
    normName.includes('kalpana') ||
    normName.includes('hemant') ||
    normName.includes('madhav') ||
    normName.includes('swara')
  ) {
    if (!normLang.startsWith('en') && !normLang.startsWith('ta') && !normLang.startsWith('zh') && !normLang.startsWith('ml')) {
      return true;
    }
  }

  return false;
}

/**
 * Checks if a voice is strictly compatible with Malayalam.
 */
export function isMalayalamCompatible(voice: VoiceLike): boolean {
  const normLang = normalizeLangTag(voice.lang);
  const normName = voice.name.toLowerCase();

  if (normLang === 'ml-in' || normLang.startsWith('ml-') || normLang === 'ml' || normLang === 'mal') {
    return true;
  }

  if (
    normName.includes('malayalam') ||
    normName.includes('മലയാളം') ||
    normName.includes('midhun') ||
    normName.includes('manju') ||
    normName.includes('dhwani') ||
    normName.includes('anjali')
  ) {
    if (!normLang.startsWith('en') && !normLang.startsWith('hi') && !normLang.startsWith('ta')) {
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
  return normLang.startsWith('en') || normLang === 'en' || normLang === 'eng';
}

/**
 * Robustly selects a voice matching the target language.
 * Strict Invariant: NEVER fall back to an incompatible language when Tamil/Malayalam/Hindi is requested.
 * Returns null if no genuine compatible voice is found.
 */
export function selectVoice<T extends VoiceLike>(options: {
  language: VoiceLocale | string;
  voices: T[];
}): T | null {
  const { language, voices } = options;
  if (!voices || voices.length === 0) return null;

  const targetLang: string = normalizeLangTag(language || 'en');

  // Tamil Selection
  if (targetLang === 'ta' || targetLang === 'ta-in' || targetLang.startsWith('ta')) {
    const tamilCandidates = voices.filter((v) => isTamilCompatible(v));
    if (tamilCandidates.length === 0) return null;

    // 1. Prefer Google Neural / Natural high-fidelity Tamil voices
    const neuralTa = tamilCandidates.find(
      (v) =>
        (normalizeLangTag(v.lang) === 'ta-in' || normalizeLangTag(v.lang) === 'ta') &&
        (v.name.toLowerCase().includes('network') ||
          v.name.toLowerCase().includes('natural') ||
          v.name.includes('தமிழ்') ||
          v.name.toLowerCase().includes('google'))
    );
    if (neuralTa) return neuralTa;

    // 2. Exact ta-IN match
    const exactTaIn = tamilCandidates.find((v) => normalizeLangTag(v.lang) === 'ta-in');
    if (exactTaIn) return exactTaIn;

    // 3. Regional ta-* match (e.g. ta-LK, ta-SG)
    const regionalTa = tamilCandidates.find((v) => normalizeLangTag(v.lang).startsWith('ta-'));
    if (regionalTa) return regionalTa;

    // 4. Any compatible Tamil candidate
    return tamilCandidates[0];
  }

  // Malayalam Selection
  if (targetLang === 'ml' || targetLang === 'ml-in' || targetLang.startsWith('ml')) {
    const malayalamCandidates = voices.filter((v) => isMalayalamCompatible(v));
    if (malayalamCandidates.length === 0) return null;

    // 1. Prefer Google Neural / Natural Malayalam voices
    const neuralMl = malayalamCandidates.find(
      (v) =>
        (normalizeLangTag(v.lang) === 'ml-in' || normalizeLangTag(v.lang) === 'ml') &&
        (v.name.toLowerCase().includes('natural') ||
          v.name.toLowerCase().includes('network') ||
          v.name.includes('മലയാളം') ||
          v.name.toLowerCase().includes('google'))
    );
    if (neuralMl) return neuralMl;

    // 2. Exact ml-IN match
    const exactMlIn = malayalamCandidates.find((v) => normalizeLangTag(v.lang) === 'ml-in');
    if (exactMlIn) return exactMlIn;

    // 3. Generic/regional ml-* match
    const regionalMl = malayalamCandidates.find((v) => normalizeLangTag(v.lang).startsWith('ml'));
    if (regionalMl) return regionalMl;

    return malayalamCandidates[0];
  }

  // Hindi Selection
  if (targetLang === 'hi' || targetLang === 'hi-in' || targetLang.startsWith('hi')) {
    const hindiCandidates = voices.filter((v) => isHindiCompatible(v));
    if (hindiCandidates.length === 0) return null;

    // 1. Exact hi-IN match
    const exactHiIn = hindiCandidates.find((v) => normalizeLangTag(v.lang) === 'hi-in');
    if (exactHiIn) return exactHiIn;

    // 2. Regional / Generic hi match
    const regionalHi = hindiCandidates.find((v) => normalizeLangTag(v.lang).startsWith('hi'));
    if (regionalHi) return regionalHi;

    return hindiCandidates[0];
  }

  // English Selection:
  // 1. Prefer en-IN for Indian context
  const exactEnIn = voices.find((v) => normalizeLangTag(v.lang) === 'en-in');
  if (exactEnIn) return exactEnIn;

  // 2. Prefer en-GB / en-US
  const standardEn = voices.find((v) => {
    const tag = normalizeLangTag(v.lang);
    return tag === 'en-gb' || tag === 'en-us' || tag === 'en';
  });
  if (standardEn) return standardEn;

  // 3. Any English voice
  const anyEn = voices.find((v) => isEnglishCompatible(v));
  if (anyEn) return anyEn;

  return null;
}

export function selectBestVoice<T extends VoiceLike>(
  voices: T[],
  language: VoiceLocale | string
): T | null {
  return selectVoice({ language, voices });
}

