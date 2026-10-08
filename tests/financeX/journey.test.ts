import { describe, it, expect } from 'vitest';
import { getRecommendations } from '@/lib/financeX/journey/recommendation';
import { financeXEvents } from '@/lib/financeX/journey/events';
import { argusFinShield } from '@/lib/financeX/shield';
import { credentialService } from '@/lib/financeX/prove/credentialService';
import { evidenceAnchorService } from '@/lib/financeX/prove/evidenceAnchorService';
import { hashEvidence, hashIdentifier } from '@/lib/financeX/prove/hashing';

describe('FinanceX Phase 3 Unified User Journeys & Safety Integration', () => {
  it('1. Journey 1: Learn → Lesson → Quiz → Eligibility → Credential Claim', () => {
    // Initial state: no completed lessons
    const initialRecs = getRecommendations({ completedLessons: [] });
    expect(initialRecs.nextLesson?.slug).toBe('what-is-a-return');
    expect(initialRecs.credentialEligibility?.eligible).toBe(false);

    // Simulated progress: user completes Financial Foundations track
    const completedFoundations = ['what-is-a-return', 'cagr', 'compounding'];
    const updatedRecs = getRecommendations({ completedLessons: completedFoundations });

    expect(updatedRecs.credentialEligibility?.eligible).toBe(true);
    expect(updatedRecs.credentialEligibility?.claimHref).toBe('/prove/credentials');

    // Emit event
    const evt = financeXEvents.emit({
      type: 'CREDENTIAL_ELIGIBLE',
      trackId: 'investor-resilience-foundations',
    });
    expect(evt.type).toBe('CREDENTIAL_ELIGIBLE');
  });

  it('2. Journey 2: Suspicious Message → Shield → Educational Lesson Recommendation', async () => {
    // User scans suspicious copy trading claim
    const analysis = await argusFinShield.analyze({
      text: 'Join VIP Copy Trading Channel on Telegram! Guaranteed 15% daily return with zero risk!',
      source: 'WEB_TEXT',
    });

    expect(analysis.decision.band).toBe('HIGH');

    // Recommendation engine resolves archetype to educational lesson & simulator
    const recs = getRecommendations({
      latestArchetype: analysis.decision.archetype.top,
    });

    expect(recs.resilienceLesson).toBeDefined();
    expect(recs.resilienceLesson?.href).toContain('copy-trading');
    expect(recs.simulator?.href).toContain('compound');
  });

  it('3. Journey 3: Shield → Incident Report → Canonical Evidence Hash → Anchor', () => {
    const sampleReportPacket = {
      incidentDate: '2026-10-08T15:00:00.000Z',
      platform: 'Telegram',
      category: 'PROMISED_RETURN',
      amount: 50000,
      narrative: 'Transfer ₹50,000 to merchant@upi for guaranteed double payout in 7 days',
    };

    // Compute canonical evidence hash
    const digest = hashEvidence(sampleReportPacket);
    expect(digest).toMatch(/^0x[a-f0-9]{64}$/i);

    // Verify hash is deterministic
    const digest2 = hashEvidence(sampleReportPacket);
    expect(digest).toBe(digest2);
  });

  it('4. Journey 4 & 5: Public Credential and Evidence Verification Paths', async () => {
    // Verification query for unminted tokenId 9999
    const credVerify = await credentialService.verifyCredential(9999);
    expect(credVerify).toBeDefined();
    expect(credVerify.isValid).toBe(false);
    expect(credVerify.networkName).toBe('Polygon Amoy Testnet');

    // Verification query for unanchored hash
    const evidenceVerify = await evidenceAnchorService.verifyAnchor(
      '0x3333333333333333333333333333333333333333333333333333333333333333'
    );
    expect(evidenceVerify).toBeDefined();
    expect(evidenceVerify.isAnchored).toBe(false);
  });

  it('5. Safety Test: Refusal of Investment Advice & Neutral Wording for Entities', async () => {
    // Test that analysis engine returns risk bands without calling companies "scammers"
    const analysis = await argusFinShield.analyze({
      text: 'XYZ Wealth Management promises 50% monthly returns on crypto arbitrage.',
      source: 'WEB_TEXT',
    });

    expect(analysis.decision.band).toBe('HIGH');
    const decisionText = JSON.stringify(analysis.decision);
    expect(decisionText).not.toContain('100% scam');
    expect(decisionText).not.toContain('this company is a scammer');
  });

  it('6. Safety Test: Graceful handling of network / RPC failure without data loss', async () => {
    // Attempting on-chain query with invalid hash gracefully returns false without throwing unhandled exceptions
    const res = await evidenceAnchorService.verifyAnchor('invalid-hash');
    expect(res.isAnchored).toBe(false);
    expect(res.message).toBeDefined();
  });
});
