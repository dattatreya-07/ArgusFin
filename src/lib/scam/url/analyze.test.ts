import { describe, it, expect } from 'vitest';
import { normalizeUrl } from './normalize';
import { isSsrfTarget } from './ssrf';
import { analyzeSingleUrl } from './analyze';
import { analyzeUrlsInText } from './index';

describe('CORE-01E Safe URL & Domain Intelligence', () => {

  it('normalizes URLs and redacts sensitive query parameters', () => {
    const raw = 'https://example.com/login?user=test&password=secret123&otp=999888!';
    const norm = normalizeUrl(raw);

    expect(norm.normalizedUrl).toContain('example.com/login');
    expect(norm.redactedUrl).toContain('password=[REDACTED]');
    expect(norm.redactedUrl).toContain('otp=[REDACTED]');
    expect(norm.redactedUrl).not.toContain('secret123');
  });

  it('detects SSRF targets and blocks loopback, private IPv4, and cloud metadata hostnames', () => {
    expect(isSsrfTarget('localhost')).toBe(true);
    expect(isSsrfTarget('127.0.0.1')).toBe(true);
    expect(isSsrfTarget('169.254.169.254')).toBe(true);
    expect(isSsrfTarget('10.0.1.50')).toBe(true);
    expect(isSsrfTarget('192.168.1.1')).toBe(true);
    expect(isSsrfTarget('file://etc/passwd', 'file')).toBe(true);

    expect(isSsrfTarget('sebi.gov.in')).toBe(false);
    expect(isSsrfTarget('rbi.org.in')).toBe(false);
  });

  it('flags IP host addresses', () => {
    const res = analyzeSingleUrl('http://192.0.2.1/login');
    expect(res.indicators.isIpHost).toBe(true);
    expect(res.explanationSignals).toContain('The URL uses an IP address instead of a conventional domain name.');
  });

  it('flags punycode and internationalized domain names', () => {
    const res = analyzeSingleUrl('http://xn--exmple-dua.com/trade');
    expect(res.indicators.isPunycode).toBe(true);
    expect(res.explanationSignals).toContain('The hostname uses internationalized/punycode encoding.');
  });

  it('flags known URL shorteners', () => {
    const res = analyzeSingleUrl('https://bit.ly/3xYz123');
    expect(res.indicators.isShortener).toBe(true);
    expect(res.explanationSignals).toContain('The link is shortened, so its final destination is not visible from the message.');
  });

  it('matches official trusted reference domains from data/domains/trusted.json', () => {
    const res = analyzeSingleUrl('https://www.sebi.gov.in/enforcement/orders');
    expect(res.indicators.unknownReferenceDomain).toBe(false);
    expect(res.explanationSignals.some((s) => s.includes('Securities and Exchange Board of India'))).toBe(true);
  });

  it('handles multiple URLs in a single text document independently', async () => {
    const text = 'Official site: https://www.sebi.gov.in and short link: https://bit.ly/3xYz123 and IP host: http://192.0.2.1/login';
    const res = await analyzeUrlsInText(text, 'DIRECT_TEXT');

    expect(res.urlCount).toBe(3);
    expect(res.urls[0].indicators.isShortener).toBe(false);
    expect(res.urls[1].indicators.isShortener).toBe(true);
    expect(res.urls[2].indicators.isIpHost).toBe(true);
  });
});
