import { describe, it, expect } from 'vitest';
import { maskPII } from '@/lib/mask';
import { analyzeScam } from '@/lib/scam/analyze';

describe('CORE-04 — Privacy & PII Protection Suite', () => {
  it('1. masks phone numbers and UPI IDs prior to downstream processing', () => {
    const rawText = 'Send ₹10,000 to 9876543210 or UPI user@okaxis for guaranteed profit.';
    const res = maskPII(rawText);

    expect(res.masked).not.toContain('9876543210');
    expect(res.masked).not.toContain('user@okaxis');
    expect(res.masked).toContain('[PHONE]');
    expect(res.counts.phone).toBeGreaterThan(0);
    expect(res.counts.upi).toBeGreaterThan(0);
  });

  it('2. verifies analyzeScam does not leak raw PII in output signals or evidence', async () => {
    const rawText = 'Call 9876543210 or UPI admin.sharma@paytm to receive double return.';
    const res = await analyzeScam({ source: 'WEB_TEXT', text: rawText });

    const resultString = JSON.stringify(res);
    expect(resultString).not.toContain('9876543210');
    expect(resultString).not.toContain('admin.sharma@paytm');
  });
});
