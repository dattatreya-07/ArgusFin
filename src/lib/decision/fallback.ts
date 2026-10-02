import { Decision, DecisionEngine, DecisionInput } from '../types';

export class FallbackDecisionEngine implements DecisionEngine {
  async decide(_input: DecisionInput): Promise<Decision> {
    throw new Error('NOT_IMPLEMENTED: LLM fallback decision engine will be wired in Phase 1.');
  }
}
