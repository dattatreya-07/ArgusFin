import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateRequestId, logAppEvent } from '@/lib/observability';
import { analyzeScam } from '@/lib/scam/analyze';
import { CanonicalInput } from '@/lib/scam/types';

const checkRequestSchema = z
  .object({
    maskedText: z.string().min(1, 'Masked text is required').max(4000, 'Max 4000 characters'),
    lang: z.enum(['en', 'hi', 'ta']).default('en'),
  })
  .strict();

// In-memory rate limiting: 30 req / minute per IP
const ipRateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 30;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = ipRateLimitMap.get(ip);

  if (!record || now > record.resetAt) {
    ipRateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  record.count += 1;
  return true;
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const requestId = req.headers.get('x-request-id') || generateRequestId();
  const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';

  logAppEvent({
    name: 'request_received',
    requestId,
    route: '/api/check',
    subsystem: 'check',
    status: 'success',
  });

  if (!checkRateLimit(clientIp)) {
    logAppEvent({
      name: 'rate_limit_rejection',
      requestId,
      route: '/api/check',
      subsystem: 'check',
      status: 'failure',
      errorCode: 'RATE_LIMITED',
      durationMs: Date.now() - startTime,
    });

    return NextResponse.json(
      {
        requestId,
        error: { code: 'RATE_LIMITED', message: 'Too many requests. Please slow down.' },
      },
      { status: 429 }
    );
  }

  try {
    const rawBody = await req.json();
    const parseResult = checkRequestSchema.safeParse(rawBody);

    if (!parseResult.success) {
      logAppEvent({
        name: 'validation_failure',
        requestId,
        route: '/api/check',
        subsystem: 'check',
        status: 'failure',
        errorCode: 'VALIDATION_ERROR',
        durationMs: Date.now() - startTime,
      });

      return NextResponse.json(
        {
          requestId,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid check request format',
            details: parseResult.error.flatten(),
          },
        },
        { status: 400 }
      );
    }

    const { maskedText, lang } = parseResult.data;

    // Delegate to canonical engine
    const canonicalInput: CanonicalInput = {
      source: 'WEB_TEXT',
      language: lang,
      text: maskedText,
      privacyStatus: 'MASKED',
    };

    const analysis = await analyzeScam(canonicalInput);

    const durationMs = Date.now() - startTime;
    logAppEvent({
      name: 'request_completed',
      requestId,
      route: '/api/check',
      subsystem: 'check',
      status: 'success',
      language: lang,
      durationMs,
    });

    return NextResponse.json(
      {
        requestId,
        band: analysis.decision.band,
        archetype: analysis.decision.archetype,
        confidence: analysis.decision.confidence,
        flags: analysis.flags,
        signals: analysis.signals,
        domainSignals: [],
        alertMatches: [],
        unverified: analysis.explanation.whatCouldNotBeVerified,
        explanation: analysis.explanation.summary,
        structuredExplanation: analysis.structuredExplanation,
        citations: analysis.explanation.citations,
        nextSteps: analysis.explanation.nextSteps,
        engine: analysis.decision.engine,
      },
      { status: 200 }
    );
  } catch {
    const durationMs = Date.now() - startTime;
    logAppEvent({
      name: 'request_failed',
      requestId,
      route: '/api/check',
      subsystem: 'check',
      status: 'failure',
      errorCode: 'INTERNAL_ERROR',
      durationMs,
    });

    return NextResponse.json(
      { requestId, error: { code: 'INTERNAL_ERROR', message: 'Failed to evaluate check request' } },
      { status: 500 }
    );
  }
}
