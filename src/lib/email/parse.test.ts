import { describe, it, expect } from 'vitest';
import { parseEmailMessage, parseEmailAddress, parseHtmlBody, checkSenderMismatch, checkReplyToMismatch, parseAuthHeaders } from './parse';

describe('Email Parser Unit Tests', () => {
  it('parses raw RFC-822 MIME headers and body', () => {
    const rawMime = `From: SEBI Education <education@sebi.gov.in>\nReply-To: support@sebi.gov.in\nSubject: Investor Awareness Bulletin\nContent-Type: text/plain\n\nMutual funds are subject to market risks. Read all scheme documents carefully.`;
    const parsed = parseEmailMessage({ rawMime });

    expect(parsed.subject).toBe('Investor Awareness Bulletin');
    expect(parsed.sender.address).toBe('education@sebi.gov.in');
    expect(parsed.replyTo?.address).toBe('support@sebi.gov.in');
    expect(parsed.extractedText).toContain('Mutual funds are subject to market risks.');
  });

  it('parses email addresses with display names', () => {
    const parsed = parseEmailAddress('HDFC Bank Security <alerts@hdfcbank.com>');
    expect(parsed.displayName).toBe('HDFC Bank Security');
    expect(parsed.address).toBe('alerts@hdfcbank.com');
  });

  it('converts HTML body to text and extracts URLs and link mismatches', () => {
    const html = `<p>Please verify your account at <a href="https://fake-phishing-host.xyz/auth">https://netbanking.hdfcbank.com/login</a></p>`;
    const parsed = parseHtmlBody(html);

    expect(parsed.text).toContain('Please verify your account at https://netbanking.hdfcbank.com/login');
    expect(parsed.urls).toContain('https://fake-phishing-host.xyz/auth');
    expect(parsed.links[0].isMismatch).toBe(true);
  });

  it('detects brand display-name spoofing', () => {
    const isMismatch = checkSenderMismatch({
      displayName: 'HDFC Bank Security',
      address: 'attacker@free-crypto-giveaway.top',
    });
    expect(isMismatch).toBe(true);
  });

  it('detects Reply-To domain mismatch', () => {
    const isMismatch = checkReplyToMismatch('alerts@officialbank.com', 'collector@phishing-collector-domain.net');
    expect(isMismatch).toBe(true);
  });

  it('parses authentication headers for SPF/DKIM/DMARC status', () => {
    const auth = parseAuthHeaders('Authentication-Results: spf=fail dkim=fail dmarc=pass');
    expect(auth.spf).toBe('FAIL');
    expect(auth.dkim).toBe('FAIL');
    expect(auth.dmarc).toBe('PASS');
  });

  it('masks synthetic PII in email content', () => {
    const parsed = parseEmailMessage({
      subject: 'Account Certificate',
      plainText: 'Contact customer +919876543210 or email user@domain.com for details.',
    });
    expect(parsed.privacyStatus).toBe('MASKED');
    expect(parsed.extractedText).not.toContain('+919876543210');
  });
});
