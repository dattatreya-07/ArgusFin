import { describe, it, expect } from 'vitest';
import { POST } from './route';
import { NextRequest } from 'next/server';

describe('/api/ask Route Handler', () => {
  it('returns verified answer with citations for valid regulatory query', async () => {
    const req = new NextRequest('http://localhost:3000/api/ask', {
      method: 'POST',
      body: JSON.stringify({
        query: 'How to report financial cyber fraud to 1930?',
        lang: 'en',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.verified).toBe(true);
    expect(json.citations.length).toBeGreaterThan(0);
    expect(json.answer).toContain('1930');
  });

  it('masks raw personal identifiers before processing query', async () => {
    const req = new NextRequest('http://localhost:3000/api/ask', {
      method: 'POST',
      body: JSON.stringify({
        query: 'I sent ₹50,000 to user@paytm and 9876543210 for copy trading advice.',
        lang: 'en',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.answer).not.toContain('9876543210');
  });

  it('rejects invalid body format with 400', async () => {
    const req = new NextRequest('http://localhost:3000/api/ask', {
      method: 'POST',
      body: JSON.stringify({ query: '' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
