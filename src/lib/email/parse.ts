import { ParsedEmail, EmailLink, EmailAuthResults, EmailAttachment } from './types';
import { extractUrls } from '../scam/url';
import { maskPII } from '../mask';

const MAX_EMAIL_TEXT_BYTES = 100 * 1024; // 100 KB max text size
const MAX_ATTACHMENTS = 10;

/**
 * Extracts display name and email address from standard header formats:
 * e.g. "HDFC Bank Security <support@hdfc.com>" -> { displayName: "HDFC Bank Security", address: "support@hdfc.com" }
 */
export function parseEmailAddress(raw: string): { displayName?: string; address: string; raw: string } {
  if (!raw) return { address: '', raw: '' };
  const trimmed = raw.trim();

  // Angle bracket format: Display Name <user@domain.com> or "Display Name" <user@domain.com>
  const angleMatch = trimmed.match(/^(?:"?([^"<]+)"?\s+)?<([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})>$/);
  if (angleMatch) {
    return {
      displayName: angleMatch[1]?.trim() || undefined,
      address: angleMatch[2].toLowerCase().trim(),
      raw: trimmed,
    };
  }

  // Plain email address format: user@domain.com
  const plainMatch = trimmed.match(/^([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/);
  if (plainMatch) {
    return {
      address: plainMatch[1].toLowerCase().trim(),
      raw: trimmed,
    };
  }

  return { address: trimmed.toLowerCase(), raw: trimmed };
}

/**
 * Converts HTML body to clean plaintext while extracting hyperlinks and detecting link destination mismatches.
 */
export function parseHtmlBody(html: string): { text: string; links: EmailLink[]; urls: string[] } {
  if (!html) return { text: '', links: [], urls: [] };

  const links: EmailLink[] = [];
  const extractedUrlsSet = new Set<string>();

  // 1. Remove scripts, styles, forms, and SVGs
  let cleanHtml = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<form[\s\S]*?<\/form>/gi, '')
    .replace(/<svg[\s\S]*?<\/svg>/gi, '');

  // 2. Extract <a href="..."> text </a> links
  const anchorRegex = /<a\s+(?:[^>]*?\s+)?href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let anchorMatch: RegExpExecArray | null;

  while ((anchorMatch = anchorRegex.exec(cleanHtml)) !== null) {
    const href = anchorMatch[1].trim();
    const rawVisibleText = anchorMatch[2].replace(/<[^>]+>/g, '').trim();

    if (href.startsWith('http://') || href.startsWith('https://')) {
      extractedUrlsSet.add(href);

      let isMismatch = false;
      // Check if visible text looks like a domain/URL but points elsewhere
      const visibleUrlMatches = rawVisibleText.match(/(?:https?:\/\/|www\.)[^\s<>"']+/i);
      if (visibleUrlMatches) {
        const visibleUrl = visibleUrlMatches[0].toLowerCase();
        try {
          const hrefDomain = new URL(href).hostname.toLowerCase();
          const visibleDomain = visibleUrl.replace(/^https?:\/\//i, '').split('/')[0].toLowerCase();
          if (hrefDomain !== visibleDomain && !hrefDomain.endsWith('.' + visibleDomain)) {
            isMismatch = true;
          }
        } catch {
          // ignore parsing error
        }
      }

      links.push({
        visibleText: rawVisibleText || href,
        href,
        isMismatch,
      });
    }
  }

  // 3. Convert remaining HTML tags to plain text
  let plainText = cleanHtml
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  // Also collect plain URLs
  const plainUrls = extractUrls(plainText);
  plainUrls.forEach((u) => extractedUrlsSet.add(u));

  return {
    text: plainText,
    links,
    urls: Array.from(extractedUrlsSet),
  };
}

/**
 * Checks for sender display-name spoofing (e.g., Display Name "SEBI Official" with email `@gmail.com`).
 */
export function checkSenderMismatch(sender: { displayName?: string; address: string }): boolean {
  if (!sender.displayName || !sender.address) return false;
  const nameLower = sender.displayName.toLowerCase();
  const addressLower = sender.address.toLowerCase();
  const senderDomain = addressLower.split('@')[1];
  if (!senderDomain) return false;

  const brandDomains: Record<string, string[]> = {
    sebi: ['sebi.gov.in'],
    rbi: ['rbi.org.in'],
    hdfc: ['hdfcbank.com', 'hdfc.com'],
    sbi: ['sbi.co.in'],
    icici: ['icicibank.com'],
    axis: ['axisbank.com'],
    zerodha: ['zerodha.com'],
    groww: ['groww.in'],
    'income tax': ['incometax.gov.in'],
  };

  for (const [brand, officialDomains] of Object.entries(brandDomains)) {
    if (nameLower.includes(brand)) {
      if (!officialDomains.some((dom) => senderDomain === dom || senderDomain.endsWith('.' + dom))) {
        return true;
      }
    }
  }

  const genericDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'protonmail.com', 'mail.ru'];
  const claimsBrand = ['sebi', 'rbi', 'hdfc', 'sbi', 'icici', 'axis', 'zerodha', 'groww', 'argus', 'sangyan', 'bank', 'official', 'security'].some((b) => nameLower.includes(b));
  const usesGenericDomain = genericDomains.some((dom) => senderDomain === dom);

  return claimsBrand && usesGenericDomain;
}

/**
 * Checks for Reply-To domain mismatch against From address domain.
 */
export function checkReplyToMismatch(senderAddr: string, replyToAddr?: string): boolean {
  if (!senderAddr || !replyToAddr) return false;
  const senderDomain = senderAddr.split('@')[1];
  const replyToDomain = replyToAddr.split('@')[1];
  if (!senderDomain || !replyToDomain) return false;
  return senderDomain.toLowerCase() !== replyToDomain.toLowerCase();
}

/**
 * Parses authentication headers (SPF, DKIM, DMARC) from raw header lines.
 */
export function parseAuthHeaders(rawHeaders: string): EmailAuthResults {
  const result: EmailAuthResults = { spf: 'NONE', dkim: 'NONE', dmarc: 'NONE', rawHeader: rawHeaders };
  if (!rawHeaders) return result;

  const lower = rawHeaders.toLowerCase();
  if (lower.includes('spf=pass')) result.spf = 'PASS';
  else if (lower.includes('spf=fail') || lower.includes('spf=softfail')) result.spf = 'FAIL';

  if (lower.includes('dkim=pass')) result.dkim = 'PASS';
  else if (lower.includes('dkim=fail')) result.dkim = 'FAIL';

  if (lower.includes('dmarc=pass')) result.dmarc = 'PASS';
  else if (lower.includes('dmarc=fail')) result.dmarc = 'FAIL';

  return result;
}

/**
 * Safely parses RFC-822 or structured email input into a ParsedEmail structure.
 */
export function parseEmailMessage(input: {
  rawMime?: string;
  subject?: string;
  sender?: string;
  replyTo?: string;
  recipients?: string[];
  plainText?: string;
  htmlText?: string;
  attachments?: EmailAttachment[];
}): ParsedEmail {
  const id = `email-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  let subject = input.subject || '';
  let rawSender = input.sender || '';
  let rawReplyTo = input.replyTo || '';
  let plainText = input.plainText || '';
  let htmlText = input.htmlText || '';
  let headers: Record<string, string> = {};
  let attachments: EmailAttachment[] = input.attachments || [];

  // Parse raw RFC-822 MIME if supplied
  if (input.rawMime && input.rawMime.trim().length > 0) {
    const lines = input.rawMime.replace(/\r\n/g, '\n').split('\n');
    let headerMode = true;
    const bodyLines: string[] = [];
    let currentHeader = '';

    for (const line of lines) {
      if (headerMode) {
        if (line.trim() === '') {
          headerMode = false;
        } else if (/^[a-zA-Z0-9-]+:/.test(line)) {
          if (currentHeader) {
            const idx = currentHeader.indexOf(':');
            headers[currentHeader.substring(0, idx).toLowerCase()] = currentHeader.substring(idx + 1).trim();
          }
          currentHeader = line;
        } else {
          currentHeader += ' ' + line.trim();
        }
      } else {
        bodyLines.push(line);
      }
    }

    if (currentHeader) {
      const idx = currentHeader.indexOf(':');
      headers[currentHeader.substring(0, idx).toLowerCase()] = currentHeader.substring(idx + 1).trim();
    }

    subject = headers['subject'] || subject;
    rawSender = headers['from'] || rawSender;
    rawReplyTo = headers['reply-to'] || rawReplyTo;

    const fullBody = bodyLines.join('\n');
    if (headers['content-type']?.includes('html') || fullBody.includes('<html') || fullBody.includes('<body')) {
      htmlText = fullBody;
    } else {
      plainText = fullBody;
    }
  }

  const sender = parseEmailAddress(rawSender);
  const replyTo = rawReplyTo ? parseEmailAddress(rawReplyTo) : undefined;
  const senderMismatch = checkSenderMismatch(sender);
  const replyToMismatch = checkReplyToMismatch(sender.address, replyTo?.address);

  // Parse HTML
  const htmlParsed = parseHtmlBody(htmlText);
  const plainUrls = extractUrls(plainText);
  const allUrls = Array.from(new Set([...htmlParsed.urls, ...plainUrls]));

  // Combined extracted text (subject + plainText + htmlText)
  const extractedText = [
    subject ? `Subject: ${subject}` : '',
    sender.raw ? `From: ${sender.raw}` : '',
    replyTo?.raw ? `Reply-To: ${replyTo.raw}` : '',
    plainText.trim(),
    htmlParsed.text.trim(),
  ]
    .filter((t) => t.length > 0)
    .join('\n\n')
    .substring(0, MAX_EMAIL_TEXT_BYTES);

  // Mask PII
  const piiResult = maskPII(extractedText);
  const authResults = parseAuthHeaders(headers['authentication-results'] || headers['received-spf'] || '');

  return {
    id,
    subject,
    sender,
    replyTo,
    recipients: input.recipients || [],
    plainText,
    htmlText,
    extractedText: piiResult.masked,
    headers,
    authResults,
    links: htmlParsed.links,
    urls: allUrls,
    attachments: attachments.slice(0, MAX_ATTACHMENTS),
    senderMismatch,
    replyToMismatch,
    privacyStatus: piiResult.masked !== extractedText ? 'MASKED' : 'NO_SENSITIVE_DATA_DETECTED',
  };
}
