import { Lang } from './types';

/**
 * Deterministic Unicode script-based language detector for EN, HI, TA.
 */
export function detectLanguage(text: string): Lang {
  if (!text || typeof text !== 'string') return 'en';

  // Count script occurrences
  const devanagariCount = (text.match(/[\u0900-\u097F]/g) || []).length;
  const tamilCount = (text.match(/[\u0B80-\u0BFF]/g) || []).length;
  const latinCount = (text.match(/[A-Za-z]/g) || []).length;

  if (tamilCount > devanagariCount && tamilCount > latinCount) {
    return 'ta';
  }

  if (devanagariCount > latinCount) {
    return 'hi';
  }

  return 'en';
}
