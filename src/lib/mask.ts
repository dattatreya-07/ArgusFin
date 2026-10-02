export interface MaskCounts {
  phone: number;
  upi: number;
  email: number;
  pan: number;
  accountOrId: number;
}

export interface MaskResult {
  masked: string;
  counts: MaskCounts;
}

// Regex definitions
const URL_REGEX = /(?:https?:\/\/|www\.)[^\s<>"'{}|\\^`]+[^\s<>"'{}|\\^`.,;:?!]/gi;
const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
// UPI typically looks like user@bank or handle@bank where handle can be phone/name and provider is bank handle
const UPI_REGEX = /\b[A-Za-z0-9._-]{2,}@(?!gmail\b|yahoo\b|hotmail\b|outlook\b|icloud\b|proton\b|protonmail\b)[A-Za-z]{2,}\b/gi;
const PAN_REGEX = /\b[A-Za-z]{5}[0-9]{4}[A-Za-z]\b/g;

// Indian Mobile Number formats: +91 9876543210, +91-98765-43210, 98765 43210, 9876543210 (strictly 10 digits preceded/followed by non-digit)
const PHONE_REGEX = /(?<!\d)(?:(?:\+91|91)[\s-]?)?[6-9]\d{4}[\s-]?\d{5}(?!\d)/g;

// Grouped digit runs like Aadhaar (1234 5678 9012 or 1234-5678-9012)
const AADHAAR_LIKE_REGEX = /(?<!\d)\d{4}[\s-]\d{4}[\s-]\d{4}(?!\d)/g;

// Continuous digit runs: 9 to 18 digits (e.g. Bank Account Numbers, Customer IDs)
// Exclude dates (handled by boundaries) and typical amounts
const ACCOUNT_OR_ID_REGEX = /(?<!\d)\d{9,18}(?!\d)/g;

/**
 * Masks sensitive personal and financial identifiers client-side.
 * Never logs or persists original values.
 * Preserves normal currency amounts, dates, percentages, and URLs.
 */
export function maskPII(text: string): MaskResult {
  if (!text || typeof text !== 'string') {
    return {
      masked: '',
      counts: { phone: 0, upi: 0, email: 0, pan: 0, accountOrId: 0 },
    };
  }

  const counts: MaskCounts = {
    phone: 0,
    upi: 0,
    email: 0,
    pan: 0,
    accountOrId: 0,
  };

  // Step 1: Temporarily extract and protect URLs
  const preservedUrls: string[] = [];
  let workingText = text.replace(URL_REGEX, (match) => {
    const placeholder = `__URL_PLACEHOLDER_${preservedUrls.length}__`;
    preservedUrls.push(match);
    return placeholder;
  });

  // Step 2: Mask Emails
  workingText = workingText.replace(EMAIL_REGEX, () => {
    counts.email += 1;
    return '[EMAIL]';
  });

  // Step 3: Mask UPI IDs
  workingText = workingText.replace(UPI_REGEX, () => {
    counts.upi += 1;
    return '[UPI]';
  });

  // Step 4: Mask PAN Cards
  workingText = workingText.replace(PAN_REGEX, () => {
    counts.pan += 1;
    return '[PAN]';
  });

  // Step 5: Mask Phone numbers
  workingText = workingText.replace(PHONE_REGEX, () => {
    counts.phone += 1;
    return '[PHONE]';
  });

  // Step 6: Mask Aadhaar-like runs (12 digits with spaces/hyphens)
  workingText = workingText.replace(AADHAAR_LIKE_REGEX, () => {
    counts.accountOrId += 1;
    return '[ACCOUNT_OR_ID]';
  });

  // Step 7: Mask Long digit runs (9 to 18 digits)
  workingText = workingText.replace(ACCOUNT_OR_ID_REGEX, () => {
    counts.accountOrId += 1;
    return '[ACCOUNT_OR_ID]';
  });

  // Step 8: Restore preserved URLs
  workingText = workingText.replace(/__URL_PLACEHOLDER_(\d+)__/g, (_, index) => {
    return preservedUrls[Number(index)] ?? '';
  });

  return {
    masked: workingText,
    counts,
  };
}
