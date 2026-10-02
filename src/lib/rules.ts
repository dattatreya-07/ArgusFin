import { DecisionInput } from './types';

export type RuleId =
  | 'GUARANTEED_RETURN'
  | 'RETURN_TOO_HIGH'
  | 'URGENCY_LIMITED_SLOTS'
  | 'ASKS_OTP_OR_APP_INSTALL'
  | 'PAY_TO_PERSONAL_ACCOUNT_OR_UPI'
  | 'VIP_GROUP_OR_PRIVATE_CHANNEL'
  | 'UNVERIFIABLE_REGISTRATION_CLAIM'
  | 'LOOKALIKE_DOMAIN'
  | 'NEW_DOMAIN'
  | 'SCREENSHOT_PROFIT_PROOF'
  | 'COURSE_OR_MENTORSHIP_UPSELL';

export interface RuleResult {
  ruleId: RuleId;
  triggered: boolean;
  score: number; // 0..1
  reason?: string;
}

export interface RuleDefinition {
  id: RuleId;
  name: string;
  evaluate: (input: DecisionInput) => Promise<RuleResult> | RuleResult;
}

/**
 * Empty Rule Registry for Phase 0.
 * Concrete keyword and signal matching rules will be implemented in Phase 1.
 */
export const RULE_REGISTRY: Record<RuleId, RuleDefinition | null> = {
  GUARANTEED_RETURN: null,
  RETURN_TOO_HIGH: null,
  URGENCY_LIMITED_SLOTS: null,
  ASKS_OTP_OR_APP_INSTALL: null,
  PAY_TO_PERSONAL_ACCOUNT_OR_UPI: null,
  VIP_GROUP_OR_PRIVATE_CHANNEL: null,
  UNVERIFIABLE_REGISTRATION_CLAIM: null,
  LOOKALIKE_DOMAIN: null,
  NEW_DOMAIN: null,
  SCREENSHOT_PROFIT_PROOF: null,
  COURSE_OR_MENTORSHIP_UPSELL: null,
};

export function evaluateRegisteredRules(_input: DecisionInput): RuleResult[] {
  // Phase 0: Returns empty triggered rule results
  return [];
}
