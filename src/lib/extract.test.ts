import { describe, expect, it } from 'vitest';
import { extractClaims } from './extract';

describe('extractClaims', () => {
  it('extracts English promised returns, urgency, and group requests', () => {
    const text =
      'Double your money in 30 days! Guaranteed 2x returns. Limited slots only today. Join our VIP group at https://t.me/example.';
    const claims = extractClaims(text, 'en');

    expect(claims.promisedReturns.length).toBeGreaterThan(0);
    expect(claims.promisedReturns[0].multiple).toBe(2);
    expect(claims.promisedReturns[0].durationDays).toBe(30);
    expect(claims.promisedReturns[0].guaranteed).toBe(true);

    expect(claims.urgencyPhrases).toContain('limited slots');
    expect(claims.requests).toContain('GROUP_JOIN');
    expect(claims.urls).toContain('https://t.me/example');
  });

  it('extracts English payment and personal account tokens', () => {
    const text = 'Send registration fee to [UPI] or [ACCOUNT_OR_ID] to activate copy trading.';
    const claims = extractClaims(text, 'en');

    expect(claims.requests).toContain('PAYMENT');
    expect(claims.requests).toContain('PERSONAL_ACCOUNT');
  });

  it('extracts Hindi multiples, urgency, and app download claims', () => {
    const text = '30 दिन में पैसा दोगुना करें! सीमित स्लॉट। ऐप डाउनलोड करें और पैसे भेजें।';
    const claims = extractClaims(text, 'hi');

    expect(claims.promisedReturns.length).toBeGreaterThan(0);
    expect(claims.promisedReturns[0].multiple).toBe(2);
    expect(claims.promisedReturns[0].durationDays).toBe(30);
    expect(claims.urgencyPhrases).toContain('सीमित स्लॉट');
    expect(claims.requests).toContain('APP_INSTALL');
    expect(claims.requests).toContain('PAYMENT');
  });

  it('extracts Tamil multiples, guarantee, and group join claims', () => {
    const text = '30 நாட்களில் உங்கள் பணம் இரட்டிப்பு! 100% உத்தரவாதம். வரையறுக்கப்பட்ட இடங்கள். VIP குழுவில் இணையுங்கள்.';
    const claims = extractClaims(text, 'ta');

    expect(claims.promisedReturns.length).toBeGreaterThan(0);
    expect(claims.promisedReturns[0].multiple).toBe(2);
    expect(claims.promisedReturns[0].guaranteed).toBe(true);
    expect(claims.urgencyPhrases).toContain('வரையறுக்கப்பட்ட இடங்கள்');
    expect(claims.requests).toContain('GROUP_JOIN');
  });

  it('extracts registration claims and handles', () => {
    const text = 'Official advisor SEBI registered. Reach out to @expert_trader for guaranteed profits.';
    const claims = extractClaims(text, 'en');

    expect(claims.registrationClaims.length).toBeGreaterThan(0);
    expect(claims.handles).toContain('@expert_trader');
  });
});
