import { extractAndNormalizeDomain } from './rdap';

export interface VerifiedBrand {
  brandName: string;
  officialDomains: string[];
  keywords: string[];
}

export const VERIFIED_FINANCIAL_BRANDS: VerifiedBrand[] = [
  { brandName: 'Zerodha', officialDomains: ['zerodha.com', 'kite.zerodha.com'], keywords: ['zerodha', 'kite'] },
  { brandName: 'Groww', officialDomains: ['groww.in'], keywords: ['groww'] },
  { brandName: 'Angel One', officialDomains: ['angelone.in'], keywords: ['angelone', 'angelbroking'] },
  { brandName: 'Upstox', officialDomains: ['upstox.com'], keywords: ['upstox', 'rksv'] },
  { brandName: 'SEBI', officialDomains: ['sebi.gov.in', 'scores.gov.in', 'scores.sebi.gov.in'], keywords: ['sebi', 'scores'] },
  { brandName: 'NSE India', officialDomains: ['nseindia.com'], keywords: ['nseindia', 'nse'] },
  { brandName: 'BSE India', officialDomains: ['bseindia.com'], keywords: ['bseindia', 'bse'] },
  { brandName: 'State Bank of India (SBI)', officialDomains: ['sbi.co.in', 'onlinesbi.sbi'], keywords: ['onlinesbi', 'sbi'] },
  { brandName: 'HDFC Bank', officialDomains: ['hdfcbank.com'], keywords: ['hdfcbank', 'hdfc'] },
  { brandName: 'ICICI Bank', officialDomains: ['icicibank.com', 'icicidirect.com'], keywords: ['icicibank', 'icicidirect'] },
  { brandName: 'Paytm Money', officialDomains: ['paytmmoney.com'], keywords: ['paytmmoney'] },
  { brandName: 'RBI', officialDomains: ['rbi.org.in'], keywords: ['rbi'] },
  { brandName: 'NSDL', officialDomains: ['nsdl.co.in'], keywords: ['nsdl'] },
  { brandName: 'CDSL', officialDomains: ['cdslindia.com'], keywords: ['cdslindia', 'cdsl'] },
];

/**
 * Normalizes confusable/homoglyph characters from numbers or common substitutes.
 */
export function normalizeConfusables(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFKD')
    .replace(/0/g, 'o')
    .replace(/1/g, 'l')
    .replace(/3/g, 'e')
    .replace(/5/g, 's')
    .replace(/vv/g, 'w')
    .replace(/rn/g, 'm')
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Standard Levenshtein Distance calculation between two strings.
 */
export function levenshteinDistance(a: string, b: string): number {
  const an = a ? a.length : 0;
  const bn = b ? b.length : 0;
  if (an === 0) return bn;
  if (bn === 0) return an;
  const matrix = Array.from({ length: bn + 1 }, () => new Array(an + 1).fill(0));
  for (let i = 0; i <= an; ++i) matrix[0][i] = i;
  for (let j = 0; j <= bn; ++j) matrix[j][0] = j;
  for (let j = 1; j <= bn; ++j) {
    for (let i = 1; i <= an; ++i) {
      if (a[i - 1] === b[j - 1]) {
        matrix[j][i] = matrix[j - 1][i - 1];
      } else {
        matrix[j][i] = Math.min(
          matrix[j - 1][i - 1] + 1, // substitution
          Math.min(matrix[j][i - 1] + 1, matrix[j - 1][i] + 1) // insertion / deletion
        );
      }
    }
  }
  return matrix[bn][an];
}

export interface LookalikeDetectionResult {
  isLookalike: boolean;
  matchedBrand?: string;
  reason?: string;
  officialDomain?: string;
  confidence: number;
}

/**
 * Checks if a short keyword is present as a standalone segment or token in the domain.
 */
function containsShortKeyword(sld: string, keyword: string): boolean {
  // Split sld by non-alphanumeric chars or check if it starts/ends with keyword
  const tokens = sld.split(/[-_.]+/);
  if (tokens.includes(keyword)) return true;
  if (sld.startsWith(`${keyword}-`) || sld.endsWith(`-${keyword}`)) return true;
  if (sld.startsWith(`${keyword}online`) || sld.startsWith(`${keyword}login`) || sld.startsWith(`${keyword}app`)) return true;
  return sld === keyword;
}

/**
 * Detects whether a domain is an impersonation or lookalike of a verified financial entity.
 */
export function detectLookalikeDomain(domainOrUrl: string): LookalikeDetectionResult {
  const hostname = extractAndNormalizeDomain(domainOrUrl);
  if (!hostname) {
    return { isLookalike: false, confidence: 0 };
  }

  // 1. Check if it IS an official domain or legitimate subdomain of an official domain
  for (const brand of VERIFIED_FINANCIAL_BRANDS) {
    for (const official of brand.officialDomains) {
      if (hostname === official || hostname.endsWith(`.${official}`)) {
        return {
          isLookalike: false,
          matchedBrand: brand.brandName,
          officialDomain: official,
          reason: 'Verified official domain or subdomain of known brand.',
          confidence: 1.0,
        };
      }
    }
  }

  // Extract the second-level domain name (SLD) without the TLD
  const parts = hostname.split('.');
  const sld = parts.length >= 2 ? parts[parts.length - 2] : parts[0];
  const normalizedSld = normalizeConfusables(sld);

  // 2. Check for brand keyword inclusion or typo similarity
  for (const brand of VERIFIED_FINANCIAL_BRANDS) {
    for (const keyword of brand.keywords) {
      const normalizedKeyword = normalizeConfusables(keyword);

      // Short keywords (<= 3 chars like sbi, rbi, nse, bse) need token/boundary matching
      if (keyword.length <= 3) {
        if (containsShortKeyword(sld, keyword) || containsShortKeyword(normalizedSld, normalizedKeyword)) {
          return {
            isLookalike: true,
            matchedBrand: brand.brandName,
            officialDomain: brand.officialDomains[0],
            reason: `Domain SLD '${sld}' targets brand acronym '${keyword}' outside official domains.`,
            confidence: 0.9,
          };
        }
        continue;
      }

      // Longer keywords (>= 4 chars like zerodha, groww, angelone, upstox)
      if (sld.includes(keyword) || normalizedSld.includes(normalizedKeyword)) {
        return {
          isLookalike: true,
          matchedBrand: brand.brandName,
          officialDomain: brand.officialDomains[0],
          reason: `Domain SLD '${sld}' contains brand keyword '${keyword}' outside official domains.`,
          confidence: 0.9,
        };
      }

      // Levenshtein distance check for typosquatting (length >= 4 and distance <= 2)
      const distDirect = levenshteinDistance(sld, keyword);
      const distNormalized = levenshteinDistance(normalizedSld, normalizedKeyword);
      const minDist = Math.min(distDirect, distNormalized);

      if (minDist > 0 && minDist <= (keyword.length <= 5 ? 1 : 2)) {
        return {
          isLookalike: true,
          matchedBrand: brand.brandName,
          officialDomain: brand.officialDomains[0],
          reason: `Domain '${sld}' has high edit-distance similarity to brand '${keyword}'.`,
          confidence: 0.85,
        };
      }
    }
  }

  return {
    isLookalike: false,
    confidence: 0,
  };
}
