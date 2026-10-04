import { describe, it, expect } from 'vitest';
import { routeAuthorities } from '@/lib/authorities/router';

describe('CORE-05 — Authority Routing Suite', () => {
  it('1. routes cyber financial fraud with money loss to 1930 Helpline, Cybercrime Portal, and Bank', () => {
    const res = routeAuthorities({
      category: 'CYBERCRIME_FINANCIAL_FRAUD',
      moneySent: true,
      hoursElapsed: 3,
      jurisdiction: 'IN',
    });

    expect(res.status).toBe('ROUTED');
    expect(res.authorityIds).toContain('national_cyber_helpline');
    expect(res.authorityIds).toContain('cybercrime_portal');
    expect(res.authorityIds).toContain('user_bank');
    expect(res.jurisdiction).toBe('IN');
  });

  it('2. routes securities investment complaints to SEBI SCORES and RBI Sachet', () => {
    const res = routeAuthorities({
      category: 'SECURITIES_INVESTMENT_COMPLAINT',
      platform: 'Telegram',
      jurisdiction: 'IN',
    });

    expect(res.status).toBe('ROUTED');
    expect(res.authorityIds).toContain('sebi_scores');
    expect(res.authorityIds).toContain('rbi_sachet');
  });

  it('3. routes telecom phishing / SMS to DoT Chakshu Portal', () => {
    const res = routeAuthorities({
      category: 'TELECOM_SPAM_PHISHING',
      platform: 'SMS',
      jurisdiction: 'IN',
    });

    expect(res.status).toBe('ROUTED');
    expect(res.authorityIds).toContain('telecom_fraud_reporting');
  });

  it('4. returns UNKNOWN_JURISDICTION status when jurisdiction is UNKNOWN or foreign', () => {
    const res = routeAuthorities({
      category: 'SECURITIES_INVESTMENT_COMPLAINT',
      jurisdiction: 'UNKNOWN',
    });

    expect(res.status).toBe('UNKNOWN_JURISDICTION');
    expect(res.routes.length).toBe(0);
    expect(res.reasons[0]).toContain('unsupported or unknown');
  });

  it('5. returns NO_MATCH status for benign educational questions', () => {
    const res = routeAuthorities({
      category: 'BENIGN',
      jurisdiction: 'IN',
    });

    expect(res.status).toBe('NO_MATCH');
    expect(res.routes.length).toBe(0);
  });

  it('6. produces non-defamatory rationale without calling entities scams', () => {
    const res = routeAuthorities({
      category: 'SECURITIES_INVESTMENT_COMPLAINT',
      platform: 'WhatsApp',
      jurisdiction: 'IN',
    });

    res.routes.forEach((r) => {
      expect(r.reason).not.toMatch(/is a scam\b|is a fraud\b|is criminal/i);
    });
  });
});
