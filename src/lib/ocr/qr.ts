import { QrEvidence, QrType } from './types';
import { extractUrls, analyzeUrlsInText } from '../scam/url';

/**
 * Parses and classifies a raw QR string payload safely without navigating or initiating payments.
 */
export function processQrPayload(
  rawValue: string,
  index: number = 0
): QrEvidence {
  const trimmed = rawValue.trim();
  const id = `qr-${index + 1}-${Date.now().toString(36)}`;

  // 1. Check for payment URIs (UPI, Bitcoin, Ethereum, Sol, etc.)
  if (
    /^upi:\/\/pay/i.test(trimmed) ||
    /^bitcoin:/i.test(trimmed) ||
    /^ethereum:/i.test(trimmed) ||
    /^solana:/i.test(trimmed) ||
    /^paytmmp:\/\//i.test(trimmed) ||
    /^gpay:\/\//i.test(trimmed) ||
    /^phonepe:\/\//i.test(trimmed)
  ) {
    const parsed = parsePaymentUri(trimmed);
    return {
      id,
      rawValue: trimmed,
      type: 'QR_PAYMENT_URI',
      parsedPayment: parsed,
    };
  }

  // 2. Check for URLs
  const urls = extractUrls(trimmed);
  if (urls.length > 0) {
    const primaryUrl = urls[0];
    const urlIntelligence = analyzeUrlsInText(trimmed, 'OCR');

    return {
      id,
      rawValue: trimmed,
      type: 'QR_URL',
      extractedUrl: primaryUrl,
      urlEvidence: urlIntelligence,
    };
  }

  // 3. Plain text or unknown format
  if (trimmed.length > 0) {
    return {
      id,
      rawValue: trimmed,
      type: 'QR_TEXT',
    };
  }

  return {
    id,
    rawValue: trimmed,
    type: 'QR_UNKNOWN',
  };
}

/**
 * Safely parses payment parameters from URI schemes like UPI or crypto without executing payment.
 */
function parsePaymentUri(uri: string): {
  scheme: string;
  merchantName?: string;
  amount?: number;
  currency?: string;
} {
  try {
    const schemeMatch = uri.match(/^([a-z0-9+-.]+):/i);
    const scheme = schemeMatch ? schemeMatch[1].toLowerCase() : 'unknown';

    if (scheme === 'upi') {
      const url = new URL(uri.replace(/^upi:\/\//i, 'http://placeholder/'));
      const pa = url.searchParams.get('pa') || undefined;
      const pn = url.searchParams.get('pn') || undefined;
      const am = url.searchParams.get('am');
      const cu = url.searchParams.get('cu') || 'INR';

      return {
        scheme: 'upi',
        merchantName: pn || pa,
        amount: am ? parseFloat(am) : undefined,
        currency: cu,
      };
    }

    if (scheme === 'bitcoin' || scheme === 'ethereum' || scheme === 'solana') {
      const parts = uri.split('?');
      const address = parts[0].replace(/^[^:]+:/, '');
      let amount: number | undefined;

      if (parts[1]) {
        const params = new URLSearchParams(parts[1]);
        const amtStr = params.get('amount') || params.get('value');
        if (amtStr) {
          amount = parseFloat(amtStr);
        }
      }

      return {
        scheme,
        merchantName: address.slice(0, 10) + '...',
        amount,
        currency: scheme.toUpperCase(),
      };
    }

    return { scheme };
  } catch (err) {
    return { scheme: 'unknown' };
  }
}
