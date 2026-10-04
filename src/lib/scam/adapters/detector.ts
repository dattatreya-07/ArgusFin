import { maskPII } from '@/lib/mask';
import { extractClaims } from '@/lib/extract';
import { extractAllSignals } from '@/lib/signals';
import { evaluateRegisteredRules } from '@/lib/rules';
import { defaultDecisionEngine } from '@/lib/decision';
import { fuseDecisionAndRules, FusionResult } from '@/lib/fuse';
import { DecisionInput, ExtractedClaims, Lang, Signal } from '@/lib/types';
import { RuleResult } from '@/lib/rules';

export interface DetectorAdapterResult {
  fusion: FusionResult;
  flags: RuleResult[];
  claims: ExtractedClaims;
  signals: Signal[];
  engineName: string;
}

export async function runDetectorAdapter(
  sanitizedText: string,
  lang: Lang
): Promise<DetectorAdapterResult> {
  // 1. Extra defense-in-depth server masking
  const serverMasked = maskPII(sanitizedText).masked;

  // 2. Deterministic claim & signal extraction
  const claims = extractClaims(serverMasked, lang);
  const extractedSignalSet = await extractAllSignals(serverMasked, { enableRdap: false });

  const decisionInput: DecisionInput = {
    maskedText: serverMasked,
    claims,
    signals: extractedSignalSet.signals,
    lang,
  };

  // 3. Evaluate rules
  const flags = evaluateRegisteredRules(decisionInput);

  // 4. Run Decision Engine with fallback
  let decision;
  let engineName = 'jev';

  try {
    decision = await defaultDecisionEngine.decide(decisionInput);
    engineName = decision.engine;
  } catch {
    const { RulesOnlyDecisionEngine } = await import('@/lib/decision/rulesOnly');
    const rulesOnlyEngine = new RulesOnlyDecisionEngine();
    decision = await rulesOnlyEngine.decide(decisionInput);
    engineName = 'rules-only';
  }

  // 5. Fuse Decision & Rules
  const fusion = fuseDecisionAndRules(flags, decision);

  return {
    fusion,
    flags,
    claims,
    signals: extractedSignalSet.signals,
    engineName,
  };
}
