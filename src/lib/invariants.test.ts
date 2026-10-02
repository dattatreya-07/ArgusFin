import { describe, it, expect } from 'vitest';
import { computeAnnualised } from './calc';
import { extractClaims } from './extract';
import { RulesOnlyDecisionEngine } from './decision/rulesOnly';
import { validateIncidentConsistency } from './incident/consistency';
import { formatIndianNumber, formatAnnualisedMultiple, formatAnnualisedReturnPct } from './format';
import { DecisionInput } from './types';

describe('P3-11 Correctness & Data-Integrity Invariant Suite', () => {
  describe('Calculator Invariants', () => {
    it('handles zero gain (invested === payout) deterministically with tier 1', () => {
      const res = computeAnnualised({ invested: 10000, payout: 10000, durationDays: 30 });
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.multiple).toBe(1);
        expect(res.totalGainPct).toBe(0);
        expect(res.annualisedReturnPct).toBe(0);
        expect(res.tier).toBe(1);
      }
    });

    it('handles fractional days (e.g., 1 hour = 0.0416 days) with overflow protection and tier 4', () => {
      const res = computeAnnualised({ invested: 5000, payout: 10000, durationDays: 1 / 24 });
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.multiple).toBe(2);
        expect(res.tier).toBe(4);
        expect(res.overflow).toBe(true);
      }
    });

    it('strictly prevents NaN and Infinity leaks from invalid numeric inputs', () => {
      const invalidCombinations = [
        { invested: -100, payout: 200, durationDays: 30 },
        { invested: 100, payout: -200, durationDays: 30 },
        { invested: 0, payout: 200, durationDays: 30 },
        { invested: 100, payout: 200, durationDays: 0 },
        { invested: 100, payout: 200, durationDays: -5 },
        { invested: Number.POSITIVE_INFINITY, payout: 200, durationDays: 30 },
        { invested: 100, payout: Number.NaN, durationDays: 30 },
      ];

      for (const params of invalidCombinations) {
        const res = computeAnnualised(params as any);
        expect(res.success).toBe(false);
      }
    });

    it('computes daily 1% compounding return correctly over 30 days', () => {
      // 1% daily = 1.01^365 - 1 ≈ 36.78x annualised
      const res = computeAnnualised({ invested: 10000, payout: 10100, durationDays: 1 });
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.annualisedMultiple).toBeGreaterThan(35);
        expect(res.annualisedMultiple).toBeLessThan(40);
        expect(res.tier).toBe(3);
      }
    });
  });

  describe('Decision Engine & Semantic Invariants', () => {
    it('preserves high-risk classification even when buried in extensive benign text', async () => {
      const complexText = `
        Dear Investor, financial literacy and capital preservation are essential in today's dynamic markets.
        We provide fundamental analysis, equity research, and risk management guidelines.
        However, for our exclusive VIP channel, if you deposit ₹10,000 today you get guaranteed ₹20,000 in 24 hours.
        Share your OTP with our administrator to verify your demat terminal.
      `;

      const claims = extractClaims(complexText, 'en');
      const engine = new RulesOnlyDecisionEngine();
      const input: DecisionInput = {
        maskedText: complexText,
        claims,
        signals: [],
        lang: 'en',
      };

      const decision = await engine.decide(input);
      expect(decision.riskBand.HIGH).toBeGreaterThan(0.7);
    });

    it('defaults unspecified duration deterministically to baseline period (30 days)', () => {
      const claims = extractClaims('Invest 10000 get 20000 guaranteed', 'en');
      expect(claims.promisedReturns.length).toBeGreaterThan(0);
      expect(claims.promisedReturns[0].durationDays).toBe(30);
    });

    it('handles multilingual synonyms in English, Hindi, and Tamil with invariant archetype classification', async () => {
      const enText = 'Join our VIP telegram channel for copy trading bot with auto profits.';
      const hiText = 'वीआईपी टेलीग्राम ग्रुप से जुड़ें और ऑटोमैटिक कॉपी ट्रेडिंग बॉट से लाभ कमाएं।';
      const taText = 'எங்கள் விஐபி டெலிகிராம் குழுவில் இணைந்து ஆட்டோ காப்பி டிரேடிங் மூலம் லாபம் பெறுங்கள்.';

      const engine = new RulesOnlyDecisionEngine();

      const enDec = await engine.decide({
        maskedText: enText,
        claims: extractClaims(enText, 'en'),
        signals: [],
        lang: 'en',
      });

      const hiDec = await engine.decide({
        maskedText: hiText,
        claims: extractClaims(hiText, 'hi'),
        signals: [],
        lang: 'hi',
      });

      const taDec = await engine.decide({
        maskedText: taText,
        claims: extractClaims(taText, 'ta'),
        signals: [],
        lang: 'ta',
      });

      expect(enDec.archetype.COPY_TRADING).toBeGreaterThan(0.3);
      expect(hiDec.archetype.COPY_TRADING).toBeGreaterThan(0.3);
      expect(taDec.archetype.COPY_TRADING).toBeGreaterThan(0.3);
    });
  });

  describe('Entity Consistency & Conflict Preservation Invariants', () => {
    it('detects contradictory facts and preserves both conflicting values in the issue report', () => {
      const result = validateIncidentConsistency({
        language: 'en',
        amount: 50000,
        when: '2026-08-10',
        platform: 'WhatsApp',
        whatHappened: 'I invested through www.fake-groww-portal.vip after seeing Groww logo.',
        entityName: 'Authorized Zerodha Broker',
        transactions: [
          {
            date: '2026-08-10',
            amount: 25000,
            paymentMethod: 'UPI',
            beneficiaryAccountOrUpi: '987654321012345', // Numeric account with UPI
          },
        ],
      });

      expect(result.consistent).toBe(false);
      
      // 1. Total amount vs tx sum conflict
      const amtIssue = result.issues.find((i) => i.field === 'amount');
      expect(amtIssue).toBeDefined();
      expect(amtIssue?.conflictingValues[0]).toContain('Total: ₹50000');

      // 2. Beneficiary identifier type mismatch
      const methodIssue = result.issues.find((i) => i.field?.includes('paymentMethod'));
      expect(methodIssue).toBeDefined();
      expect(methodIssue?.conflictingValues).toContain('UPI');

      // 3. Impersonation of regulated brand in narrative
      const entityIssue = result.issues.find((i) => i.field === 'entityName');
      expect(entityIssue).toBeDefined();
      expect(entityIssue?.conflictingValues).toContain('Authorized Zerodha Broker');
    });
  });

  describe('Unicode & Formatting Invariants', () => {
    it('renders currency, percentage, and localized numerals without formatting corruption', () => {
      expect(formatAnnualisedReturnPct(25.5)).toBe('25.5%');
      expect(formatIndianNumber(100000)).toBe('1,00,000');
      expect(formatAnnualisedMultiple(2.5)).toBe('2.50x');
    });
  });
});
