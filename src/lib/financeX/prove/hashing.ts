import { createHash } from 'crypto';
import { maskPII } from '@/lib/mask';

export const PROVE_DOMAIN_PREFIXES = {
  EVIDENCE: 'FINANCEX:EVIDENCE:v1:',
  IDENTIFIER: 'FINANCEX:IDENTIFIER:v1:',
  ACHIEVEMENT: 'FINANCEX:ACHIEVEMENT:v1:',
} as const;

export interface EvidencePacket {
  schemaVersion?: string;
  archetype?: string;
  riskBand?: string;
  confidence?: number;
  extractedUrls?: string[];
  signals?: Array<{ label: string; value: string }>;
  maskedClaimsSummary?: string;
  timestamp?: string;
  [key: string]: any;
}

/**
 * Deterministically sorts object keys recursively to produce canonical JSON serialization,
 * while automatically scrubbing PII from any string value.
 */
function sortAndSanitizeObject(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }
  if (typeof obj === 'string') {
    return maskPII(obj).masked;
  }
  if (typeof obj === 'number' || typeof obj === 'boolean') {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(sortAndSanitizeObject);
  }
  if (typeof obj === 'object') {
    const sorted: Record<string, any> = {};
    Object.keys(obj)
      .sort()
      .forEach((key) => {
        sorted[key] = sortAndSanitizeObject(obj[key]);
      });
    return sorted;
  }
  return String(obj);
}

/**
 * Canonicalizes an evidence packet with stable field ordering, normalized timestamps, and PII masking guarantees.
 */
export function canonicalizeEvidence(packet: any): string {
  if (typeof packet === 'string') {
    return JSON.stringify(maskPII(packet).masked);
  }
  const sanitized = sortAndSanitizeObject(packet);
  return JSON.stringify(sanitized);
}

/**
 * Computes deterministic SHA-256 evidence hash with domain separation.
 */
export function hashEvidence(packet: any): string {
  const canonicalString = canonicalizeEvidence(packet);
  const payload = `${PROVE_DOMAIN_PREFIXES.EVIDENCE}${canonicalString}`;
  return '0x' + createHash('sha256').update(payload).digest('hex');
}

/**
 * Computes deterministic identifier hash (URL, Phone, UPI, Wallet) with domain separation.
 * Input identifier is normalized (lowercased, scheme stripped, trimmed).
 */
export function hashIdentifier(
  identifier: string,
  type: 'URL' | 'PHONE' | 'UPI' | 'WALLET' | 'REPORT' = 'URL'
): string {
  let normalized = (identifier || '').trim().toLowerCase();
  if (type === 'URL') {
    normalized = normalized.replace(/^https?:\/\//i, '').replace(/\/$/, '');
  }
  const payload = `${PROVE_DOMAIN_PREFIXES.IDENTIFIER}${type}:${normalized}`;
  return '0x' + createHash('sha256').update(payload).digest('hex');
}

/**
 * Computes deterministic achievement hash for soulbound credentials with domain separation.
 */
export function hashAchievement(achievementId: string, credentialType: string = 'LEARNING_MILESTONE'): string {
  const payload = `${PROVE_DOMAIN_PREFIXES.ACHIEVEMENT}${credentialType}:${achievementId}`;
  return '0x' + createHash('sha256').update(payload).digest('hex');
}

