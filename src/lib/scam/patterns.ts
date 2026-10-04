import { OpenWorldAnalysis } from '@/lib/detector/openWorld';
import { Lang } from '@/lib/types';

export interface AnonymizedPatternRecord {
  patternFingerprint: string;
  behaviorFamily: string;
  candidateCategory: string;
  language: Lang;
  firstObserved: string;
  lastObserved: string;
  observationCount: number;
}

// In-memory privacy-safe pattern registry
const patternRegistry = new Map<string, AnonymizedPatternRecord>();

/**
 * Creates a deterministic, anonymized fingerprint from open-world behavioral signals.
 * STRICT PRIVACY GUARANTEE: Never includes raw user text, PII, phone numbers, or sender identifiers.
 */
export function generateBehavioralFingerprint(
  analysis: OpenWorldAnalysis,
  lang: Lang
): { fingerprint: string; family: string } {
  const pressureKeys = analysis.pressureSignals.map((p) => p.type).sort().join('_');
  const financialKeys = analysis.financialSignals.map((f) => f.type).sort().join('_');
  const technicalKeys = analysis.technicalSignals.map((t) => t.type).sort().join('_');
  const actionKeys = analysis.requestedActions.map((a) => a.action).sort().join('_');
  const actorKey = analysis.claimedActor?.role ? analysis.claimedActor.role.toUpperCase().replace(/\s+/g, '_') : 'UNKNOWN_ACTOR';

  const family = [actorKey, pressureKeys, financialKeys, technicalKeys, actionKeys].filter(Boolean).join('::');
  const fingerprint = `fp_${lang}_${Buffer.from(family).toString('base64url').substring(0, 16)}`;

  return { fingerprint, family };
}

/**
 * Persists anonymized pattern metadata without storing any raw user input.
 */
export function recordPatternObservation(
  analysis: OpenWorldAnalysis,
  lang: Lang = 'en'
): AnonymizedPatternRecord | null {
  // Only register patterns with elevated behavioral risk
  if (analysis.suggestedBand !== 'HIGH' && analysis.suggestedBand !== 'MEDIUM') {
    return null;
  }

  const { fingerprint, family } = generateBehavioralFingerprint(analysis, lang);
  const now = new Date().toISOString();

  const existing = patternRegistry.get(fingerprint);
  if (existing) {
    existing.lastObserved = now;
    existing.observationCount += 1;
    patternRegistry.set(fingerprint, existing);
    return existing;
  } else {
    const record: AnonymizedPatternRecord = {
      patternFingerprint: fingerprint,
      behaviorFamily: family,
      candidateCategory: analysis.suggestedArchetype,
      language: lang,
      firstObserved: now,
      lastObserved: now,
      observationCount: 1,
    };
    patternRegistry.set(fingerprint, record);
    return record;
  }
}

/**
 * Retrieves aggregate anonymized pattern observations for intelligence reporting.
 */
export function getAnonymizedPatternStats(): {
  totalObservedPatterns: number;
  topFamilies: Array<{ family: string; count: number }>;
  patterns: AnonymizedPatternRecord[];
} {
  const records = Array.from(patternRegistry.values());
  const familyCounts = new Map<string, number>();

  for (const r of records) {
    familyCounts.set(r.behaviorFamily, (familyCounts.get(r.behaviorFamily) || 0) + r.observationCount);
  }

  const topFamilies = Array.from(familyCounts.entries())
    .map(([family, count]) => ({ family, count }))
    .sort((a, b) => b.count - a.count);

  return {
    totalObservedPatterns: records.reduce((acc, r) => acc + r.observationCount, 0),
    topFamilies,
    patterns: records,
  };
}
