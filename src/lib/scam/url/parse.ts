export interface ParsedUrlDetails {
  scheme: string;
  hostname: string;
  registrableDomain: string;
  subdomain: string;
  port?: string;
  path: string;
  hasQuery: boolean;
  hasFragment: boolean;
  hasUserinfo: boolean;
  isValid: boolean;
}

const COMMON_TWO_LEVEL_TLDS = new Set([
  'co.in',
  'gov.in',
  'org.in',
  'net.in',
  'ac.in',
  'edu.in',
  'com.au',
  'co.uk',
  'org.uk',
  'gov.uk',
]);

/**
 * Extracts registrable domain and subdomain deterministically.
 * Example: secure-bank.com.evil.test -> registrableDomain: evil.test, subdomain: secure-bank.com
 */
export function extractDomainParts(hostname: string): { registrableDomain: string; subdomain: string } {
  if (!hostname) return { registrableDomain: '', subdomain: '' };

  const cleanHost = hostname.toLowerCase().trim().replace(/\[|\]/g, '');

  // Check if IP address
  if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(cleanHost) || cleanHost.includes(':')) {
    return { registrableDomain: cleanHost, subdomain: '' };
  }

  const parts = cleanHost.split('.');
  if (parts.length <= 2) {
    return { registrableDomain: cleanHost, subdomain: '' };
  }

  // Check 2-level TLDs (e.g. co.in, gov.in)
  const lastTwo = parts.slice(-2).join('.');
  if (COMMON_TWO_LEVEL_TLDS.has(lastTwo) && parts.length > 2) {
    const registrableDomain = parts.slice(-3).join('.');
    const subdomain = parts.slice(0, -3).join('.');
    return { registrableDomain, subdomain };
  }

  const registrableDomain = parts.slice(-2).join('.');
  const subdomain = parts.slice(0, -2).join('.');
  return { registrableDomain, subdomain };
}

export function parseUrl(normalizedUrl: string): ParsedUrlDetails {
  try {
    const parsed = new URL(normalizedUrl);
    const hostname = parsed.hostname.toLowerCase();
    const { registrableDomain, subdomain } = extractDomainParts(hostname);

    return {
      scheme: parsed.protocol.replace(':', ''),
      hostname,
      registrableDomain,
      subdomain,
      port: parsed.port || undefined,
      path: parsed.pathname,
      hasQuery: Boolean(parsed.search),
      hasFragment: Boolean(parsed.hash),
      hasUserinfo: Boolean(parsed.username || parsed.password),
      isValid: true,
    };
  } catch {
    return {
      scheme: 'https',
      hostname: '',
      registrableDomain: '',
      subdomain: '',
      path: '',
      hasQuery: false,
      hasFragment: false,
      hasUserinfo: false,
      isValid: false,
    };
  }
}
