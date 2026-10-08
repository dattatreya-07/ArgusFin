import { describe, it, expect } from 'vitest';
import { POLYGON_AMOY_CONFIG, CONTRACT_ADDRESSES, getExplorerTxUrl, getExplorerAddressUrl, getExplorerTokenUrl } from '@/lib/financeX/prove/network';
import { credentialService } from '@/lib/financeX/prove/credentialService';
import { evidenceAnchorService } from '@/lib/financeX/prove/evidenceAnchorService';
import { scamRegistryService } from '@/lib/financeX/prove/scamRegistryService';
import { walletService } from '@/lib/financeX/prove/walletService';

describe('FinanceX Web3 Services & Network Abstractions', () => {
  it('1. Polygon Amoy Network metadata is strictly configured (Chain ID 80002)', () => {
    expect(POLYGON_AMOY_CONFIG.chainId).toBe(80002);
    expect(POLYGON_AMOY_CONFIG.chainIdHex).toBe('0x13882');
    expect(POLYGON_AMOY_CONFIG.nativeCurrency.symbol).toBe('MATIC');
    expect(CONTRACT_ADDRESSES.credentialSBT).toBeDefined();
    expect(CONTRACT_ADDRESSES.evidenceAnchor).toBeDefined();
    expect(CONTRACT_ADDRESSES.scamRegistry).toBeDefined();
  });

  it('2. Explorer URLs generate valid Polygon Amoy links', () => {
    const txUrl = getExplorerTxUrl('0x123abc');
    const addrUrl = getExplorerAddressUrl('0x456def');
    const tokenUrl = getExplorerTokenUrl('1');

    expect(txUrl).toContain('amoy.polygonscan.com/tx/0x123abc');
    expect(addrUrl).toContain('amoy.polygonscan.com/address/0x456def');
    expect(tokenUrl).toContain('amoy.polygonscan.com/token/0x71C7656EC7ab88b098defB751B7401B5f6d8976F?a=1');
  });

  it('3. Credential Service gracefully handles unverified query without crashing', async () => {
    const verification = await credentialService.verifyCredential(999);
    expect(verification).toBeDefined();
    expect(verification.isValid).toBe(false);
  });

  it('4. Evidence Anchor Service gracefully queries non-existent anchor', async () => {
    const query = await evidenceAnchorService.verifyAnchor('0x1111111111111111111111111111111111111111111111111111111111111111');
    expect(query).toBeDefined();
    expect(query.isAnchored).toBe(false);
  });

  it('5. Scam Registry Service queries unflagged identifier hash', async () => {
    const registryRes = await scamRegistryService.queryScamHash('0x2222222222222222222222222222222222222222222222222222222222222222');
    expect(registryRes).toBeDefined();
    expect(registryRes.isRegistered).toBe(false);
  });

  it('6. Wallet Service returns null account when window.ethereum is not present in Node env', async () => {
    const acc = await walletService.getAccount();
    expect(acc).toBeNull();
  });
});
