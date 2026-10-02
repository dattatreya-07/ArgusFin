import { Archetype, Decision, RiskBand } from './types';
import { RuleResult } from './rules';

const BAND_SEVERITY_ORDER: Record<RiskBand, number> = {
  HIGH: 4,
  MEDIUM: 3,
  LOW_SIGNALS: 2,
  CANNOT_VERIFY: 1,
};

export interface FusionResult {
  finalBand: RiskBand;
  topArchetype: {
    top: Archetype;
    prob: number;
  };
  confidence: number;
  ruleDerivedBand: RiskBand;
  decisionTopBand: RiskBand;
}

export function fuseDecisionAndRules(
  rules: RuleResult[],
  decision: Decision
): FusionResult {
  // 1. Determine Rule-Derived Risk Band
  let ruleDerivedBand: RiskBand = 'CANNOT_VERIFY';
  const hasCritical = rules.some((r) => r.severity === 'critical');
  const hasHigh = rules.some((r) => r.severity === 'high');
  const hasMedium = rules.some((r) => r.severity === 'medium');

  if (hasCritical || hasHigh) {
    ruleDerivedBand = 'HIGH';
  } else if (hasMedium) {
    ruleDerivedBand = 'MEDIUM';
  } else {
    ruleDerivedBand = 'LOW_SIGNALS';
  }

  // 2. Determine Decision Engine's Top Band
  let decisionTopBand: RiskBand = 'CANNOT_VERIFY';
  let maxBandProb = -1;
  for (const [band, prob] of Object.entries(decision.riskBand)) {
    if (prob > maxBandProb) {
      maxBandProb = prob;
      decisionTopBand = band as RiskBand;
    }
  }

  // 3. Determine Top Archetype
  let topArchetypeKey: Archetype = 'OTHER_OR_NONE';
  let maxArchProb = -1;
  for (const [arch, prob] of Object.entries(decision.archetype)) {
    if (prob > maxArchProb) {
      maxArchProb = prob;
      topArchetypeKey = arch as Archetype;
    }
  }

  // 4. Fusion Resolution
  let finalBand: RiskBand;

  // Max severity between rule band and decision top band
  if (BAND_SEVERITY_ORDER[ruleDerivedBand] >= BAND_SEVERITY_ORDER[decisionTopBand]) {
    finalBand = ruleDerivedBand;
  } else {
    finalBand = decisionTopBand;
  }

  // Special constraint: if decision confidence < 0.5 and no rules fired -> CANNOT_VERIFY
  if (rules.length === 0 && decision.confidence < 0.5) {
    finalBand = 'CANNOT_VERIFY';
  } else if (rules.length === 0 && (finalBand === 'CANNOT_VERIFY' || finalBand === 'LOW_SIGNALS')) {
    finalBand = 'LOW_SIGNALS';
  }

  return {
    finalBand,
    topArchetype: {
      top: topArchetypeKey,
      prob: Math.min(1, Math.max(0, maxArchProb)),
    },
    confidence: decision.confidence,
    ruleDerivedBand,
    decisionTopBand,
  };
}
