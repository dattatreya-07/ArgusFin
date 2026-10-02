import { Archetype, Decision, DecisionEngine, DecisionInput, RiskBand } from '../types';
import { evaluateRegisteredRules } from '../rules';
import { ARCHETYPE_KEYWORDS } from '../lexicon/archetypes';

const ALL_ARCHETYPES: Archetype[] = [
  'DOUBLING_SCHEME',
  'COPY_TRADING',
  'COURSE_FINFLUENCER',
  'CRYPTO_STAKING_MINING',
  'FAKE_TRADING_APP_OR_PORTAL',
  'FAKE_ADVISORY_OR_REG_CLAIM',
  'PUMP_AND_DUMP_GROUP',
  'REMOTE_ACCESS_SCAM',
  'FAKE_IPO_OR_ALLOTMENT',
  'OTHER_OR_NONE',
];

export class RulesOnlyDecisionEngine implements DecisionEngine {
  async decide(input: DecisionInput): Promise<Decision> {
    const firedRules = evaluateRegisteredRules(input);
    const lower = input.maskedText.toLowerCase();

    // 1. Archetype Scoring via Lexical Hints + Fired Rules
    const rawScores: Record<Archetype, number> = {
      DOUBLING_SCHEME: 0.05,
      COPY_TRADING: 0.05,
      COURSE_FINFLUENCER: 0.05,
      CRYPTO_STAKING_MINING: 0.05,
      FAKE_TRADING_APP_OR_PORTAL: 0.05,
      FAKE_ADVISORY_OR_REG_CLAIM: 0.05,
      PUMP_AND_DUMP_GROUP: 0.05,
      REMOTE_ACCESS_SCAM: 0.05,
      FAKE_IPO_OR_ALLOTMENT: 0.05,
      OTHER_OR_NONE: 0.1,
    };

    // Keyword hits with explicit archetype priority
    for (const [arch, keywords] of Object.entries(ARCHETYPE_KEYWORDS)) {
      const archetypeKey = arch as Archetype;
      for (const kw of keywords) {
        if (lower.includes(kw.toLowerCase())) {
          // Specific investment vector archetypes get high keyword confidence
          if (archetypeKey === 'COPY_TRADING' || archetypeKey === 'CRYPTO_STAKING_MINING' || archetypeKey === 'FAKE_IPO_OR_ALLOTMENT') {
            rawScores[archetypeKey] += 1.2;
          } else if (archetypeKey === 'COURSE_FINFLUENCER' || archetypeKey === 'REMOTE_ACCESS_SCAM') {
            rawScores[archetypeKey] += 1.0;
          } else {
            rawScores[archetypeKey] += 0.6;
          }
        }
      }
    }

    // Rule heuristics for archetypes
    for (const rule of firedRules) {
      if (rule.ruleId === 'RETURN_TOO_HIGH' || rule.ruleId === 'GUARANTEED_RETURN') {
        // High returns reinforce doubling schemes unless already dominated by a specialized model like copy trading
        rawScores.DOUBLING_SCHEME += 0.4;
      }
      if (rule.ruleId === 'ASKS_OTP_OR_APP_INSTALL') {
        if (lower.includes('anydesk') || lower.includes('teamviewer') || lower.includes('rustdesk')) {
          rawScores.REMOTE_ACCESS_SCAM += 1.2;
        } else {
          rawScores.FAKE_TRADING_APP_OR_PORTAL += 0.4;
        }
      }
      if (rule.ruleId === 'VIP_GROUP_OR_PRIVATE_CHANNEL') {
        rawScores.PUMP_AND_DUMP_GROUP += 0.3;
        rawScores.FAKE_ADVISORY_OR_REG_CLAIM += 0.2;
      }
      if (rule.ruleId === 'COURSE_OR_MENTORSHIP_UPSELL') {
        rawScores.COURSE_FINFLUENCER += 0.8;
      }
      if (rule.ruleId === 'UNVERIFIABLE_REGISTRATION_CLAIM') {
        rawScores.FAKE_ADVISORY_OR_REG_CLAIM += 0.6;
      }
    }

    // If no red flag rules fired, prioritize OTHER_OR_NONE
    if (firedRules.length === 0) {
      rawScores.OTHER_OR_NONE += 1.5;
    }

    // Normalise archetype probabilities
    const totalScore = Object.values(rawScores).reduce((a, b) => a + b, 0);
    const archetypeProbabilities: Record<Archetype, number> = {} as Record<Archetype, number>;
    for (const arch of ALL_ARCHETYPES) {
      archetypeProbabilities[arch] = parseFloat((rawScores[arch] / totalScore).toFixed(4));
    }

    // 2. RiskBand Probabilities
    const hasCritical = firedRules.some((r) => r.severity === 'critical');
    const hasHigh = firedRules.some((r) => r.severity === 'high');
    const hasMedium = firedRules.some((r) => r.severity === 'medium');

    let riskBand: Record<RiskBand, number>;
    let confidence: number;
    let urgency = 0.1;

    if (hasCritical) {
      riskBand = { HIGH: 0.85, MEDIUM: 0.1, LOW_SIGNALS: 0.05, CANNOT_VERIFY: 0.0 };
      confidence = 0.6; // capped for limited mode
      urgency = 0.8;
    } else if (hasHigh) {
      riskBand = { HIGH: 0.55, MEDIUM: 0.35, LOW_SIGNALS: 0.1, CANNOT_VERIFY: 0.0 };
      confidence = 0.5;
      urgency = 0.5;
    } else if (hasMedium) {
      riskBand = { HIGH: 0.15, MEDIUM: 0.65, LOW_SIGNALS: 0.2, CANNOT_VERIFY: 0.0 };
      confidence = 0.45;
      urgency = 0.4;
    } else {
      // Benign educational or low signal text
      if (input.maskedText.trim().length > 15) {
        riskBand = { HIGH: 0.0, MEDIUM: 0.05, LOW_SIGNALS: 0.8, CANNOT_VERIFY: 0.15 };
        confidence = 0.4;
      } else {
        riskBand = { HIGH: 0.0, MEDIUM: 0.05, LOW_SIGNALS: 0.2, CANNOT_VERIFY: 0.75 };
        confidence = 0.3;
      }
    }

    return {
      archetype: archetypeProbabilities,
      riskBand,
      urgency,
      confidence,
      engine: 'rules-only',
    };
  }
}
