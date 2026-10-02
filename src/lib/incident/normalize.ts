/**
 * Normalization helpers for deterministic entity comparison.
 * Normalizes values for comparison without mutating original user representation.
 */

export function normalizeDomain(input?: string): string {
  if (!input) return '';
  let domain = input.trim().toLowerCase();
  domain = domain.replace(/^https?:\/\//i, '');
  domain = domain.replace(/^www\./i, '');
  domain = domain.split('/')[0];
  domain = domain.split('?')[0];
  return domain.trim();
}

export function normalizeEntityName(input?: string): string {
  if (!input) return '';
  return input
    .trim()
    .toLowerCase()
    .replace(/[^\w\s\u0900-\u097F\u0B80-\u0BFF]/g, '')
    .replace(/\s+/g, ' ');
}

export function normalizeAmount(input: number | string | undefined): number {
  if (typeof input === 'number') {
    return isNaN(input) ? 0 : input;
  }
  if (!input) return 0;
  const cleaned = String(input).replace(/[₹,\s]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

export function parseDateSafe(input?: string): Date | null {
  if (!input) return null;
  const parsed = new Date(input);
  if (isNaN(parsed.getTime())) return null;
  return parsed;
}

export function normalizePaymentMethod(input?: string): string {
  if (!input) return 'UNSPECIFIED';
  const lower = input.toLowerCase();
  if (lower.includes('upi') || lower.includes('gpay') || lower.includes('phonepe') || lower.includes('paytm')) {
    return 'UPI';
  }
  if (lower.includes('imps') || lower.includes('neft') || lower.includes('rtgs') || lower.includes('bank transfer') || lower.includes('net banking')) {
    return 'BANK_TRANSFER';
  }
  if (lower.includes('card') || lower.includes('debit') || lower.includes('credit')) {
    return 'CARD';
  }
  if (lower.includes('crypto') || lower.includes('usdt') || lower.includes('btc') || lower.includes('bitcoin')) {
    return 'CRYPTO';
  }
  return 'OTHER';
}
