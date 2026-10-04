import { N8nIntegrationResponse } from './types';

/**
 * In-memory sliding cache for n8n workflow retries & duplicate message processing.
 * Stores up to 1000 presentation-safe response DTOs with a 10-minute TTL.
 * Never stores raw message text, images, or raw PII.
 */
const idempotencyCache = new Map<string, { response: N8nIntegrationResponse; timestamp: number }>();
const MAX_CACHE_SIZE = 1000;
const CACHE_TTL_MS = 10 * 60 * 1000;

export function buildIdempotencyKey(channel: string, messageId: string): string {
  return `${channel.toUpperCase()}:${messageId.trim()}`;
}

export function getCachedResponse(key: string): N8nIntegrationResponse | null {
  if (!key) return null;
  const now = Date.now();
  const entry = idempotencyCache.get(key);

  if (!entry) return null;

  if (now - entry.timestamp > CACHE_TTL_MS) {
    idempotencyCache.delete(key);
    return null;
  }

  return entry.response;
}

export function setCachedResponse(key: string, response: N8nIntegrationResponse): void {
  if (!key) return;
  const now = Date.now();

  if (idempotencyCache.size >= MAX_CACHE_SIZE) {
    // Evict expired entries
    idempotencyCache.forEach((val, k) => {
      if (now - val.timestamp > CACHE_TTL_MS) {
        idempotencyCache.delete(k);
      }
    });
  }

  idempotencyCache.set(key, { response, timestamp: now });
}

export function clearIdempotencyCache(): void {
  idempotencyCache.clear();
}
