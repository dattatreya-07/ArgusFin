import { describe, expect, it } from 'vitest';
import { fuseDecisionAndRules } from './fuse';
import { Decision } from './types';
import { RuleResult } from './rules';

describe('fuseDecisionAndRules', () => {
  const baseDecision: Decision = {
    archetype: {
      DOUBLING_SCHEME: 0.8,
      COPY_TRADING: 0.05,
      COURSE_FINFLUENCER: 0.05,
      CRYPTO_STAKING_MINING: 0.02,
      FAKE_TRADING_APP_OR_PORTAL: 0.02,
      FAKE_ADVISORY_OR_REG_CLAIM: 0.02,
      PUMP_AND_DUMP_GROUP: 0.02,
      REMOTE_ACCESS_SCAM: 0.01,
      FAKE_IPO_OR_ALLOTMENT: 0.01,
      PRE_APPROVED_LOAN_SCAM: 0.0,
      OTHER_SUSPICIOUS_FINANCIAL_PATTERN: 0.0,
      OTHER_OR_NONE: 0.0,
    },
    riskBand: {
      HIGH: 0.85,
      MEDIUM: 0.1,
      LOW_SIGNALS: 0.05,
      CANNOT_VERIFY: 0.0,
    },
    urgency: 0.8,
    confidence: 0.8,
    engine: 'llm-fallback',
  };

  it('fuses critical rules with decision to HIGH risk band', () => {
    const rules: RuleResult[] = [
      {
        ruleId: 'RETURN_TOO_HIGH',
        triggered: true,
        score: 0.9,
        severity: 'critical',
        reasonKey: 'rules.RETURN_TOO_HIGH',
      },
    ];

    const result = fuseDecisionAndRules(rules, baseDecision);
    expect(result.finalBand).toBe('HIGH');
    expect(result.topArchetype.top).toBe('DOUBLING_SCHEME');
    expect(result.topArchetype.prob).toBe(0.8);
  });

  it('selects CANNOT_VERIFY when confidence < 0.5 and no rules fire', () => {
    const lowConfDecision: Decision = {
      ...baseDecision,
      riskBand: { HIGH: 0.1, MEDIUM: 0.2, LOW_SIGNALS: 0.3, CANNOT_VERIFY: 0.4 },
      confidence: 0.3,
      engine: 'rules-only',
    };

    const result = fuseDecisionAndRules([], lowConfDecision);
    expect(result.finalBand).toBe('CANNOT_VERIFY');
  });

  it('never outputs safe; lowest band is LOW_SIGNALS or CANNOT_VERIFY', () => {
    const benignDecision: Decision = {
      ...baseDecision,
      riskBand: { HIGH: 0.0, MEDIUM: 0.05, LOW_SIGNALS: 0.85, CANNOT_VERIFY: 0.1 },
      confidence: 0.7,
      engine: 'llm-fallback',
    };

    const result = fuseDecisionAndRules([], benignDecision);
    expect(result.finalBand).toBe('LOW_SIGNALS');
    expect((result.finalBand as string).toLowerCase()).not.toBe('safe');
  });
});
