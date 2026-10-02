import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { maskPII } from '@/lib/mask';
import { askRag } from '@/lib/rag';
import { Lang } from '@/lib/types';

const askRequestSchema = z
  .object({
    query: z.string().min(1, 'Query is required').max(1000, 'Max 1000 characters'),
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
  const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';

  if (!checkRateLimit(clientIp)) {
    return NextResponse.json(
      { error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests. Please slow down.' } },
      { status: 429 }
    );
  }

  try {
    const rawBody = await req.json();
    const parseResult = askRequestSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid ask request format',
            details: parseResult.error.flatten(),
          },
        },
        { status: 400 }
      );
    }

    const { query, lang } = parseResult.data;

    // Redact PII locally before any RAG or retrieval processing
    const masked = maskPII(query);
    const sanitizedQuery = masked.masked;

    const ragResult = await askRag(sanitizedQuery, lang as Lang);

    const durationMs = Date.now() - startTime;
    console.log(`[API /api/ask] status=200 verified=${ragResult.verified} lang=${lang} duration=${durationMs}ms`);

    return NextResponse.json(
      {
        answer: ragResult.answer,
        verified: ragResult.verified,
        citations: ragResult.citations,
        confidence: ragResult.confidence,
        language: ragResult.language,
      },
      { status: 200 }
    );
  } catch (error) {
    const durationMs = Date.now() - startTime;
    console.error(`[API /api/ask] status=500 duration=${durationMs}ms`);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to process RAG query' } },
      { status: 500 }
    );
  }
}
