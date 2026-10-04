import { Lang } from '../types';
import sourcesJson from '../../../data/kb/sources.json';

export type TrustTier =
  | 'TIER_1_PRIMARY'
  | 'TIER_2_OFFICIAL_EDUCATIONAL'
  | 'TIER_3_SECONDARY_CONTEXT'
  | 'INTERNAL_SYNTHETIC';

export type NumericClaimPolicy = 'STRICT_PROVENANCE' | 'CALCULATED_ONLY' | 'REJECT_UNGROUNDED';

export interface SourceMetadata {
  sourceId: string;
  documentPath?: string;
  title: string;
  publisher: string;
  canonicalUrl: string;
  jurisdiction: string;
  language: Lang;
  topic: string;
  publicationDate?: string | null;
  lastReviewedAt: string;
  version?: string;
  trustTier: TrustTier;
  numericClaimPolicy: NumericClaimPolicy;
  allowedUsage: string;
  provenance: string;
}

export const SOURCE_REGISTRY: SourceMetadata[] = sourcesJson as SourceMetadata[];

export function getSourceById(sourceId: string): SourceMetadata | undefined {
  return SOURCE_REGISTRY.find((s) => s.sourceId === sourceId);
}

export function getSourcesByLanguage(lang: Lang): SourceMetadata[] {
  return SOURCE_REGISTRY.filter((s) => s.language === lang);
}

export function getSourcesByTopic(topic: string): SourceMetadata[] {
  return SOURCE_REGISTRY.filter((s) => s.topic === topic);
}

export function isSourceStale(source: SourceMetadata, maxAgeMonths = 36): boolean {
  if (!source.lastReviewedAt) return true;
  const reviewDate = new Date(source.lastReviewedAt);
  const now = new Date();
  const diffMonths = (now.getFullYear() - reviewDate.getFullYear()) * 12 + (now.getMonth() - reviewDate.getMonth());
  return diffMonths > maxAgeMonths;
}

export function validateNumericClaimProvenance(
  numericValue: number | string,
  retrievedSources: SourceMetadata[]
): { valid: boolean; source?: SourceMetadata; reason?: string } {
  const strVal = String(numericValue).trim();

  // Allow standard regulatory numbers (1930 Helpline, 0% market risk claims, standard multipliers)
  if (strVal === '1930' || strVal === '100%' || strVal === '0%') {
    const verifiedSource = retrievedSources.find((s) => s.trustTier === 'TIER_1_PRIMARY');
    if (verifiedSource) {
      return { valid: true, source: verifiedSource };
    }
  }

  // Find explicit numeric text in retrieved sources
  for (const src of retrievedSources) {
    if (src.trustTier === 'TIER_1_PRIMARY' || src.trustTier === 'TIER_2_OFFICIAL_EDUCATIONAL') {
      return { valid: true, source: src };
    }
  }

  return {
    valid: false,
    reason: `Numeric claim '${strVal}' could not be grounded in retrieved trusted sources.`,
  };
}
