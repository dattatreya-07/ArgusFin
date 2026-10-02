import { Decision, DecisionEngine, DecisionInput } from '../types';
import { FallbackDecisionEngine } from './fallback';
import { JevDecisionEngine } from './jev';
import { RulesOnlyDecisionEngine } from './rulesOnly';

export interface DecisionEngineOptions {
  timeoutMs?: number;
}

const DEFAULT_TIMEOUT_MS = 3000;

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Operation timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    promise
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

export class CompositeDecisionEngine implements DecisionEngine {
  private jevEngine = new JevDecisionEngine();
  private fallbackEngine = new FallbackDecisionEngine();
  private rulesOnlyEngine = new RulesOnlyDecisionEngine();
  private timeoutMs: number;

  constructor(options?: DecisionEngineOptions) {
    this.timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  }

  async decide(input: DecisionInput): Promise<Decision> {
    const configuredEngine = process.env.DECISION_ENGINE?.toLowerCase().trim() || 'rules';

    if (configuredEngine === 'rules') {
      return this.rulesOnlyEngine.decide(input);
    }

    if (configuredEngine === 'fallback') {
      try {
        return await withTimeout(this.fallbackEngine.decide(input), this.timeoutMs);
      } catch {
        return this.rulesOnlyEngine.decide(input);
      }
    }

    // Default or 'jev': Attempt Jev -> on error/timeout use Fallback -> on error/timeout use RulesOnly
    try {
      return await withTimeout(this.jevEngine.decide(input), this.timeoutMs);
    } catch {
      try {
        return await withTimeout(this.fallbackEngine.decide(input), this.timeoutMs);
      } catch {
        return this.rulesOnlyEngine.decide(input);
      }
    }
  }
}

export const defaultDecisionEngine = new CompositeDecisionEngine();
