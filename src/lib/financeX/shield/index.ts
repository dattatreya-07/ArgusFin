import { analyzeScam } from '@/lib/scam/analyze';
import { CanonicalInput, AnalysisResult } from '@/lib/scam/types';
import { ShieldAnalysis, Lang } from '../types';

export class ArgusFinShieldEngine {
  /**
   * Facade method delegating directly to the canonical ArgusFin scam analysis pipeline.
   * Preserves full multi-stage safety: Privacy -> Semantic -> Evidence -> Deterministic Safety -> RAG -> Explanation.
   */
  public async analyze(input: CanonicalInput): Promise<AnalysisResult> {
    return await analyzeScam(input);
  }

  /**
   * Returns a structured FinanceX Shield analysis summary from an AnalysisResult.
   */
  public toShieldAnalysis(id: string, result: AnalysisResult, lang: Lang): ShieldAnalysis {
    return {
      id,
      timestamp: result.provenance.timestamp,
      language: lang,
      archetype: result.decision.archetype.top,
      riskBand: result.decision.band,
      confidence: result.decision.confidence,
    };
  }
}

export const argusFinShield = new ArgusFinShieldEngine();

// Re-export canonical functions and types for FinanceX Shield users
export { analyzeScam };
export type { CanonicalInput, AnalysisResult };
