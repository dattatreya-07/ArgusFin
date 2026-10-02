import { describe, it, expect } from 'vitest';
import { maskPII } from './mask';
import { extractAndNormalizeDomain } from './signals/rdap';

describe('Privacy Boundary & Security Tests (P2-01 -> P2-05)', () => {
  describe('PII Redaction Boundary', () => {
    it('redacts Indian mobile phone numbers completely', () => {
      const input = 'Call 9876543210 or +91-9123456789 for guaranteed returns';
      const result = maskPII(input);
      expect(result.masked).not.toContain('9876543210');
      expect(result.masked).not.toContain('9123456789');
      expect(result.masked).toContain('[PHONE]');
      expect(result.counts.phone).toBeGreaterThanOrEqual(2);
    });

    it('redacts UPI payment handles and VPA identifiers', () => {
      const input = 'Send payment to scammer@okaxis or user.trade@upi immediately';
      const result = maskPII(input);
      expect(result.masked).not.toContain('scammer@okaxis');
      expect(result.masked).not.toContain('user.trade@upi');
      expect(result.masked).toContain('[UPI]');
      expect(result.counts.upi).toBe(2);
    });

    it('redacts email addresses', () => {
      const input = 'Contact our VIP support at support@fake-trading-academy.org';
      const result = maskPII(input);
      expect(result.masked).not.toContain('support@fake-trading-academy.org');
      expect(result.masked).toContain('[EMAIL]');
      expect(result.counts.email).toBe(1);
    });

    it('redacts bank account numbers (9 to 18 digits)', () => {
      const input = 'Deposit funds into Account No: 12345678901234 with IFSC SBIN0001234';
      const result = maskPII(input);
      expect(result.masked).not.toContain('12345678901234');
      expect(result.masked).toContain('[ACCOUNT_OR_ID]');
    });

    it('redacts PAN card numbers', () => {
      const input = 'Send KYC details with PAN ABCDE1234F for verification';
      const result = maskPII(input);
      expect(result.masked).not.toContain('ABCDE1234F');
      expect(result.masked).toContain('[PAN]');
      expect(result.counts.pan).toBe(1);
    });

    it('handles mixed-language text containing PII in Hindi and Tamil', () => {
      const hiInput = 'कृपया मुझे 9876543210 पर कॉल करें और pay@icici पर पैसे भेजें';
      const hiRes = maskPII(hiInput);
      expect(hiRes.masked).not.toContain('9876543210');
      expect(hiRes.masked).not.toContain('pay@icici');

      const taInput = 'தொடர்புக்கு 9123456780 அல்லது user@okhdfcbank ஐ அணுகவும்';
      const taRes = maskPII(taInput);
      expect(taRes.masked).not.toContain('9123456780');
      expect(taRes.masked).not.toContain('user@okhdfcbank');
    });
  });

  describe('SSRF Protection in Domain Normalization', () => {
    it('blocks localhost and loopback addresses', () => {
      expect(extractAndNormalizeDomain('http://localhost:8080/admin')).toBeNull();
      expect(extractAndNormalizeDomain('http://127.0.0.1:3000/api')).toBeNull();
      expect(extractAndNormalizeDomain('https://0.0.0.0')).toBeNull();
    });

    it('blocks private IP ranges (10.x, 172.16-31.x, 192.168.x, 169.254.x)', () => {
      expect(extractAndNormalizeDomain('http://10.0.0.1/secret')).toBeNull();
      expect(extractAndNormalizeDomain('http://192.168.1.1/router')).toBeNull();
      expect(extractAndNormalizeDomain('http://172.16.0.1/dashboard')).toBeNull();
      expect(extractAndNormalizeDomain('http://169.254.169.254/latest/meta-data/')).toBeNull();
    });

    it('blocks internal/private TLDs (.local, .internal, .lan)', () => {
      expect(extractAndNormalizeDomain('http://server.local')).toBeNull();
      expect(extractAndNormalizeDomain('http://metadata.google.internal')).toBeNull();
      expect(extractAndNormalizeDomain('http://myhost.lan')).toBeNull();
    });

    it('allows valid public domain names', () => {
      expect(extractAndNormalizeDomain('https://zerodha.com')).toBe('zerodha.com');
      expect(extractAndNormalizeDomain('groww.in')).toBe('groww.in');
      expect(extractAndNormalizeDomain('https://sebi.gov.in/enforcement')).toBe('sebi.gov.in');
    });
  });
});
