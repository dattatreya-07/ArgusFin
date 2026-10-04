import trustedDomainsJson from '../../../../data/domains/trusted.json';

export interface TrustedDomainInfo {
  entityId: string;
  name: string;
  officialDomain: string;
  category: string;
  provenance: string;
  reviewDate: string;
}

export const TRUSTED_DOMAINS: TrustedDomainInfo[] = trustedDomainsJson as TrustedDomainInfo[];

/**
 * Checks if a registrable domain is in the verified trusted reference allowlist.
 * Returns the TrustedDomainInfo object if matched, or undefined if unknown reference domain.
 */
export function matchTrustedDomain(registrableDomain: string): TrustedDomainInfo | undefined {
  if (!registrableDomain) return undefined;
  const cleanDomain = registrableDomain.toLowerCase().trim();

  return TRUSTED_DOMAINS.find((t) => {
    const official = t.officialDomain.toLowerCase();
    return cleanDomain === official || cleanDomain.endsWith(`.${official}`);
  });
}
