import rawAuthorities from '../../../data/authorities.json';
import { AuthorityRecord, AuthorityChannel } from './types';

const CATEGORY_MAP: Record<string, string[]> = {
  national_cyber_helpline: ['PAYMENT_FRAUD', 'CYBER_CRIME', 'GOLDEN_HOUR', 'URGENT_FROZEN_FUNDS'],
  cybercrime_portal: ['PAYMENT_FRAUD', 'CYBER_CRIME', 'IMPERSONATION', 'FORMAL_COMPLAINT'],
  sebi_scores: ['SECURITIES_FRAUD', 'UNREGISTERED_ADVISORY', 'IPO_ALLOTMENT', 'TRADING_PLATFORM', 'MARKET_MANIPULATION'],
  rbi_sachet: ['DEPOSIT_SCHEME', 'UNREGISTERED_LENDING', 'PONZI_PYRAMID', 'ILLEGAL_COLLECTION', 'UNREGISTERED_ADVISORY'],
  telecom_fraud_reporting: ['TELECOM_FRAUD', 'WHATSAPP_TELEGRAM', 'SMS_PHISHING', 'FAKE_NUMBER', 'IMPERSONATION'],
  user_bank: ['PAYMENT_FRAUD', 'CARD_COMPROMISE', 'ACCOUNT_TAKEOVER', 'DEBIT_FREEZE'],
};

/**
 * Validates and retrieves all verified authority records from data/authorities.json
 */
export function getVerifiedAuthorities(): AuthorityRecord[] {
  if (!Array.isArray(rawAuthorities) || rawAuthorities.length === 0) {
    return [];
  }

  return rawAuthorities.map((raw: any) => {
    const channels: AuthorityChannel[] = Array.isArray(raw.channels)
      ? raw.channels.map((ch: any) => ({
          type: ch.type === 'phone' ? 'phone' : ch.type === 'email' ? 'email' : 'url',
          value: typeof ch.value === 'string' ? ch.value : '',
          verified_at: ch.verified_at ?? null,
          notes: ch.notes ?? undefined,
        }))
      : [];

    return {
      id: String(raw.id),
      name: String(raw.name),
      scope: String(raw.scope || ''),
      categories: CATEGORY_MAP[raw.id] || ['GENERAL_REPORTING'],
      channels,
      verified_at: raw.verified_at ?? null,
      source_url: raw.source_url ?? null,
      languages: ['en', 'hi', 'ta'],
      jurisdiction: 'India (National)',
    };
  });
}

export function getAuthorityById(id: string): AuthorityRecord | undefined {
  return getVerifiedAuthorities().find((a) => a.id === id);
}
