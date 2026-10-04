import { NextRequest, NextResponse } from 'next/server';
import { parseEmailMessage } from '@/lib/email/parse';
import { analyzeEmailScam } from '@/lib/channels/email';
import { generateRequestId, logAppEvent } from '@/lib/observability';

// Rate limiting: 30 requests per minute per IP
const ipRateLimitMap = new Map<string, { count: number; windowStart: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 30;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = ipRateLimitMap.get(ip);
  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    ipRateLimitMap.set(ip, { count: 1, windowStart: now });
    return false;
  }
  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }
  entry.count += 1;
  return false;
}

export async function GET() {
  return NextResponse.json({
    channel: 'email',
    intakeStatus: 'AVAILABLE_MANUAL',
    mailboxConnectorStatus: 'NOT_CONFIGURED',
    supportedFormats: ['PLAIN_TEXT', 'HTML', 'RAW_RFC822', 'STRUCTURED_JSON'],
    webhookEndpoint: '/api/channels/email',
  });
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const requestId = generateRequestId();
  const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';

  if (isRateLimited(clientIp)) {
    return NextResponse.json(
      { error: { code: 'RATE_LIMITED', message: 'Too many requests. Please wait a minute.' } },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();

    const rawMime = body.rawMime || body.mime;
    const subject = body.subject;
    const sender = body.sender || body.from;
    const replyTo = body.replyTo;
    const plainText = body.plainText || body.text || body.body;
    const htmlText = body.htmlText || body.html;
    const attachments = body.attachments;

    if (!rawMime && !plainText && !htmlText && !subject) {
      return NextResponse.json(
        {
          requestId,
          error: {
            code: 'INVALID_INPUT',
            message: 'Email text, subject, HTML body, or raw MIME content is required.',
          },
        },
        { status: 400 }
      );
    }

    // 1. Parse Email Message
    const parsed = parseEmailMessage({
      rawMime,
      subject,
      sender,
      replyTo,
      recipients: body.recipients,
      plainText,
      htmlText,
      attachments,
    });

    // 2. Run Canonical Scam Analysis
    const analysis = await analyzeEmailScam(parsed);

    const durationMs = Date.now() - startTime;
    logAppEvent({
      name: 'request_completed',
      requestId,
      route: '/api/channels/email',
      subsystem: 'email',
      status: 'success',
      durationMs,
    });

    return NextResponse.json({
      requestId,
      parsed: {
        id: parsed.id,
        subject: parsed.subject,
        senderAddress: parsed.sender.address,
        senderDisplayName: parsed.sender.displayName,
        senderMismatch: parsed.senderMismatch,
        replyToMismatch: parsed.replyToMismatch,
        urlCount: parsed.urls.length,
        linkMismatchCount: parsed.links.filter((l) => l.isMismatch).length,
        attachmentCount: parsed.attachments.length,
        privacyStatus: parsed.privacyStatus,
      },
      analysis,
    });
  } catch (err: any) {
    logAppEvent({
      name: 'request_failed',
      requestId,
      route: '/api/channels/email',
      subsystem: 'email',
      status: 'failure',
      durationMs: Date.now() - startTime,
    });

    return NextResponse.json(
      {
        requestId,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred while parsing and analyzing the email intake.',
        },
      },
      { status: 500 }
    );
  }
}
