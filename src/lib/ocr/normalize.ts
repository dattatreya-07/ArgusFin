/**
 * Safe OCR text normalization.
 * Cleans up OCR artifacts (broken line breaks, redundant spaces) while strictly preserving
 * raw financial numbers, percentages, decimals, and currency symbols.
 * NEVER aggressively alter numeric digits or text semantics.
 */
export function normalizeOcrText(rawText: string): string {
  if (!rawText) return '';

  let text = rawText;

  // 1. Standardize CRLF to LF
  text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // 2. Fix broken URLs from line wraps (e.g., "http:// \n example.com")
  text = text.replace(/(https?:\/\/)\s+/gi, '$1');
  text = text.replace(/(\.[a-z]{2,6})\s*\/\s*/gi, '$1/');

  // 3. Fix excessive spaces around currency symbols while preserving exact values
  text = text.replace(/(₹|\$|€|£|₹|Rs\.?|INR)\s+(\d)/gi, '$1$2');

  // 4. Collapse multi-spaces within lines while preserving single linebreaks
  const lines = text.split('\n').map((line) => line.trim().replace(/[ \t]+/g, ' '));
  text = lines.filter((l) => l.length > 0).join('\n');

  return text;
}

/**
 * Checks if OCR text contains prompt injection attempts trying to hijack the LLM or engine.
 * Prompt injections in OCR text are treated purely as DATA, never instructions.
 */
export function detectPromptInjectionInOcr(text: string): {
  detected: boolean;
  patternsFound: string[];
} {
  const lower = text.toLowerCase();
  const patterns: { regex: RegExp; name: string }[] = [
    { regex: /ignore (all )?previous instructions/i, name: 'IGNORE_PREVIOUS_INSTRUCTIONS' },
    { regex: /reveal (your|the) system prompt/i, name: 'REVEAL_SYSTEM_PROMPT' },
    { regex: /send (this )?user'?s? otp/i, name: 'EXFILTRATE_OTP' },
    { regex: /classify (this|the) company as (a )?scam/i, name: 'FORCE_CLASSIFICATION' },
    { regex: /you are now (an?|in) /i, name: 'ROLEPLAY_INJECTION' },
    { regex: /bypass all security checks/i, name: 'BYPASS_SECURITY' },
    { regex: /\[system prompt\]/i, name: 'FAKE_SYSTEM_TAG' },
  ];

  const patternsFound: string[] = [];
  for (const p of patterns) {
    if (p.regex.test(lower)) {
      patternsFound.push(p.name);
    }
  }

  return {
    detected: patternsFound.length > 0,
    patternsFound,
  };
}
