import { parseUrl } from './parse';
import { normalizeUrl } from './normalize';
import { isSsrfTarget } from './ssrf';
import { matchTrustedDomain } from './trusted';
import { SingleUrlEvidence, UrlExtractionProvenance, UrlIndicators } from './types';

const KNOWN_SHORTENERS = new Set([
  'bit.ly',
  'tinyurl.com',
  't.co',
  'cutt.ly',
  'is.gd',
  'rb.gy',
  'shorturl.at',
  'goo.gl',
  'ow.ly',
]);

// Visual homoglyphs / confusable characters (Cyrillic, Greek, lookalikes)
const CONFUSABLE_CHAR_REGEX = /[\u0400-\u04FF\u0370-\u03FF]/; // Cyrillic & Greek scripts mixed with Latin

export function analyzeSingleUrl(
  rawUrl: string,
  provenance: UrlExtractionProvenance = 'DIRECT_TEXT',
  index = 1
): SingleUrlEvidence {
  const norm = normalizeUrl(rawUrl);
  const parsed = parseUrl(norm.normalizedUrl);

  const isIpHost =
    /^(?:\d{1,3}\.){3}\d{1,3}$/.test(parsed.hostname) ||
    /^\d+$/.test(parsed.hostname) ||
    parsed.hostname.includes(':');

  const isPunycode = parsed.hostname.includes('xn--');
  const isIdn = /[\u0080-\uFFFF]/.test(parsed.hostname);
  const hasMixedScript = (/[a-z]/i.test(parsed.hostname) && CONFUSABLE_CHAR_REGEX.test(parsed.hostname)) || (isPunycode && isIdn);
  const hasConfusableChars = hasMixedScript || isPunycode;

  const isShortener = KNOWN_SHORTENERS.has(parsed.registrableDomain);
  const hasUserinfo = parsed.hasUserinfo;
  const excessiveSubdomains = parsed.subdomain.split('.').filter(Boolean).length >= 3;

  const ssrfBlocked = isSsrfTarget(parsed.hostname, parsed.scheme);
  const trustedMatch = matchTrustedDomain(parsed.registrableDomain);
  const unknownReferenceDomain = !trustedMatch && !isIpHost && Boolean(parsed.registrableDomain);

  const indicators: UrlIndicators = {
    isIpHost,
    isIdn,
    isPunycode,
    hasConfusableChars,
    hasMixedScript,
    isShortener,
    hasUserinfo,
    excessiveSubdomains,
    unknownReferenceDomain,
    ssrfBlocked,
  };

  const explanationSignals: string[] = [];

  if (ssrfBlocked) {
    explanationSignals.push('The URL targets a private/reserved address and was blocked for security.');
  }
  if (isIpHost) {
    explanationSignals.push('The URL uses an IP address instead of a conventional domain name.');
  }
  if (isPunycode) {
    explanationSignals.push('The hostname uses internationalized/punycode encoding.');
  }
  if (hasMixedScript) {
    explanationSignals.push('The hostname contains characters from multiple writing systems.');
  }
  if (hasUserinfo) {
    explanationSignals.push('The URL contains embedded user-information credentials.');
  }
  if (excessiveSubdomains) {
    explanationSignals.push('The hostname contains multiple nested subdomains.');
  }
  if (isShortener) {
    explanationSignals.push('The link is shortened, so its final destination is not visible from the message.');
  }
  if (trustedMatch) {
    explanationSignals.push(`The domain matches verified official registry entity '${trustedMatch.name}'.`);
  }

  const untrustedExtraction = provenance === 'OCR' || provenance === 'AUDIO_TRANSCRIPT';

  return {
    id: `url-ev-${index}`,
    originalUrl: norm.originalUrl,
    normalizedUrl: norm.normalizedUrl,
    scheme: parsed.scheme,
    hostname: parsed.hostname,
    registrableDomain: parsed.registrableDomain,
    subdomain: parsed.subdomain,
    port: parsed.port,
    path: parsed.path,
    hasQuery: parsed.hasQuery,
    hasFragment: parsed.hasFragment,
    hasUserinfo: parsed.hasUserinfo,
    indicators,
    provenance,
    untrustedExtraction,
    explanationSignals,
    rdapStatus: 'NOT_CHECKED',
    redirectStatus: ssrfBlocked ? 'BLOCKED_SSRF' : 'NOT_CHECKED',
    status: ssrfBlocked ? 'BLOCKED_SSRF' : parsed.isValid ? 'AVAILABLE' : 'DEGRADED',
  };
}
