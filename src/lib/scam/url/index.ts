import { analyzeSingleUrl } from './analyze';
import { SingleUrlEvidence, UrlAnalysisResult, UrlExtractionProvenance } from './types';

export * from './types';
export * from './normalize';
export * from './parse';
export * from './ssrf';
export * from './trusted';
export * from './analyze';

const URL_REGEX = /(?:https?:\/\/|www\.|[a-zA-Z0-9-]+\.(?:com|org|net|xyz|top|in|co|app|io|tech|info|biz|site|online|live)\b)[^\s<>"'{}|\\^`]*[^\s<>"'{}|\\^`.,;:?!]/gi;
const MAX_URLS_PER_MESSAGE = 10;
const MAX_URL_LENGTH = 2048;

/**
 * Helper function to extract raw URL strings from a text document.
 */
export function extractUrls(text: string = ''): string[] {
  if (!text || typeof text !== 'string') return [];
  const matches = text.match(URL_REGEX) || [];
  return Array.from(new Set(matches)).slice(0, MAX_URLS_PER_MESSAGE);
}


/**
 * Extracts and analyzes all URLs embedded in a message or text document.
 * Returns structured UrlAnalysisResult containing individual urlEvidence array and aggregate signals.
 */
export async function analyzeUrlsInText(
  text: string = '',
  provenance: UrlExtractionProvenance = 'DIRECT_TEXT'
): Promise<UrlAnalysisResult> {
  if (!text || typeof text !== 'string') {
    return {
      urlCount: 0,
      urls: [],
      aggregateSignals: [],
      ssrfBlockedCount: 0,
      status: 'AVAILABLE',
    };
  }

  // 1. Extract raw URLs from text
  const matches = text.match(URL_REGEX) || [];
  const uniqueRaw = Array.from(new Set(matches)).slice(0, MAX_URLS_PER_MESSAGE);

  if (uniqueRaw.length === 0) {
    return {
      urlCount: 0,
      urls: [],
      aggregateSignals: [],
      ssrfBlockedCount: 0,
      status: 'AVAILABLE',
    };
  }

  // 2. Analyze each URL independently
  const urls: SingleUrlEvidence[] = [];
  let ssrfBlockedCount = 0;
  const aggregateSignalsSet = new Set<string>();

  uniqueRaw.forEach((raw, idx) => {
    const truncatedRaw = raw.length > MAX_URL_LENGTH ? raw.substring(0, MAX_URL_LENGTH) : raw;
    const evidence = analyzeSingleUrl(truncatedRaw, provenance, idx + 1);

    urls.push(evidence);

    if (evidence.indicators.ssrfBlocked) {
      ssrfBlockedCount++;
    }

    evidence.explanationSignals.forEach((sig) => aggregateSignalsSet.add(sig));
  });

  const aggregateSignals = Array.from(aggregateSignalsSet);

  return {
    urlCount: urls.length,
    urls,
    aggregateSignals,
    ssrfBlockedCount,
    status: urls.some((u) => u.status === 'BLOCKED_SSRF') ? 'DEGRADED' : 'AVAILABLE',
  };
}
