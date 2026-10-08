import { NextRequest, NextResponse } from 'next/server';
import { getN8nAuthConfig, verifyN8nSecret } from '@/lib/integrations/n8n/auth';
import {
  validateN8nRequest,
  processN8nAnalysis,
  IntegrationValidationError,
} from '@/lib/integrations/n8n/handler';
import { generateRequestId, logAppEvent } from '@/lib/observability';

// Rate Limiter: 60 requests per minute per IP / token
const rateLimitMap = new Map<string, { count: number; windowStart: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 60;

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(key, { count: 1, windowStart: now });
    return false;
  }
  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }
  entry.count += 1;
  return false;
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const requestId = generateRequestId();
  const authConfig = getN8nAuthConfig();

  // 1. Secret Authentication Check
  const secretHeader = req.headers.get('x-n8n-secret');
  const authHeader = req.headers.get('authorization');

  if (!verifyN8nSecret(secretHeader, authHeader, authConfig.secret)) {
    logAppEvent({
      name: 'request_failed',
      requestId,
      route: '/api/integrations/n8n/analyze',
      subsystem: 'n8n_integration',
      status: 'failure',
      errorCode: 'N8N_AUTH_FAILED',
    });

    return NextResponse.json(
      {
        status: 'ERROR',
        errorCode: 'N8N_AUTH_FAILED',
        message: 'Integration authentication failed. Invalid or missing x-n8n-secret token.',
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid or missing n8n integration secret token.',
          requestId,
        },
      },
      { status: 401 }
    );
  }

  // 2. Rate Limiting Check
  const clientKey = secretHeader || req.headers.get('x-forwarded-for') || 'n8n-client';
  if (isRateLimited(clientKey)) {
    return NextResponse.json(
      {
        status: 'ERROR',
        errorCode: 'RATE_LIMITED',
        message: 'Too many analysis requests. Please rate-limit n8n workflow execution.',
        error: {
          code: 'RATE_LIMITED',
          message: 'Too many analysis requests. Please rate-limit n8n workflow execution.',
          requestId,
        },
      },
      { status: 429 }
    );
  }

  // 3. Request Parsing & Validation
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      {
        status: 'ERROR',
        errorCode: 'N8N_BAD_REQUEST',
        message: 'Malformed JSON payload.',
        error: {
          code: 'INVALID_REQUEST',
          message: 'Malformed JSON payload.',
          requestId,
        },
      },
      { status: 400 }
    );
  }

  try {
    const validRequest = validateN8nRequest(body);

    // 4. Process Canonical Analysis with timeout guard
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('SANGYAN_TIMEOUT')), 10000)
    );

    const responseDTO = (await Promise.race([
      processN8nAnalysis(validRequest, requestId),
      timeoutPromise,
    ])) as any;

    const durationMs = Date.now() - startTime;
    logAppEvent({
      name: 'request_completed',
      requestId,
      route: '/api/integrations/n8n/analyze',
      subsystem: 'n8n_integration',
      status: 'success',
      durationMs,
    });

    return NextResponse.json(responseDTO, { status: 200 });
  } catch (err: any) {
    const durationMs = Date.now() - startTime;

    if (err.message === 'SANGYAN_TIMEOUT') {
      logAppEvent({
        name: 'request_failed',
        requestId,
        route: '/api/integrations/n8n/analyze',
        subsystem: 'n8n_integration',
        status: 'failure',
        errorCode: 'SANGYAN_TIMEOUT',
        durationMs,
      });

      return NextResponse.json(
        {
          status: 'ERROR',
          errorCode: 'SANGYAN_TIMEOUT',
          message: 'SANGYAN analysis timed out before completion.',
          error: {
            code: 'SANGYAN_TIMEOUT',
            message: 'Analysis timed out. Please try again shortly.',
            requestId,
          },
        },
        { status: 504 }
      );
    }

    if (err instanceof IntegrationValidationError) {
      logAppEvent({
        name: 'request_failed',
        requestId,
        route: '/api/integrations/n8n/analyze',
        subsystem: 'n8n_integration',
        status: 'failure',
        errorCode: err.code,
        durationMs,
      });

      return NextResponse.json(
        {
          status: 'ERROR',
          errorCode: err.code === 'INVALID_REQUEST' ? 'N8N_BAD_REQUEST' : err.code,
          message: err.message,
          error: {
            code: err.code,
            message: err.message,
            requestId,
          },
        },
        { status: err.statusCode }
      );
    }

    logAppEvent({
      name: 'request_failed',
      requestId,
      route: '/api/integrations/n8n/analyze',
      subsystem: 'n8n_integration',
      status: 'failure',
      errorCode: 'SANGYAN_INTERNAL_ERROR',
      durationMs,
    });

    return NextResponse.json(
      {
        status: 'ERROR',
        errorCode: 'SANGYAN_INTERNAL_ERROR',
        message: 'An internal error occurred while processing canonical scam analysis.',
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An internal error occurred while processing canonical scam analysis.',
          requestId,
        },
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  const authConfig = getN8nAuthConfig();
  return NextResponse.json({
    integration: 'n8n',
    status: authConfig.secret ? 'CONFIGURED' : 'NOT_CONFIGURED',
    endpoint: '/api/integrations/n8n/analyze',
    supportedChannels: ['TELEGRAM', 'WHATSAPP'],
    supportedLocales: ['en', 'hi', 'ta'],
    authenticationHeader: 'x-n8n-secret or Authorization: Bearer <N8N_INTEGRATION_SECRET>',
  });
}
