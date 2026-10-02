import { Archetype, Decision, DecisionEngine, DecisionInput, RiskBand } from '../types';

export class RulesOnlyDecisionEngine implements DecisionEngine {
  async decide(_input: DecisionInput): Promise<Decision> {
    const archetype: Record<Archetype, number> = {
      DOUBLING_SCHEME: 0,
      COPY_TRADING: 0,
      COURSE_FINFLUENCER: 0,
      CRYPTO_STAKING_MINING: 0,
      FAKE_TRADING_APP_OR_PORTAL: 0,
      FAKE_ADVISORY_OR_REG_CLAIM: 0,
      PUMP_AND_DUMP_GROUP: 0,
      REMOTE_ACCESS_SCAM: 0,
      FAKE_IPO_OR_ALLOTMENT: 0,
      OTHER_OR_NONE: 1.0,
    };

    const riskBand: Record<RiskBand, number> = {
      HIGH: 0,
      MEDIUM: 0,
      LOW_SIGNALS: 0,
      CANNOT_VERIFY: 1.0,
    };

    return {
      archetype,
      riskBand,
      urgency: 0.0,
      confidence: 0.2, // Conservative low confidence cap
      engine: 'rules-only',
    };
  }
}
