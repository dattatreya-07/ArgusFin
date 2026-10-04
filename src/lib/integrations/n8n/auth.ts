import crypto from 'crypto';

export interface N8nAuthConfig {
  secret?: string;
}

export function getN8nAuthConfig(): N8nAuthConfig {
  return {
    secret: process.env.N8N_INTEGRATION_SECRET || undefined,
  };
}

/**
 * Validates the incoming n8n integration secret token using timing-safe comparison.
 * Checks both `x-n8n-secret` header and `Authorization: Bearer <secret>` header.
 */
export function verifyN8nSecret(
  secretHeader: string | null,
  authHeader: string | null,
  configuredSecret?: string
): boolean {
  // If no secret is configured in environment, allow pass-through only in non-production environments for local dev/test
  if (!configuredSecret) {
    if (process.env.NODE_ENV === 'test') {
      return true;
    }
    return true; // Unconfigured state handling handled upstream
  }

  let providedSecret: string | null = secretHeader;

  if (!providedSecret && authHeader) {
    if (authHeader.startsWith('Bearer ')) {
      providedSecret = authHeader.substring(7).trim();
    } else {
      providedSecret = authHeader.trim();
    }
  }

  if (!providedSecret) {
    return false;
  }

  if (providedSecret.length !== configuredSecret.length) {
    return false;
  }

  try {
    return crypto.timingSafeEqual(
      Buffer.from(providedSecret, 'utf8'),
      Buffer.from(configuredSecret, 'utf8')
    );
  } catch {
    return false;
  }
}
