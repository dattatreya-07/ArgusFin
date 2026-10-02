import { describe, it, expect } from 'vitest';
import { POST } from './draft/route';
import { NextRequest } from 'next/server';

describe('/api/report/draft Route Handler', () => {
  it('generates a structured, masked incident draft for valid input', async () => {
    const payload = {
      language: 'en',
      category: 'PROMISED_RETURN',
      incidentDate: '2026-09-20T10:00:00Z',
      platform: 'WhatsApp',
      entityName: 'Elite Wealth Advisors (Contact: 9876543210)',
      domain: 'https://elite-wealth.vip',
      totalAmount: 40000,
      paymentMethod: 'UPI',
      transactions: [
        {
          utrNumber: 'UTR492019283401',
          amount: 40000,
          beneficiaryAccountOrUpi: 'fraudster@okhdfcbank',
          paymentMethod: 'UPI',
        },
      ],
      narrative: 'Sent ₹40,000 to user at 9876543210 for stock doubling.',
      credentialsShared: false,
      otpShared: true,
      remoteAccessGranted: false,
    };

    const req = new NextRequest('http://localhost:3000/api/report/draft', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.status).toBe('READY');
    expect(data.draft).toBeDefined();
    expect(data.draft.header.documentType).toContain('CITIZEN FINANCIAL FRAUD');

    // Verify PII is masked
    expect(data.draft.incidentDetails.claimedEntityOrAdvisor).toContain('[PHONE]');
    expect(data.draft.narrative).toContain('[PHONE]');
    expect(data.draft.transactions[0].beneficiaryAccountOrUpi).toContain('[UPI]');

    // Verify consistency check and routing are included
    expect(data.draft.consistency.issues.length).toBeGreaterThan(0); // OTP shared issue
    expect(data.draft.routedAuthorities.status).toBe('ROUTED');
    expect(data.draft.routedAuthorities.authorityIds).toContain('national_cyber_helpline');
  });

  it('generates localized report draft in Hindi', async () => {
    const payload = {
      language: 'hi',
      incidentDate: '2026-09-20T10:00:00Z',
      platform: 'Telegram',
      totalAmount: 20000,
      narrative: 'टेलीग्राम ग्रुप पर निवेश का वादा किया गया था।',
    };

    const req = new NextRequest('http://localhost:3000/api/report/draft', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.draft.header.language).toBe('hi');
    expect(data.draft.header.documentType).toContain('नागरिक वित्तीय धोखाधड़ी');
  });

  it('rejects invalid payload with 400', async () => {
    const req = new NextRequest('http://localhost:3000/api/report/draft', {
      method: 'POST',
      body: JSON.stringify({
        totalAmount: -500, // Invalid negative amount
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.status).toBe('INVALID_INPUT');
  });
});
