import { NormalizedChannelMessage, ChannelCheckResult } from './types';
import { maskPII } from '../mask';
import { extractClaims } from '../extract';
import { extractAllSignals } from '../signals';
import { evaluateRegisteredRules } from '../rules';
import { defaultDecisionEngine } from '../decision';
import { fuseDecisionAndRules } from '../fuse';
import { DecisionInput, Lang } from '../types';
import enMessages from '../../../locales/en.json';
import hiMessages from '../../../locales/hi.json';
import taMessages from '../../../locales/ta.json';

const messagesMap: Record<Lang, typeof enMessages> = {
  en: enMessages,
  hi: hiMessages as unknown as typeof enMessages,
  ta: taMessages as unknown as typeof enMessages,
};

/**
 * Shared core scam check service.
 * Executed identically for Web UI, PWA Share Target, and Telegram Bot Adapter.
 * Guarantees 100% decision and threshold parity across all channels.
 */
export async function checkChannelContent(
  normalized: NormalizedChannelMessage
): Promise<ChannelCheckResult> {
  const startTime = Date.now();
  const lang = normalized.language;

  // 1. Client & Server Privacy Screening / PII Masking
  const maskResult = maskPII(normalized.normalizedText);
  const sanitizedText = maskResult.masked;

  // 2. Deterministic Extraction & Signals Pipeline
  const claims = extractClaims(sanitizedText, lang);
  const extractedSignalSet = await extractAllSignals(sanitizedText, { enableRdap: true });

  const decisionInput: DecisionInput = {
    maskedText: sanitizedText,
    claims,
    signals: extractedSignalSet.signals,
    lang,
  };

  // 3. Rules Evaluation
  const flags = evaluateRegisteredRules(decisionInput);

  // 4. Decision Engine Execution (with automatic fallback to RulesOnly)
  let decision;
  try {
    decision = await defaultDecisionEngine.decide(decisionInput);
  } catch {
    const { RulesOnlyDecisionEngine } = await import('../decision/rulesOnly');
    const rulesOnlyEngine = new RulesOnlyDecisionEngine();
    decision = await rulesOnlyEngine.decide(decisionInput);
  }

  // 5. Decision & Rules Fusion
  const fusion = fuseDecisionAndRules(flags, decision);

  // 6. Explanations and Unverified checklist
  const localeStrings = messagesMap[lang] || enMessages;
  const ruleExplanations = flags
    .map((f) => {
      const ruleKey = f.ruleId as keyof typeof localeStrings.rules;
      return localeStrings.rules[ruleKey] || '';
    })
    .filter(Boolean);

  const fixedNote = localeStrings.results.explanationNote;
  const explanation =
    ruleExplanations.length > 0
      ? `${ruleExplanations.join(' ')}\n\n${fixedNote}`
      : fixedNote;

  const unverified = [
    localeStrings.results.unverified_sender,
    localeStrings.results.unverified_reg,
    localeStrings.results.unverified_domain,
    localeStrings.results.unverified_exists,
  ];

  // 7. Prefilled Calculator URL Generation (if return claim detected)
  let calcUrl: string | undefined;
  if (claims.promisedReturns.length > 0) {
    const pr = claims.promisedReturns[0];
    const multiple = pr.multiple || 2;
    const days = pr.durationDays || 30;
    const invested = 10000;
    const payout = Math.round(invested * multiple);
    calcUrl = `/${lang}/calculator?invested=${invested}&payout=${payout}&days=${days}`;
  }

  const durationMs = Date.now() - startTime;

  return {
    band: fusion.finalBand,
    archetype: fusion.topArchetype,
    confidence: fusion.confidence,
    flags,
    signals: extractedSignalSet.signals,
    domainSignals: extractedSignalSet.domainSignals,
    alertMatches: extractedSignalSet.alertMatches,
    unverified,
    explanation,
    engine: decision.engine,
    calcUrl,
    language: lang,
    durationMs,
  };
}
