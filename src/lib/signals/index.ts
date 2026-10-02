import { Signal, DomainSignals, ExtractedSignalSet } from './types';
import { extractAndNormalizeDomain, queryRdap } from './rdap';
import { detectLookalikeDomain } from './lookalike';
import { matchOfficialAlerts } from './alerts';
import { extractAppSignals } from './appSignals';

export * from './types';
export * from './cache';
export * from './rdap';
export * from './lookalike';
export * from './alerts';
export * from './appSignals';

const URL_REGEX = /(?:https?:\/\/)?(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(?:\/[^\s]*)?/gi;

/**
 * Extracts domains, lookalike signals, official alerts, and app installation indicators.
 */
export async function extractAllSignals(text: string, options: { enableRdap?: boolean } = {}): Promise<ExtractedSignalSet> {
  const signals: Signal[] = [];
  const domainSignalsList: DomainSignals[] = [];

  // 1. App signals
  const appSigs = extractAppSignals(text);
  signals.push(...appSigs);

  // 2. Official alerts
  const alertMatches = matchOfficialAlerts(text);
  for (const match of alertMatches) {
    signals.push({
      id: `sig-alert-${match.alertId}`,
      label: `Official Alert Match: ${match.title}`,
      value: match.matchedAlias,
      sourceUrl: match.sourceUrl,
      asOf: match.verifiedAt,
      status: 'verified',
      confidence: 0.95,
      details: {
        publisher: match.publisher,
        publishedAt: match.publishedAt,
        summary: match.summary,
      },
    });
  }

  // 3. URLs and Domains
  const urlMatches = text.match(URL_REGEX) || [];
  const processedDomains = new Set<string>();

  for (const rawUrl of urlMatches) {
    const domain = extractAndNormalizeDomain(rawUrl);
    if (!domain || processedDomains.has(domain)) continue;
    processedDomains.add(domain);

    const lookalike = detectLookalikeDomain(domain);
    let domainAgeDays: number | undefined;
    let registrationDate: string | undefined;
    let rdapStatus: 'verified' | 'unverified' | 'unavailable' = 'unverified';

    if (options.enableRdap) {
      const rdap = await queryRdap(domain);
      domainAgeDays = rdap.domainAgeDays;
      registrationDate = rdap.registrationDate;
      rdapStatus = rdap.status;
    }

    const domainSignal: DomainSignals = {
      hostname: domain,
      domainAgeDays,
      registrationDate,
      rdapStatus,
      isLookalike: lookalike.isLookalike,
      matchedBrand: lookalike.matchedBrand,
      lookalikeReason: lookalike.reason,
    };
    domainSignalsList.push(domainSignal);

    if (lookalike.isLookalike) {
      signals.push({
        id: `sig-lookalike-${domain.replace(/[^a-z0-9]/g, '-')}`,
        label: `Domain Lookalike Flag: ${domain}`,
        value: lookalike.matchedBrand || 'Known Financial Brand',
        sourceUrl: lookalike.officialDomain ? `https://${lookalike.officialDomain}` : undefined,
        status: 'verified',
        confidence: lookalike.confidence,
        details: {
          hostname: domain,
          reason: lookalike.reason,
        },
      });
    }

    if (domainAgeDays !== undefined && domainAgeDays < 90) {
      signals.push({
        id: `sig-domain-recent-${domain.replace(/[^a-z0-9]/g, '-')}`,
        label: `Recently Registered Domain (${domainAgeDays} days old)`,
        value: `${domainAgeDays} days`,
        status: 'verified',
        confidence: 0.7,
        details: {
          hostname: domain,
          registrationDate,
          note: 'Newly created domains are not inherently fraudulent, but require increased scrutiny when financial promises are made.',
        },
      });
    }
  }

  return {
    signals,
    domainSignals: domainSignalsList,
    alertMatches: alertMatches.map(m => ({
      alertId: m.alertId,
      title: m.title,
      sourceUrl: m.sourceUrl,
      publishedAt: m.publishedAt,
      matchedAlias: m.matchedAlias,
    })),
  };
}
