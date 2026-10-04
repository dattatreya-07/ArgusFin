import { DecisionInput } from './types';
import { computeAnnualised } from './calc';
import { RULE_THRESHOLDS } from './thresholds';
import * as enLex from './lexicon/en';
import * as hiLex from './lexicon/hi';
import * as taLex from './lexicon/ta';

export type RuleId =
  | 'GUARANTEED_RETURN'
  | 'RETURN_TOO_HIGH'
  | 'URGENCY_LIMITED_SLOTS'
  | 'ASKS_OTP_OR_APP_INSTALL'
  | 'PAY_TO_PERSONAL_ACCOUNT_OR_UPI'
  | 'VIP_GROUP_OR_PRIVATE_CHANNEL'
  | 'UNVERIFIABLE_REGISTRATION_CLAIM'
  | 'SCREENSHOT_PROFIT_PROOF'
  | 'COURSE_OR_MENTORSHIP_UPSELL'
  | 'SUSPICIOUS_LOAN_OFFER'
  | 'SUSPICIOUS_SHORT_LINK'
  | 'EMAIL_SENDER_SPOOFING_MISMATCH'
  | 'EMAIL_REPLYTO_MISMATCH'
  | 'EMAIL_LINK_DESTINATION_MISMATCH';

export type RuleSeverity = 'critical' | 'high' | 'medium';

export interface RuleResult {
  ruleId: RuleId;
  triggered: boolean;
  score: number; // 0..1
  severity: RuleSeverity;
  reasonKey: string;
  matchedSpans?: string[];
}

export interface RuleDefinition {
  id: RuleId;
  name: string;
  severity: RuleSeverity;
  evaluate: (input: DecisionInput) => RuleResult;
}

const ALL_PROFIT_PROOF = [...enLex.EN_PROFIT_PROOF, ...hiLex.HI_PROFIT_PROOF, ...taLex.TA_PROFIT_PROOF];
const ALL_COURSE_UPSELL = [...enLex.EN_COURSE_UPSELL, ...hiLex.HI_COURSE_UPSELL, ...taLex.TA_COURSE_UPSELL];

