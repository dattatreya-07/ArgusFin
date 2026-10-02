import { Decision, DecisionEngine, DecisionInput } from '../types';

export class JevDecisionEngine implements DecisionEngine {
  async decide(_input: DecisionInput): Promise<Decision> {
    throw new Error('NOT_IMPLEMENTED: Jev decision engine adapter is pending API access in Phase 0.');
  }
}
