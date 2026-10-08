import { describe, it, expect } from 'vitest';
import {
  hashEvidence,
  hashIdentifier,
  hashAchievement,
  canonicalizeEvidence,
} from '@/lib/financeX/prove/hashing';

describe('FinanceX Web3 Cryptographic Hashing Engine', () => {
  it('1. Domain separation: different domains generate distinct hashes for identical inputs', () => {
    const rawInput = 'INVESTOR_FOUNDATIONS_2026';
    const evidenceHash = hashEvidence(rawInput);
    const identifierHash = hashIdentifier(rawInput);
    const achievementHash = hashAchievement(rawInput);

    expect(evidenceHash).toMatch(/^0x[a-f0-9]{64}$/i);
    expect(identifierHash).toMatch(/^0x[a-f0-9]{64}$/i);
    expect(achievementHash).toMatch(/^0x[a-f0-9]{64}$/i);

    expect(evidenceHash).not.toEqual(identifierHash);
    expect(evidenceHash).not.toEqual(achievementHash);
    expect(identifierHash).not.toEqual(achievementHash);
  });

  it('2. Field order independence: object key ordering does not affect evidence hash', () => {
    const packetA = {
      amount: 50000,
      category: 'PROMISED_RETURN',
      narrative: 'Guaranteed 20% weekly payout scheme',
      platform: 'Telegram',
    };

    const packetB = {
      platform: 'Telegram',
      narrative: 'Guaranteed 20% weekly payout scheme',
      category: 'PROMISED_RETURN',
      amount: 50000,
    };

    const hashA = hashEvidence(packetA);
    const hashB = hashEvidence(packetB);

    expect(hashA).toEqual(hashB);
  });

  it('3. Determinism: identical input always yields identical hash across multiple runs', () => {
    const packet = { reportId: 'REP-1029', loss: 25000 };
    const hash1 = hashEvidence(packet);
    const hash2 = hashEvidence(packet);
    const hash3 = hashEvidence(packet);

    expect(hash1).toEqual(hash2);
    expect(hash2).toEqual(hash3);
  });

  it('4. Sensitivity: meaningful evidence payload changes alter the hash', () => {
    const packetA = { loss: 25000, platform: 'WhatsApp' };
    const packetB = { loss: 25001, platform: 'WhatsApp' };

    const hashA = hashEvidence(packetA);
    const hashB = hashEvidence(packetB);

    expect(hashA).not.toEqual(hashB);
  });

  it('5. Privacy scrubbing: PII is masked before hashing to guarantee no raw phone/UPI on-chain', () => {
    const rawWithPii = {
      narrative: 'Send money to badguy@upi or call +919988776655 immediately',
    };

    const canonical = canonicalizeEvidence(rawWithPii);
    expect(canonical).not.toContain('+919988776655');
    expect(canonical).not.toContain('badguy@upi');
    expect(canonical).toContain('[PHONE]');
    expect(canonical).toContain('[UPI]');
  });

  it('6. Identifier normalization: URL, phone, UPI, wallet identifiers are normalized and hashed', () => {
    const urlHash1 = hashIdentifier('https://Example-Scam.COM/login?ref=123');
    const urlHash2 = hashIdentifier('example-scam.com/login?ref=123');

    expect(urlHash1).toEqual(urlHash2);
  });
});