export const RULE_DEFINITIONS: Record<RuleId, RuleDefinition> = {
  GUARANTEED_RETURN: {
    id: 'GUARANTEED_RETURN',
    name: 'Guaranteed or Assured Return Claim',
    severity: RULE_THRESHOLDS.SEVERITIES.GUARANTEED_RETURN,
    evaluate: (input: DecisionInput) => {
      const lower = input.maskedText.toLowerCase();

      // Educational & Banking Product Safeguard
      const isEducationalContext =
        /\b(fixed deposit|fd|g-sec|government securities|sovereign guarantee|backed by rbi|set by banks|learned in|literacy class|article about|news report|why do scammers|how to identify|what is a guaranteed|what is fd|what are g-secs)\b/i.test(
          lower
        ) || /\b(do not|never|don't|scammers|phishing)\b/i.test(lower);

      const hasGuaranteedClaim = input.claims.promisedReturns.some((r) => r.guaranteed === true);
      const hasGuaranteedWord =
        !isEducationalContext &&
        (hasGuaranteedClaim ||
          [...enLex.EN_GUARANTEED, ...hiLex.HI_GUARANTEED, ...taLex.TA_GUARANTEED].some((w) =>
            lower.includes(w.toLowerCase())
          ));

      return {
        ruleId: 'GUARANTEED_RETURN',
        triggered: hasGuaranteedWord,
        score: hasGuaranteedWord ? RULE_THRESHOLDS.WEIGHTS.critical : 0,
        severity: RULE_THRESHOLDS.SEVERITIES.GUARANTEED_RETURN,
        reasonKey: 'rules.GUARANTEED_RETURN',
      };
    },
  },

  RETURN_TOO_HIGH: {
    id: 'RETURN_TOO_HIGH',
    name: 'Mathematically Unsustainable Return Promise',
    severity: RULE_THRESHOLDS.SEVERITIES.RETURN_TOO_HIGH,
    evaluate: (input: DecisionInput) => {
      const lower = input.maskedText.toLowerCase();
      const isEducationalContext =
        /\b(learned in|literacy class|article about|news report|warning about|why do scammers|how to identify|what would|what is a|calculate)\b/i.test(
          lower
        );

      let triggered = false;

      if (!isEducationalContext) {
        for (const pr of input.claims.promisedReturns) {
          if (pr.multiple && pr.durationDays) {
            const calc = computeAnnualised({
              invested: 10000,
              payout: 10000 * pr.multiple,
              durationDays: pr.durationDays,
            });

            if (
              calc.success &&
              (calc.tier === 4 || calc.annualisedMultiple > RULE_THRESHOLDS.RETURN_TOO_HIGH_MULTIPLE || calc.overflow)
            ) {
              triggered = true;
              break;
            }
          }
        }
      }

      return {
        ruleId: 'RETURN_TOO_HIGH',
        triggered,
        score: triggered ? RULE_THRESHOLDS.WEIGHTS.critical : 0,
        severity: RULE_THRESHOLDS.SEVERITIES.RETURN_TOO_HIGH,
        reasonKey: 'rules.RETURN_TOO_HIGH',
      };
    },
  },

  URGENCY_LIMITED_SLOTS: {
    id: 'URGENCY_LIMITED_SLOTS',
    name: 'Artificial Urgency or Limited Slots Pressure',
    severity: RULE_THRESHOLDS.SEVERITIES.URGENCY_LIMITED_SLOTS,
    evaluate: (input: DecisionInput) => {
      const triggered = input.claims.urgencyPhrases.length > 0;
      return {
        ruleId: 'URGENCY_LIMITED_SLOTS',
        triggered,
        score: triggered ? RULE_THRESHOLDS.WEIGHTS.medium : 0,
        severity: RULE_THRESHOLDS.SEVERITIES.URGENCY_LIMITED_SLOTS,
        reasonKey: 'rules.URGENCY_LIMITED_SLOTS',
        matchedSpans: input.claims.urgencyPhrases.slice(0, 3),
      };
    },
  },

  ASKS_OTP_OR_APP_INSTALL: {
    id: 'ASKS_OTP_OR_APP_INSTALL',
    name: 'Request for OTP or Remote App / APK Installation',
    severity: RULE_THRESHOLDS.SEVERITIES.ASKS_OTP_OR_APP_INSTALL,
    evaluate: (input: DecisionInput) => {
      const lower = input.maskedText.toLowerCase();
      const isEducationalQuestion =
        /\b(what are|why do|how do|explain|what is|phishing techniques|literacy class)\b/i.test(lower) &&
        !/\b(share otp|enter otp|send otp|download app|install apk|give pin)\b/i.test(lower);

      const triggered =
        !isEducationalQuestion &&
        (input.claims.requests.includes('OTP') || input.claims.requests.includes('APP_INSTALL'));

      return {
        ruleId: 'ASKS_OTP_OR_APP_INSTALL',
        triggered,
        score: triggered ? RULE_THRESHOLDS.WEIGHTS.critical : 0,
        severity: RULE_THRESHOLDS.SEVERITIES.ASKS_OTP_OR_APP_INSTALL,
        reasonKey: 'rules.ASKS_OTP_OR_APP_INSTALL',
      };
    },
  },

  PAY_TO_PERSONAL_ACCOUNT_OR_UPI: {
    id: 'PAY_TO_PERSONAL_ACCOUNT_OR_UPI',
    name: 'Request to Pay Personal Account, Phone, or UPI ID',
    severity: RULE_THRESHOLDS.SEVERITIES.PAY_TO_PERSONAL_ACCOUNT_OR_UPI,
    evaluate: (input: DecisionInput) => {
      const triggered = input.claims.requests.includes('PERSONAL_ACCOUNT');
      return {
        ruleId: 'PAY_TO_PERSONAL_ACCOUNT_OR_UPI',
        triggered,
        score: triggered ? RULE_THRESHOLDS.WEIGHTS.high : 0,
        severity: RULE_THRESHOLDS.SEVERITIES.PAY_TO_PERSONAL_ACCOUNT_OR_UPI,
        reasonKey: 'rules.PAY_TO_PERSONAL_ACCOUNT_OR_UPI',
      };
    },
  },

  VIP_GROUP_OR_PRIVATE_CHANNEL: {
    id: 'VIP_GROUP_OR_PRIVATE_CHANNEL',
    name: 'Direction to Join Private VIP Telegram/WhatsApp Group',
    severity: RULE_THRESHOLDS.SEVERITIES.VIP_GROUP_OR_PRIVATE_CHANNEL,
    evaluate: (input: DecisionInput) => {
      const triggered = input.claims.requests.includes('GROUP_JOIN');
      return {
        ruleId: 'VIP_GROUP_OR_PRIVATE_CHANNEL',
        triggered,
        score: triggered ? RULE_THRESHOLDS.WEIGHTS.medium : 0,
        severity: RULE_THRESHOLDS.SEVERITIES.VIP_GROUP_OR_PRIVATE_CHANNEL,
        reasonKey: 'rules.VIP_GROUP_OR_PRIVATE_CHANNEL',
      };
    },
  },

  UNVERIFIABLE_REGISTRATION_CLAIM: {
    id: 'UNVERIFIABLE_REGISTRATION_CLAIM',
    name: 'Claim of Regulatory Registration That Could Not Be Verified',
    severity: RULE_THRESHOLDS.SEVERITIES.UNVERIFIABLE_REGISTRATION_CLAIM,
    evaluate: (input: DecisionInput) => {
      const triggered = input.claims.registrationClaims.length > 0;
      return {
        ruleId: 'UNVERIFIABLE_REGISTRATION_CLAIM',
        triggered,
        score: triggered ? RULE_THRESHOLDS.WEIGHTS.high : 0,
        severity: RULE_THRESHOLDS.SEVERITIES.UNVERIFIABLE_REGISTRATION_CLAIM,
        reasonKey: 'rules.UNVERIFIABLE_REGISTRATION_CLAIM',
      };
    },
  },

  SCREENSHOT_PROFIT_PROOF: {
    id: 'SCREENSHOT_PROFIT_PROOF',
    name: 'Use of Profit Screenshots as Proof',
    severity: RULE_THRESHOLDS.SEVERITIES.SCREENSHOT_PROFIT_PROOF,
    evaluate: (input: DecisionInput) => {
      const lower = input.maskedText.toLowerCase();
      const triggered = ALL_PROFIT_PROOF.some((phrase) => lower.includes(phrase.toLowerCase()));
      return {
        ruleId: 'SCREENSHOT_PROFIT_PROOF',
        triggered,
        score: triggered ? RULE_THRESHOLDS.WEIGHTS.medium : 0,
        severity: RULE_THRESHOLDS.SEVERITIES.SCREENSHOT_PROFIT_PROOF,
        reasonKey: 'rules.SCREENSHOT_PROFIT_PROOF',
      };
    },
  },

  COURSE_OR_MENTORSHIP_UPSELL: {
    id: 'COURSE_OR_MENTORSHIP_UPSELL',
    name: 'High-Priced Trading Course or Mentorship Pitch',
    severity: RULE_THRESHOLDS.SEVERITIES.COURSE_OR_MENTORSHIP_UPSELL,
    evaluate: (input: DecisionInput) => {
      const lower = input.maskedText.toLowerCase();
      const triggered = ALL_COURSE_UPSELL.some((phrase) => lower.includes(phrase.toLowerCase()));
      return {
        ruleId: 'COURSE_OR_MENTORSHIP_UPSELL',
        triggered,
        score: triggered ? RULE_THRESHOLDS.WEIGHTS.medium : 0,
        severity: RULE_THRESHOLDS.SEVERITIES.COURSE_OR_MENTORSHIP_UPSELL,
        reasonKey: 'rules.COURSE_OR_MENTORSHIP_UPSELL',
      };
    },
  },

  SUSPICIOUS_LOAN_OFFER: {
    id: 'SUSPICIOUS_LOAN_OFFER',
    name: 'Unsolicited Pre-Approved Loan Offer',
    severity: 'critical',
    evaluate: (input: DecisionInput) => {
      const triggered = input.claims.requests.includes('LOAN_OFFER');
      return {
        ruleId: 'SUSPICIOUS_LOAN_OFFER',
        triggered,
        score: triggered ? 0.9 : 0,
        severity: 'critical',
        reasonKey: 'rules.SUSPICIOUS_LOAN_OFFER',
      };
    },
  },

  SUSPICIOUS_SHORT_LINK: {
    id: 'SUSPICIOUS_SHORT_LINK',
    name: 'Suspicious Shortened Link',
    severity: 'high',
    evaluate: (input: DecisionInput) => {
      const triggered = input.claims.requests.includes('SHORT_LINK');
      return {
        ruleId: 'SUSPICIOUS_SHORT_LINK',
        triggered,
        score: triggered ? 0.7 : 0,
        severity: 'high',
        reasonKey: 'rules.SUSPICIOUS_SHORT_LINK',
      };
    },
  },

  EMAIL_SENDER_SPOOFING_MISMATCH: {
    id: 'EMAIL_SENDER_SPOOFING_MISMATCH',
    name: 'Email Sender Display-Name Brand Spoofing Mismatch',
    severity: 'high',
    evaluate: (input: DecisionInput) => {
      const triggered = input.maskedText.includes('[Signal: Display name claims authority brand');
      return {
        ruleId: 'EMAIL_SENDER_SPOOFING_MISMATCH',
        triggered,
        score: triggered ? 0.8 : 0,
        severity: 'high',
        reasonKey: 'rules.EMAIL_SENDER_SPOOFING_MISMATCH',
      };
    },
  },

  EMAIL_REPLYTO_MISMATCH: {
    id: 'EMAIL_REPLYTO_MISMATCH',
    name: 'Email Reply-To Domain Differs From Sender Domain',
    severity: 'high',
    evaluate: (input: DecisionInput) => {
      const triggered = input.maskedText.includes('[Signal: Reply-To domain differs');
      return {
        ruleId: 'EMAIL_REPLYTO_MISMATCH',
        triggered,
        score: triggered ? 0.8 : 0,
        severity: 'high',
        reasonKey: 'rules.EMAIL_REPLYTO_MISMATCH',
      };
    },
  },

  EMAIL_LINK_DESTINATION_MISMATCH: {
    id: 'EMAIL_LINK_DESTINATION_MISMATCH',
    name: 'HTML Anchor Visible Text vs Destination URL Mismatch',
    severity: 'high',
    evaluate: (input: DecisionInput) => {
      const triggered = input.maskedText.includes('[Signal Link Destination Mismatch');
      return {
        ruleId: 'EMAIL_LINK_DESTINATION_MISMATCH',
        triggered,
        score: triggered ? 0.9 : 0,
        severity: 'high',
        reasonKey: 'rules.EMAIL_LINK_DESTINATION_MISMATCH',
      };
    },
  },
};

export function evaluateRegisteredRules(input: DecisionInput): RuleResult[] {
  const results: RuleResult[] = [];
  for (const ruleDef of Object.values(RULE_DEFINITIONS)) {
    const res = ruleDef.evaluate(input);
    if (res.triggered) {
      results.push(res);
    }
  }
  return results;
}

