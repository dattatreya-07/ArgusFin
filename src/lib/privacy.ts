import { maskPII, MaskResult, MaskCounts } from './mask';

export { maskPII };
export type { MaskResult, MaskCounts };

/**
 * Returns the masked string directly.
 */
export function maskPii(text?: string): string {
  if (!text) return '';
  return maskPII(text).masked;
}

/**
 * Checks whether unmasked PII is present in a string.
 */
export function detectPiiLeak(text?: string): boolean {
  if (!text) return false;
  const result = maskPII(text);
  const totalPii =
    result.counts.phone +
    result.counts.upi +
    result.counts.email +
    result.counts.pan +
    result.counts.accountOrId;
  return totalPii > 0;
}
