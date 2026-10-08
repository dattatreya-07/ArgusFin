import { describe, it, expect } from 'vitest';
import { FINANCEX_CONFIG } from '@/lib/financeX/config';
import { argusFinShield } from '@/lib/financeX/shield';
import { financeXAcademy } from '@/lib/financeX/academy';
import { credentialService, evidenceAnchorService } from '@/lib/financeX/prove';
import { maskPII } from '@/lib/mask';

describe('FinanceX Phase 0 Foundation Integrity', () => {
  it('1. FinanceX branding and config export valid metadata', () => {
    expect(FINANCEX_CONFIG.name).toBe('FinanceX');
    expect(FINANCEX_CONFIG.shieldName).toBe('ArgusFin Shield');
    expect(FINANCEX_CONFIG.features.academy).toBe(true);
    expect(FINANCEX_CONFIG.features.shield).toBe(true);
    expect(FINANCEX_CONFIG.features.prove).toBe(true);
  });

  it('2. Learn module boundary exists and returns initial lessons', () => {
    const modules = financeXAcademy.getModules('en');
    expect(modules.length).toBeGreaterThan(0);
    expect(modules[0].slug).toBeDefined();
  });

  it('3. Protect module boundary exists and wraps ArgusFin Shield', () => {
    expect(argusFinShield).toBeDefined();
    expect(typeof argusFinShield.analyze).toBe('function');
  });

  it('4. Prove module boundary exists with non-fake abstractions', () => {
    expect(credentialService).toBeDefined();
    expect(evidenceAnchorService).toBeDefined();
  });

  it('5. Protect route reaches canonical ArgusFin scam analysis engine', async () => {
    const result = await argusFinShield.analyze({
      text: 'Guaranteed 2% daily return! Double your money in 30 days!',
      source: 'WEB_TEXT',
    });

    expect(result).toBeDefined();
    expect(result.decision).toBeDefined();
    expect(result.decision.band).toBe('HIGH');
    expect(result.decision.archetype.top).toBe('DOUBLING_SCHEME');
  });

  it('6. Privacy masking remains intact and masks phone & UPI numbers', () => {
    const masked = maskPII('Call +919876543210 or send money to user@upi');
    expect(masked.masked).not.toContain('9876543210');
    expect(masked.masked).not.toContain('user@upi');
    expect(masked.masked).toContain('[PHONE]');
    expect(masked.masked).toContain('[UPI]');
  });

  it('7. Web3 prove adapter handles unverified queries without fake tx hashes', async () => {
    const credResult = await credentialService.verifyCredential(99999);
    expect(credResult.isValid).toBe(false);
    expect(credResult.explorerUrl).toBeDefined();

    const anchorResult = await evidenceAnchorService.verifyAnchor('0x0000000000000000000000000000000000000000000000000000000000000000');
    expect(anchorResult.isAnchored).toBe(false);
  });

  it('8. No wallet connection is required to access learning or protection', () => {
    const initialProgress = financeXAcademy.getInitialProgress('anonymous-user');
    expect(initialProgress).toBeDefined();
    expect(initialProgress.length).toBeGreaterThan(0);
    expect(initialProgress[0].status).toBe('NOT_STARTED');
  });
});
