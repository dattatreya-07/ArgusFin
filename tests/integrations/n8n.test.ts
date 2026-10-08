import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { POST, GET } from '../../src/app/api/integrations/n8n/analyze/route';

describe('Workstream E — Telegram / n8n Integration Reliability', () => {
  it('should return 200 SUCCESS for valid Telegram message payload', async () => {
    const payload = {
      channel: 'TELEGRAM',
      message: {
        id: 'tg-msg-999',
        text: 'Guaranteed 25% daily profit on VIP bot! Send ₹5000 to get started.',
      },
      locale: 'en',
      provenance: {
        senderId: 'user_12345',
        timestamp: new Date().toISOString(),
        channelId: '-100123456789',
      },
    };

    const req = new NextRequest('http://localhost:3000/api/integrations/n8n/analyze', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'content-type': 'application/json',
      },
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.status).toBe('SUCCESS');
    expect(json.decision).toBeDefined();
    expect(json.decision.band).toBe('HIGH');
    expect(json.formattedMessage).toBeTruthy();
    expect(json.formattedMessage).toContain('🚨');
  });

  it('should return 400 with N8N_BAD_REQUEST when payload is malformed', async () => {
    const req = new NextRequest('http://localhost:3000/api/integrations/n8n/analyze', {
      method: 'POST',
      body: 'invalid-json-structure',
      headers: {
        'content-type': 'application/json',
      },
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.status).toBe('ERROR');
    expect(json.errorCode).toBe('N8N_BAD_REQUEST');
  });

  it('should reject unsupported channel', async () => {
    const payload = {
      channel: 'DISCORD',
      message: {
        id: 'msg-1',
        text: 'Hello world',
      },
    };

    const req = new NextRequest('http://localhost:3000/api/integrations/n8n/analyze', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'content-type': 'application/json',
      },
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error.code).toBe('UNSUPPORTED_CHANNEL');
  });

  it('should reject missing message id', async () => {
    const payload = {
      channel: 'TELEGRAM',
      message: {
        text: 'Hello world',
      },
    };

    const req = new NextRequest('http://localhost:3000/api/integrations/n8n/analyze', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'content-type': 'application/json',
      },
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('should reject oversized text payload with 413', async () => {
    const hugeText = 'A'.repeat(20000);
    const payload = {
      channel: 'TELEGRAM',
      message: {
        id: 'msg-huge',
        text: hugeText,
      },
    };

    const req = new NextRequest('http://localhost:3000/api/integrations/n8n/analyze', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'content-type': 'application/json',
      },
    });

    const res = await POST(req);
    expect(res.status).toBe(413);
  });

  it('should return integration configuration status via GET', async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.integration).toBe('n8n');
    expect(json.endpoint).toBe('/api/integrations/n8n/analyze');
  });
});
