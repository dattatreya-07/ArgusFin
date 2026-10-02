import { describe, expect, it, vi } from 'vitest';
import { POST } from './route';
import { NextRequest } from 'next/server';

function createPostRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost:3000/api/check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('/api/check Route Handler', () => {
  it('handles valid scam input and returns typed 200 response with rules-only engine', async () => {
    const sensitiveMessage = 'Double your money in 30 days! Contact +91 9876543210 on VIP Telegram.';
    const req = createPostRequest({
      maskedText: sensitiveMessage,
      lang: 'en',
    });

    const consoleLogSpy = vi.spyOn(console, 'log');

    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.band).toBe('HIGH');
    expect(data.archetype.top).toBeDefined();
    expect(data.engine).toBe('rules-only');
    expect(data.flags.length).toBeGreaterThan(0);
    expect(data.unverified.length).toBeGreaterThan(0);
    expect(data.nextSteps.length).toBe(2);

    // Guardrail Check: No result text contains "safe"
    const responseString = JSON.stringify(data).toLowerCase();
    expect(responseString).not.toContain('"band":"safe"');
    expect(data.band).not.toBe('safe');

    // Privacy Check: No raw console log received raw phone number or message
    for (const callArgs of consoleLogSpy.mock.calls) {
      const loggedStr = callArgs.join(' ');
      expect(loggedStr).not.toContain('9876543210');
      expect(loggedStr).not.toContain('Double your money');
    }

    consoleLogSpy.mockRestore();
  });

  it('rejects malformed or invalid request body with 400', async () => {
    const req = createPostRequest({
      invalidField: 'test',
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.error.code).toBe('VALIDATION_ERROR');
  });

  it('evaluates benign message as LOW_SIGNALS or CANNOT_VERIFY, never "safe"', async () => {
    const benignText = 'Index fund investments track the broad market and are subject to market volatility.';
    const req = createPostRequest({
      maskedText: benignText,
      lang: 'en',
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(['LOW_SIGNALS', 'CANNOT_VERIFY']).toContain(data.band);
    expect(data.band).not.toBe('safe');
  });
});
