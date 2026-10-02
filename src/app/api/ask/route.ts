import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { maskPII } from '@/lib/mask';
import { askRag } from '@/lib/rag';
import { Lang } from '@/lib/types';
import { generateRequestId, logAppEvent } from '@/lib/observability';

const askRequestSchema = z
  .object({
    query: z.string().min(1, 'Query is required').max(1000, 'Max 1000 characters').optional(),
    question: z.string().min(1, 'Question is required').max(1000, 'Max 1000 characters').optional(),
    lang: z.enum(['en', 'hi', 'ta']).optional(),
    language: z.enum(['en', 'hi', 'ta']).optional(),
  })
  .refine((data) => !!(data.query || data.question), {
    message: 'Either query or question must be provided',
  });

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
    route: '/api/ask',
    subsystem: 'ask',
    status: 'success',
  });

  if (!checkRateLimit(clientIp)) {
    logAppEvent({
      name: 'rate_limit_rejection',
      requestId,
      route: '/api/ask',
      subsystem: 'ask',
      status: 'failure',
      errorCode: 'RATE_LIMITED',
      durationMs: Date.now() - startTime,
    });

    return NextResponse.json(
      {
        requestId,
        status: 'UNAVAILABLE',
        error: { code: 'RATE_LIMITED', message: 'Too many requests. Please slow down.' },
      },
      { status: 429 }
    );
  }

  try {
    const rawBody = await req.json();
    const parseResult = askRequestSchema.safeParse(rawBody);

    if (!parseResult.success) {
      logAppEvent({
        name: 'validation_failure',
        requestId,
        route: '/api/ask',
        subsystem: 'ask',
        status: 'failure',
        errorCode: 'VALIDATION_ERROR',
        durationMs: Date.now() - startTime,
      });

      return NextResponse.json(
        {
          requestId,
          status: 'INVALID_REQUEST',
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid ask request format',
            details: parseResult.error.flatten(),
          },
        },
        { status: 400 }
      );
    }

    const rawQuery = parseResult.data.query || parseResult.data.question || '';
    const lang = (parseResult.data.lang || parseResult.data.language || 'en') as Lang;

    // Redact PII locally before any RAG or retrieval processing
    const masked = maskPII(rawQuery);
    const sanitizedQuery = masked.masked;

    const ragResult = await askRag(sanitizedQuery, lang);

    const durationMs = Date.now() - startTime;
    logAppEvent({
      name: ragResult.status === 'ANSWERED' ? 'rag_retrieval' : 'rag_no_source',
      requestId,
      route: '/api/ask',
      subsystem: 'ask',
      status: 'success',
      language: lang,
      durationMs,
      metadata: {
        verified: ragResult.verified,
        citationsCount: ragResult.citations.length,
      },
    });

    logAppEvent({
      name: 'request_completed',
      requestId,
      route: '/api/ask',
      subsystem: 'ask',
      status: 'success',
      language: lang,
      durationMs,
    });

    return NextResponse.json(
      {
        requestId,
        status: ragResult.status,
        answer: ragResult.answer,
        verified: ragResult.verified,
        citations: ragResult.citations,
        confidence: ragResult.confidence,
        language: ragResult.language,
        uncertainty: ragResult.uncertainty,
      },
      { status: 200 }
    );
  } catch (error) {
    const durationMs = Date.now() - startTime;
    logAppEvent({
      name: 'request_failed',
      requestId,
      route: '/api/ask',
      subsystem: 'ask',
      status: 'failure',
      errorCode: 'INTERNAL_ERROR',
      durationMs,
    });

    return NextResponse.json(
      {
        requestId,
        status: 'UNAVAILABLE',
        error: { code: 'INTERNAL_ERROR', message: 'Failed to process RAG query' },
      },
      { status: 500 }
    );
  }
}
