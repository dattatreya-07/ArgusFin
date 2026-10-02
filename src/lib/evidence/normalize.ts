/**
 * Deterministic text normalization for OCR and Voice Speech-to-Text outputs.
 * Preserves numbers and Indic characters without destructive transformations.
 */

export function normalizeEvidenceText(rawText: string): string {
  if (!rawText || typeof rawText !== 'string') return '';

  // 1. Unicode NFC Normalization (prevents decomposed Devanagari/Tamil conjuncts)
  let text = rawText.normalize('NFC');

  // 2. Remove invisible control characters (except newline, tab)
  text = text.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '');

  // 3. Normalize multiple erratic spaces while preserving paragraph breaks
  text = text
    .split('\n')
    .map((line) => line.replace(/[ \t]+/g, ' ').trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n');

  // 4. Normalize common currency prefixes without altering underlying digits
  text = text.replace(/(?:rs\.?|inr)\s*(\d+)/gi, '₹$1');

  return text.trim();
}

/**
 * Encapsulates evidence text in an inert, untrusted wrapper for prompt injection defense.
 */
export function wrapUntrustedEvidence(
  evidenceText: string,
  source: 'OCR' | 'STT' | 'USER_TEXT'
): string {
  return `<UNTRUSTED_EVIDENCE source="${source}">\n${evidenceText}\n</UNTRUSTED_EVIDENCE>`;
}
