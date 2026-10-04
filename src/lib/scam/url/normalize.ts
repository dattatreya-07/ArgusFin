export interface NormalizedUrlResult {
  originalUrl: string;
  normalizedUrl: string;
  redactedUrl: string;
  hasRedactions: boolean;
}

const SENSITIVE_PARAM_REGEX = /(pass|password|token|auth|session|otp|secret|key|email|jwt)=[^&]+/gi;
const TRAILING_PUNCTUATION_REGEX = /[.,;:?!)\\]>]+$/;

export function normalizeUrl(rawUrl: string): NormalizedUrlResult {
  const originalUrl = (rawUrl || '').trim();
  if (!originalUrl) {
    return {
      originalUrl: '',
      normalizedUrl: '',
      redactedUrl: '',
      hasRedactions: false,
    };
  }

  // 1. Trim surrounding trailing punctuation commonly attached in text/chat
  let cleanUrl = originalUrl.replace(TRAILING_PUNCTUATION_REGEX, '');

  // 2. Protocol-relative URL handling
  if (cleanUrl.startsWith('//')) {
    cleanUrl = `https:${cleanUrl}`;
  } else if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    cleanUrl = `https://${cleanUrl}`;
  }

  let normalizedUrl = cleanUrl;

  try {
    const parsed = new URL(cleanUrl);

    // Standardize hostname case and default ports
    let hostname = parsed.hostname.toLowerCase();
    let port = parsed.port;
    if ((parsed.protocol === 'http:' && port === '80') || (parsed.protocol === 'https:' && port === '443')) {
      port = '';
    }

    const hostWithPort = port ? `${hostname}:${port}` : hostname;
    normalizedUrl = `${parsed.protocol}//${hostWithPort}${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    // Return cleaned string if URL constructor parsing fails
    normalizedUrl = cleanUrl;
  }

  // 3. Redact sensitive query parameters for safe logging/LLM context
  let hasRedactions = false;
  let redactedUrl = normalizedUrl;

  if (SENSITIVE_PARAM_REGEX.test(normalizedUrl)) {
    hasRedactions = true;
    redactedUrl = normalizedUrl.replace(SENSITIVE_PARAM_REGEX, '$1=[REDACTED]');
  }

  return {
    originalUrl,
    normalizedUrl,
    redactedUrl,
    hasRedactions,
  };
}
