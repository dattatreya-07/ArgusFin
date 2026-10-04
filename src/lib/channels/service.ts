import { NormalizedChannelMessage, ChannelCheckResult } from './types';
import { analyzeScam } from '@/lib/scam/analyze';
import { CanonicalInput, CanonicalSource } from '@/lib/scam/types';

/**
 * Shared core scam check service.
 * Adapts incoming channel inputs to the canonical CORE-01 analyzeScam engine.
 * Guarantees 100% decision and threshold parity across all channels.
 */
export async function checkChannelContent(
  normalized: NormalizedChannelMessage
): Promise<ChannelCheckResult> {
  const startTime = Date.now();

  let source: CanonicalSource = 'WEB_TEXT';
  if (normalized.channel === 'telegram') source = 'TELEGRAM';
  if (normalized.channel === 'whatsapp') source = 'WHATSAPP';
  if (normalized.channel === 'email') source = 'EMAIL';

  const canonicalInput: CanonicalInput = {
    source,
    language: normalized.language,
    text: normalized.normalizedText,
    urls: normalized.urls,
    privacyStatus: normalized.privacyMasked ? 'MASKED' : 'NO_SENSITIVE_DATA_DETECTED',
  };

  const analysis = await analyzeScam(canonicalInput);

  const calcNextStep = analysis.explanation.nextSteps.find((s) => s.id === 'calculator');
  const calcUrl = calcNextStep ? calcNextStep.url : undefined;

  const durationMs = Date.now() - startTime;

  return {
    band: analysis.decision.band,
    archetype: analysis.decision.archetype,
    confidence: analysis.decision.confidence,
    flags: analysis.flags,
    signals: analysis.signals,
    domainSignals: [],
    alertMatches: [],
    unverified: analysis.explanation.whatCouldNotBeVerified,
    explanation: analysis.explanation.summary,
    engine: analysis.decision.engine,
    calcUrl,
    language: normalized.language,
    durationMs,
  };
}
