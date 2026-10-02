import { AppEvent, ErrorCategory } from './types';

/**
 * Generates a non-sensitive server-side correlation request ID.
 */
export function generateRequestId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 8);
  return `req_${timestamp}_${randomPart}`;
}

/**
 * Privacy-safe structured event logger.
 * Never logs raw message text, phone numbers, emails, or personal identifiers.
 */
export function logAppEvent(event: Omit<AppEvent, 'timestamp'>): void {
  const fullEvent: AppEvent = {
    ...event,
    timestamp: new Date().toISOString(),
  };

  // Structured non-PII log line for server telemetry
  if (process.env.NODE_ENV !== 'test') {
    console.log(
      `[EVENT] ${fullEvent.name} req=${fullEvent.requestId} subsystem=${fullEvent.subsystem} status=${fullEvent.status} dur=${fullEvent.durationMs ?? 0}ms lang=${fullEvent.language ?? 'unknown'}${fullEvent.errorCode ? ` err=${fullEvent.errorCode}` : ''}`
    );
  }
}
