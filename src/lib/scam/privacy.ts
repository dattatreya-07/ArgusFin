import { maskPII } from '@/lib/mask';
import { CanonicalInput, PrivacyStatus } from './types';

export interface PrivacyGateResult {
  sanitizedText: string;
  privacyStatus: PrivacyStatus;
  masksAppliedCount: number;
}

/**
 * Enforces the strict privacy boundary for all input channels prior to LLM or external analysis.
 * Reuses existing maskPII implementation.
 */
export function enforcePrivacyGate(input: CanonicalInput): PrivacyGateResult {
  const rawText = input.text || '';

  if (!rawText.trim()) {
    return {
      sanitizedText: '',
      privacyStatus: 'NO_SENSITIVE_DATA_DETECTED',
      masksAppliedCount: 0,
    };
  }

  // Execute client/edge maskPII
  const maskResult = maskPII(rawText);
  const totalMasks = Object.values(maskResult.counts).reduce((acc, c) => acc + c, 0);

  let privacyStatus: PrivacyStatus = 'NO_SENSITIVE_DATA_DETECTED';
  if (totalMasks > 0 || input.privacyStatus === 'MASKED') {
    privacyStatus = 'MASKED';
  }

  return {
    sanitizedText: maskResult.masked,
    privacyStatus,
    masksAppliedCount: totalMasks,
  };
}
