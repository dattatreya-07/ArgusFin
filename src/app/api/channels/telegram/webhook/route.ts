import { NextRequest, NextResponse } from 'next/server';
import { handleTelegramUpdate, verifyTelegramWebhookSecret, getTelegramConfig } from '@/lib/channels/telegram';
import { TelegramUpdate } from '@/lib/channels/types';
import { generateRequestId, logAppEvent } from '@/lib/observability';

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const requestId = generateRequestId();
  const config = getTelegramConfig();

  // 1. Check if Telegram Bot is configured
  if (!config.botToken) {
    return NextResponse.json(
      {
        status: 'UNAVAILABLE',
        error: { code: 'CONFIGURATION_ERROR', message: 'Telegram bot adapter is not configured.' },
      },
      { status: 503 }
    );
  }

  // 2. Authenticate Webhook Secret Token
  const secretHeader = req.headers.get('x-telegram-bot-api-secret-token');
  if (!verifyTelegramWebhookSecret(secretHeader, config.webhookSecret)) {
    logAppEvent({
      name: 'request_failed',
      requestId,
      route: '/api/channels/telegram/webhook',
      subsystem: 'telegram',
      status: 'failure',
      errorCode: 'PRIVACY_BLOCKED',
    });

    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Invalid or missing Telegram webhook secret.' } },
      { status: 403 }
    );
  }

  // 3. Parse JSON Body
  let update: TelegramUpdate;
  try {
    update = await req.json();
  } catch {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Malformed Telegram update JSON.' } },
      { status: 400 }
    );
  }

  // 4. Process update
  const result = await handleTelegramUpdate(update, config);

  const durationMs = Date.now() - startTime;
  logAppEvent({
    name: 'request_completed',
    requestId,
    route: '/api/channels/telegram/webhook',
    subsystem: 'telegram',
    status: result.status === 'ERROR' ? 'failure' : 'success',
    durationMs,
  });

  return NextResponse.json(
    {
      ok: true,
      result: result.status,
      reason: result.reason,
    },
    { status: 200 }
  );
}

export async function GET() {
  const config = getTelegramConfig();
  return NextResponse.json({
    channel: 'telegram',
    status: config.botToken ? 'CONFIGURED' : 'NOT_CONFIGURED',
    webhookEndpoint: '/api/channels/telegram/webhook',
  });
}
