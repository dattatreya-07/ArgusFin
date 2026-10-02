import { NextRequest, NextResponse } from 'next/server';
import { routeAuthorities, getVerifiedAuthorities } from '@/lib/authorities';
import { RoutingInput } from '@/lib/authorities/types';
import { maskPii } from '@/lib/privacy';
import { generateRequestId, logAppEvent } from '@/lib/observability';

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  const requestId = req.headers.get('x-request-id') || generateRequestId();

  try {
    const { searchParams } = new URL(req.url);
    const situation = searchParams.get('situation') || undefined;
    const category = searchParams.get('category') || undefined;
    const platform = searchParams.get('platform') || undefined;
    const moneySent = searchParams.get('moneySent') === 'true' || undefined;
    const lang = (searchParams.get('lang') as any) || 'en';

    const input: RoutingInput = {
      situation,
      category,
      platform,
      moneySent,
      lang,
    };

    const routeResult = routeAuthorities(input);
    const allAuthorities = getVerifiedAuthorities();

    logAppEvent({
      name: 'authority_routing',
      requestId,
      route: '/api/authorities',
      subsystem: 'authorities',
      status: 'success',
      language: lang,
      durationMs: Date.now() - startTime,
    });

    return NextResponse.json(
      {
        requestId,
        ...routeResult,
        authorities: routeResult.routes,
        allAuthorities,
      },
      { status: 200 }
    );
  } catch (err: any) {
    logAppEvent({
      name: 'request_failed',
      requestId,
      route: '/api/authorities',
      subsystem: 'authorities',
      status: 'failure',
      errorCode: 'INTERNAL_ERROR',
      durationMs: Date.now() - startTime,
    });

    return NextResponse.json(
      {
        requestId,
        status: 'UNAVAILABLE',
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to evaluate authority routing.',
        },
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const requestId = req.headers.get('x-request-id') || generateRequestId();

  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      logAppEvent({
        name: 'validation_failure',
        requestId,
        route: '/api/authorities',
        subsystem: 'authorities',
        status: 'failure',
        errorCode: 'VALIDATION_ERROR',
        durationMs: Date.now() - startTime,
      });

      return NextResponse.json(
        {
          requestId,
          status: 'NO_MATCH',
          error: { code: 'VALIDATION_ERROR', message: 'Malformed JSON payload.' },
        },
        { status: 400 }
      );
    }

    const input: RoutingInput = {
      situation: typeof body.situation === 'string' ? body.situation : undefined,
      category: typeof body.category === 'string' ? body.category : undefined,
      archetype: typeof body.archetype === 'string' ? body.archetype : undefined,
      riskBand: typeof body.riskBand === 'string' ? body.riskBand : undefined,
      platform: typeof body.platform === 'string' ? maskPii(body.platform) : undefined,
      paymentMethod: typeof body.paymentMethod === 'string' ? body.paymentMethod : undefined,
      moneySent: typeof body.moneySent === 'boolean' ? body.moneySent : undefined,
      credentialsShared: typeof body.credentialsShared === 'boolean' ? body.credentialsShared : undefined,
      otpShared: typeof body.otpShared === 'boolean' ? body.otpShared : undefined,
      remoteAccessGranted: typeof body.remoteAccessGranted === 'boolean' ? body.remoteAccessGranted : undefined,
      hoursElapsed: typeof body.hoursElapsed === 'number' ? body.hoursElapsed : undefined,
      jurisdiction: typeof body.jurisdiction === 'string' ? body.jurisdiction : undefined,
      lang: body.lang === 'hi' || body.lang === 'ta' ? body.lang : 'en',
    };

    const routeResult = routeAuthorities(input);
    const allAuthorities = getVerifiedAuthorities();

    logAppEvent({
      name: 'authority_routing',
      requestId,
      route: '/api/authorities',
      subsystem: 'authorities',
      status: 'success',
      language: input.lang,
      durationMs: Date.now() - startTime,
    });

    return NextResponse.json(
      {
        requestId,
        ...routeResult,
        authorities: routeResult.routes,
        allAuthorities,
      },
      { status: 200 }
    );
  } catch (err: any) {
    logAppEvent({
      name: 'request_failed',
      requestId,
      route: '/api/authorities',
      subsystem: 'authorities',
      status: 'failure',
      errorCode: 'INTERNAL_ERROR',
      durationMs: Date.now() - startTime,
    });

    return NextResponse.json(
      {
        requestId,
        status: 'UNAVAILABLE',
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to process authority routing request.',
        },
      },
      { status: 500 }
    );
  }
}
