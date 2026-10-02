/**
 * Centralized Thresholds and Severity Weights for Rules Engine and Scoring
 */

export const RULE_THRESHOLDS = {
  // Annualised multiple above which RETURN_TOO_HIGH triggers (Tier 4)
  RETURN_TOO_HIGH_MULTIPLE: 100,

  // Severity definitions per rule
  SEVERITIES: {
    GUARANTEED_RETURN: 'critical' as const,
    RETURN_TOO_HIGH: 'critical' as const,
    ASKS_OTP_OR_APP_INSTALL: 'critical' as const,
    PAY_TO_PERSONAL_ACCOUNT_OR_UPI: 'high' as const,
    UNVERIFIABLE_REGISTRATION_CLAIM: 'high' as const,
    VIP_GROUP_OR_PRIVATE_CHANNEL: 'medium' as const,
    URGENCY_LIMITED_SLOTS: 'medium' as const,
    SCREENSHOT_PROFIT_PROOF: 'medium' as const,
    COURSE_OR_MENTORSHIP_UPSELL: 'medium' as const,
  },

  // Weight scores (0..1) for composite scoring
  WEIGHTS: {
    critical: 0.9,
    high: 0.6,
    medium: 0.35,
  },
};
