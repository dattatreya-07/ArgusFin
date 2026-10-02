import { AppEvent, ErrorCategory } from './types';
import { maskPII } from '../mask';

/**
 * Generates a non-sensitive server-side correlation request ID.
 */
export function generateRequestId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 8);
  return `req_${timestamp}_${randomPart}`;
}

/**
 * Sanitizes metadata at the centralized observability boundary to prevent PII,
 * credentials, OTPs, or API keys from ever being persisted or logged.
 */
export function sanitizeEventMetadata(
  meta?: Record<string, string | number | boolean | null>
): Record<string, string | number | boolean | null> | undefined {
  if (!meta) return undefined;

  const sanitized: Record<string, string | number | boolean | null> = {};
  for (const [key, val] of Object.entries(meta)) {
    // Drop blacklisted keys immediately
    const lowerKey = key.toLowerCase();
    if (
      lowerKey.includes('key') ||
      lowerKey.includes('secret') ||
      lowerKey.includes('pass') ||
      lowerKey.includes('token') ||
      lowerKey.includes('otp') ||
      lowerKey.includes('raw') ||
      lowerKey.includes('audio') ||
      lowerKey.includes('evidence')
    ) {
      continue;
    }

    if (typeof val === 'string') {
      // Run through centralized PII masker
      const masked = maskPII(val).masked;
      sanitized[key] = masked.length > 200 ? masked.substring(0, 200) + '...' : masked;
    } else {
      sanitized[key] = val;
    }
  }

  return sanitized;
}

/**
 * Privacy-safe structured event logger.
 * Never logs raw message text, phone numbers, emails, or personal identifiers.
 */
export function logAppEvent(event: Omit<AppEvent, 'timestamp'>): void {
  const fullEvent: AppEvent = {
    ...event,
    metadata: sanitizeEventMetadata(event.metadata),
    timestamp: new Date().toISOString(),
  };

  // Structured non-PII log line for server telemetry
  if (process.env.NODE_ENV !== 'test') {
    console.log(
      `[EVENT] ${fullEvent.name} req=${fullEvent.requestId} subsystem=${fullEvent.subsystem} status=${fullEvent.status} dur=${fullEvent.durationMs ?? 0}ms lang=${fullEvent.language ?? 'unknown'}${fullEvent.errorCode ? ` err=${fullEvent.errorCode}` : ''}`
    );
  }
}
