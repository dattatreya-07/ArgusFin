import { describe, expect, it } from 'vitest';
import { maskPII } from './mask';

describe('maskPII', () => {
  it('masks Indian mobile numbers in various formats', () => {
    const input1 = 'Call me at 9876543210 for tips.';
    const res1 = maskPII(input1);
    expect(res1.masked).toBe('Call me at [PHONE] for tips.');
    expect(res1.counts.phone).toBe(1);

    const input2 = 'WhatsApp +91 98765 43210 or +91-98765-43210 now!';
    const res2 = maskPII(input2);
    expect(res2.masked).toBe('WhatsApp [PHONE] or [PHONE] now!');
    expect(res2.counts.phone).toBe(2);
  });

  it('masks UPI IDs', () => {
    const input = 'Send money to invest.quick@okaxis or trader99@paytm or boss@okhdfcbank';
    const res = maskPII(input);
    expect(res.masked).toBe('Send money to [UPI] or [UPI] or [UPI]');
    expect(res.counts.upi).toBe(3);
  });

  it('masks email addresses', () => {
    const input = 'Contact support@fraud-broker.com or info@fakeadvisory.in for details.';
    const res = maskPII(input);
    expect(res.masked).toBe('Contact [EMAIL] or [EMAIL] for details.');
    expect(res.counts.email).toBe(2);
  });

  it('masks PAN cards', () => {
    const input = 'My PAN number is ABCDE1234F provided for verification.';
    const res = maskPII(input);
    expect(res.masked).toBe('My PAN number is [PAN] provided for verification.');
    expect(res.counts.pan).toBe(1);
  });

  it('masks long digit runs and Aadhaar-like numbers', () => {
    const input1 = 'Aadhaar: 1234 5678 9012 and account number 123456789012345';
    const res1 = maskPII(input1);
    expect(res1.masked).toBe('Aadhaar: [ACCOUNT_OR_ID] and account number [ACCOUNT_OR_ID]');
    expect(res1.counts.accountOrId).toBe(2);
  });

  it('does NOT mask normal currency amounts or percentages (false positive prevention)', () => {
    const input = 'Invest ₹10,000 to get ₹20,000 or 1,00,000 in 30 days. Guaranteed 4598% return and 15.5% annual.';
    const res = maskPII(input);
    expect(res.masked).toContain('₹10,000');
    expect(res.masked).toContain('₹20,000');
    expect(res.masked).toContain('1,00,000');
    expect(res.masked).toContain('4598%');
    expect(res.masked).toContain('15.5%');
    expect(res.counts.phone).toBe(0);
    expect(res.counts.accountOrId).toBe(0);
  });

  it('does NOT corrupt URLs containing query strings or numbers', () => {
    const input = 'Visit https://sebi.gov.in/portal/check?id=9876543210123 for verification.';
    const res = maskPII(input);
    expect(res.masked).toBe('Visit https://sebi.gov.in/portal/check?id=9876543210123 for verification.');
    expect(res.counts.accountOrId).toBe(0);
  });

  it('does NOT mask calendar dates', () => {
    const input = 'Dated 2026-10-02 or 02/10/2026 or 2024-01-15.';
    const res = maskPII(input);
    expect(res.masked).toBe('Dated 2026-10-02 or 02/10/2026 or 2024-01-15.');
    expect(res.counts.accountOrId).toBe(0);
  });

  it('handles empty or non-string input safely', () => {
    // @ts-expect-error testing invalid runtime input
    const res1 = maskPII(null);
    expect(res1.masked).toBe('');
    expect(res1.counts.phone).toBe(0);

    const res2 = maskPII('');
    expect(res2.masked).toBe('');
  });
});
