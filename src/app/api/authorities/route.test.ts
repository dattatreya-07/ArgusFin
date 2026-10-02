import { describe, it, expect } from 'vitest';
import { GET, POST } from './route';
import { NextRequest } from 'next/server';

describe('/api/authorities Route Handler', () => {
  it('handles GET requests with situation query param and returns structured routed authorities', async () => {
    const req = new NextRequest('http://localhost:3000/api/authorities?situation=money_lost_recent');
    const res = await GET(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.status).toBe('ROUTED');
    expect(data.authorities.length).toBeGreaterThan(0);
    expect(data.authorityIds).toContain('national_cyber_helpline');
    expect(data.disclaimer).toBeDefined();
  });

  it('handles POST requests with structured incident inputs and returns routed authorities', async () => {
    const req = new NextRequest('http://localhost:3000/api/authorities', {
      method: 'POST',
      body: JSON.stringify({
        category: 'SECURITIES_FRAUD',
        platform: 'Telegram',
        moneySent: false,
        lang: 'hi',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.status).toBe('ROUTED');
    expect(data.authorityIds).toContain('sebi_scores');
  });

  it('returns 400 for invalid JSON body on POST', async () => {
    const req = new NextRequest('http://localhost:3000/api/authorities', {
      method: 'POST',
      body: 'invalid-json',
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error.code).toBe('VALIDATION_ERROR');
  });
});
