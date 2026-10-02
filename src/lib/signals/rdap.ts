import { SignalStatus } from './types';
import { globalDomainCache } from './cache';

// SSRF blocklist patterns for private/internal hostnames and IP ranges
const SSRF_BLOCKED_HOSTNAMES = new Set([
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '::1',
  '169.254.169.254', // AWS/GCP metadata endpoint
  'metadata.google.internal',
]);

const PRIVATE_IP_REGEX = /^(?:10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|169\.254\.\d{1,3}\.\d{1,3}|127\.\d{1,3}\.\d{1,3}\.\d{1,3})$/;

/**
 * Normalizes a raw input string or URL into a clean, public domain hostname.
 * Returns null if the input is not a valid domain or targets a private/internal IP/host (SSRF protection).
 */
export function extractAndNormalizeDomain(input: string): string | null {
  if (!input || typeof input !== 'string') return null;
  const trimmed = input.trim();
  if (!trimmed) return null;

  try {
    let toParse = trimmed;
    if (!toParse.startsWith('http://') && !toParse.startsWith('https://')) {
      toParse = `https://${toParse}`;
    }
    const parsed = new URL(toParse);
    let hostname = parsed.hostname.toLowerCase();
    
    // Remove trailing dots
    hostname = hostname.replace(/\.+$/, '');
    
    // Remove www.
    if (hostname.startsWith('www.')) {
      hostname = hostname.slice(4);
    }

    // SSRF Check: block private IPs, localhost, and metadata hosts
    if (SSRF_BLOCKED_HOSTNAMES.has(hostname) || PRIVATE_IP_REGEX.test(hostname)) {
      return null;
    }

    if (hostname.endsWith('.local') || hostname.endsWith('.internal') || hostname.endsWith('.lan')) {
      return null;
    }

    // Must contain at least one dot and valid characters with a valid public TLD (at least 2 letters)
    if (!hostname.includes('.') || !/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(hostname)) {
      return null;
    }

    return hostname;
  } catch {
    return null;
  }
}

export interface RdapResult {
  hostname: string;
  registrationDate?: string;
  domainAgeDays?: number;
  status: SignalStatus;
  raw?: Record<string, unknown>;
}

/**
 * Query RDAP for a domain with timeout, caching, and graceful fallback.
 */
export async function queryRdap(domain: string, timeoutMs = 2500): Promise<RdapResult> {
  const normalized = extractAndNormalizeDomain(domain);
  if (!normalized) {
    return {
      hostname: domain,
      status: 'unavailable',
    };
  }

  // Check cache
  const cached = globalDomainCache.get(`rdap:${normalized}`);
  if (cached) {
    return cached.data as RdapResult;
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(`https://rdap.org/domain/${encodeURIComponent(normalized)}`, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/rdap+json, application/json',
      },
    }).finally(() => clearTimeout(timer));

    if (!response.ok) {
      const res: RdapResult = {
        hostname: normalized,
        status: 'unavailable',
      };
      globalDomainCache.set(`rdap:${normalized}`, res, 'unavailable', 300000); // 5 min
      return res;
    }

    const data = await response.json();
    let registrationDate: string | undefined;

    if (Array.isArray(data.events)) {
      const regEvent = data.events.find((e: { eventAction?: string; eventDate?: string }) => 
        e.eventAction === 'registration' || e.eventAction === 'transfer'
      );
      if (regEvent && regEvent.eventDate) {
        registrationDate = regEvent.eventDate;
      }
    }

    let domainAgeDays: number | undefined;
    if (registrationDate) {
      const regTime = new Date(registrationDate).getTime();
      if (!isNaN(regTime)) {
        const diffMs = Date.now() - regTime;
        domainAgeDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
      }
    }

    const res: RdapResult = {
      hostname: normalized,
      registrationDate,
      domainAgeDays,
      status: 'verified',
    };

    globalDomainCache.set(`rdap:${normalized}`, res, 'verified');
    return res;
  } catch {
    const res: RdapResult = {
      hostname: normalized,
      status: 'unavailable',
    };
    globalDomainCache.set(`rdap:${normalized}`, res, 'unavailable', 300000);
    return res;
  }
}
