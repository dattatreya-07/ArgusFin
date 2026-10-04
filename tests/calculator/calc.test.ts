import { describe, it, expect } from 'vitest';
import {
  computeAnnualised,
  computeLumpSum,
  computeSip,
  computeResearchAnalystBreakdown,
  computeResearchCagrModeB,
} from '@/lib/calc';

describe('CORE-03 — Deterministic Calculator Expanded Test Suite (30+ Cases)', () => {

  describe('1. Promise Reality Check / Annualized Return Calculator', () => {
    it('1.1 computes standard 30-day 2x return promise (Implied >1000% p.a.)', () => {
      const res = computeAnnualised({ invested: 10000, payout: 20000, durationDays: 30 });
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.multiple).toBe(2);
        expect(res.totalGainPct).toBe(100);
        expect(res.tier).toBe(4);
      }
    });

    it('1.2 computes standard 365-day 10% return (Normal return)', () => {
      const res = computeAnnualised({ invested: 100000, payout: 110000, durationDays: 365 });
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.multiple).toBe(1.1);
        expect(res.totalGainPct).toBeCloseTo(10, 5);
        expect(res.tier).toBe(2);
      }
    });

    it('1.3 handles zero invested input gracefully', () => {
      const res = computeAnnualised({ invested: 0, payout: 20000, durationDays: 30 });
      expect(res.success).toBe(false);
    });

    it('1.4 handles negative invested input gracefully', () => {
      const res = computeAnnualised({ invested: -5000, payout: 20000, durationDays: 30 });
      expect(res.success).toBe(false);
    });

    it('1.5 handles zero payout input gracefully', () => {
      const res = computeAnnualised({ invested: 10000, payout: 0, durationDays: 30 });
      expect(res.success).toBe(false);
    });

    it('1.6 handles zero duration gracefully', () => {
      const res = computeAnnualised({ invested: 10000, payout: 20000, durationDays: 0 });
      expect(res.success).toBe(false);
    });

    it('1.7 handles NaN / non-finite inputs gracefully', () => {
      const res = computeAnnualised({ invested: NaN, payout: Infinity, durationDays: 30 });
      expect(res.success).toBe(false);
    });

    it('1.8 handles extreme 1-day 100x multiplier without crashing (overflow boundary)', () => {
      const res = computeAnnualised({ invested: 100, payout: 10000, durationDays: 1 });
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.tier).toBe(4);
      }
    });
  });

  describe('2. Mode A: Lump Sum Compounding Investment Calculator', () => {
    it('2.1 computes 5-year ₹50,000 at 12% annual compounding', () => {
      const res = computeLumpSum(50000, 12, 5, 1);
      expect(res.success).toBe(true);
      expect(Math.round(res.finalMaturityAmount)).toBe(88117);
      expect(Math.round(res.totalProfit)).toBe(38117);
    });

    it('2.2 computes 1-year ₹100,000 at 8% quarterly compounding', () => {
      const res = computeLumpSum(100000, 8, 1, 4);
      expect(res.success).toBe(true);
      expect(Math.round(res.finalMaturityAmount)).toBe(108243);
      expect(res.effectiveAnnualYieldPct).toBeCloseTo(8.243, 2);
    });

    it('2.3 handles zero principal input gracefully', () => {
      const res = computeLumpSum(0, 10, 5);
      expect(res.success).toBe(false);
    });

    it('2.4 handles negative principal input gracefully', () => {
      const res = computeLumpSum(-1000, 10, 5);
      expect(res.success).toBe(false);
    });

    it('2.5 handles zero duration input gracefully', () => {
      const res = computeLumpSum(10000, 10, 0);
      expect(res.success).toBe(false);
    });

    it('2.6 handles very large 1 Billion INR calculation', () => {
      const res = computeLumpSum(1000000000, 10, 10, 1);
      expect(res.success).toBe(true);
      expect(res.finalMaturityAmount).toBeGreaterThan(2000000000);
    });

    it('2.7 handles decimal duration (2.5 years)', () => {
      const res = computeLumpSum(10000, 10, 2.5, 1);
      expect(res.success).toBe(true);
      expect(res.finalMaturityAmount).toBeGreaterThan(12500);
    });
  });

  describe('3. Mode B: Monthly Contribution (SIP) Calculator', () => {
    it('3.1 computes 10-year ₹5,000/month at 12% p.a.', () => {
      const res = computeSip(5000, 12, 10);
      expect(res.success).toBe(true);
      expect(res.totalInvested).toBe(600000);
      expect(Math.round(res.finalEstimatedValue)).toBe(1161695);
      expect(Math.round(res.totalGrowth)).toBe(561695);
    });

    it('3.2 computes 1-year ₹1,000/month at 0% rate (linear total)', () => {
      const res = computeSip(1000, 0, 1);
      expect(res.success).toBe(true);
      expect(res.totalInvested).toBe(12000);
      expect(res.finalEstimatedValue).toBe(12000);
      expect(res.totalGrowth).toBe(0);
    });

    it('3.3 handles zero monthly contribution gracefully', () => {
      const res = computeSip(0, 12, 5);
      expect(res.success).toBe(false);
    });

    it('3.4 handles negative monthly contribution gracefully', () => {
      const res = computeSip(-500, 12, 5);
      expect(res.success).toBe(false);
    });

    it('3.5 handles zero duration gracefully', () => {
      const res = computeSip(1000, 12, 0);
      expect(res.success).toBe(false);
    });

    it('3.6 handles large monthly SIP ₹500,000/month over 20 years', () => {
      const res = computeSip(500000, 15, 20);
      expect(res.success).toBe(true);
      expect(res.finalEstimatedValue).toBeGreaterThan(500000000);
    });

    it('3.7 handles non-finite input in SIP calculator', () => {
      const res = computeSip(NaN, 12, 5);
      expect(res.success).toBe(false);
    });
  });

  describe('4. Mode C: CAGR & Research Breakdown Calculator', () => {
    it('4.1 computes exact 3-year CAGR from ₹100,000 to ₹144,000', () => {
      const res = computeResearchCagrModeB({
        initialLumpSum: 100000,
        endingValue: 144000,
        startDateStr: '2023-01-01',
        endDateStr: '2026-01-01',
      });
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.cagrPct).toBeCloseTo(12.92, 1);
        expect(res.daysDuration).toBe(1096);
      }
    });

    it('4.2 handles loss scenario (value dropping from ₹100k to ₹80k)', () => {
      const res = computeResearchCagrModeB({
        initialLumpSum: 100000,
        endingValue: 80000,
        startDateStr: '2023-01-01',
        endDateStr: '2024-01-01',
      });
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.isLoss).toBe(true);
        expect(res.totalReturnPct).toBe(-20);
      }
    });

    it('4.3 handles invalid date string gracefully', () => {
      const res = computeResearchCagrModeB({
        initialLumpSum: 100000,
        endingValue: 120000,
        startDateStr: 'invalid-date',
        endDateStr: '2024-01-01',
      });
      expect(res.success).toBe(false);
    });

    it('4.4 handles reversed dates gracefully', () => {
      const res = computeResearchCagrModeB({
        initialLumpSum: 100000,
        endingValue: 120000,
        startDateStr: '2025-01-01',
        endDateStr: '2024-01-01',
      });
      expect(res.success).toBe(false);
    });

    it('4.5 handles same start and end date gracefully', () => {
      const res = computeResearchCagrModeB({
        initialLumpSum: 100000,
        endingValue: 120000,
        startDateStr: '2024-01-01',
        endDateStr: '2024-01-01',
      });
      expect(res.success).toBe(false);
    });

    it('4.6 computes analyst breakdown for normal 7% return (SEBI_REGULATED_NORMAL)', () => {
      const breakdown = computeResearchAnalystBreakdown(100000, 107000, 365);
      expect(breakdown).not.toBeNull();
      if (breakdown) {
        expect(breakdown.riskVerdict).toBe('SEBI_REGULATED_NORMAL');
      }
    });

    it('4.7 computes analyst breakdown for high equity 14% return (HIGH_EQUITY_RISK)', () => {
      const breakdown = computeResearchAnalystBreakdown(100000, 114000, 365);
      expect(breakdown).not.toBeNull();
      if (breakdown) {
        expect(breakdown.riskVerdict).toBe('HIGH_EQUITY_RISK');
      }
    });

    it('4.8 computes analyst breakdown for extreme 500% return (UNBACKED_PONZI_RISK)', () => {
      const breakdown = computeResearchAnalystBreakdown(10000, 60000, 30);
      expect(breakdown).not.toBeNull();
      if (breakdown) {
        expect(breakdown.riskVerdict).toBe('UNBACKED_PONZI_RISK');
        expect(breakdown.unbackedExceedanceAmount).toBeGreaterThan(0);
      }
    });
  });

  describe('5. Section 5: Edge Cases, Extended Durations & Math Safety Bounds (25+ Cases)', () => {
    it('5.1 computes 1-day 1% return promise', () => {
      const res = computeAnnualised({ invested: 10000, payout: 10100, durationDays: 1 });
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.totalGainPct).toBeCloseTo(1, 5);
        expect(res.annualisedReturnPct).toBeGreaterThan(3000);
      }
    });

    it('5.2 computes 7-day 50% return promise', () => {
      const res = computeAnnualised({ invested: 20000, payout: 30000, durationDays: 7 });
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.totalGainPct).toBe(50);
        expect(res.tier).toBe(4);
      }
    });

    it('5.3 computes 15-day 100% return promise', () => {
      const res = computeAnnualised({ invested: 5000, payout: 10000, durationDays: 15 });
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.multiple).toBe(2);
        expect(res.tier).toBe(4);
      }
    });

    it('5.4 computes 60-day 3x return promise', () => {
      const res = computeAnnualised({ invested: 10000, payout: 30000, durationDays: 60 });
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.multiple).toBe(3);
        expect(res.tier).toBe(4);
      }
    });

    it('5.5 computes 90-day 5x return promise', () => {
      const res = computeAnnualised({ invested: 10000, payout: 50000, durationDays: 90 });
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.multiple).toBe(5);
        expect(res.tier).toBe(4);
      }
    });

    it('5.6 computes 180-day 10x return promise', () => {
      const res = computeAnnualised({ invested: 10000, payout: 100000, durationDays: 180 });
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.multiple).toBe(10);
        expect(res.tier).toBe(4);
      }
    });

    it('5.7 handles very small ₹1 investment input', () => {
      const res = computeAnnualised({ invested: 1, payout: 2, durationDays: 365 });
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.totalGainPct).toBe(100);
      }
    });

    it('5.8 handles fractional rupee investment input (₹100.50)', () => {
      const res = computeAnnualised({ invested: 100.5, payout: 201.0, durationDays: 365 });
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.totalGainPct).toBe(100);
      }
    });

    it('5.9 handles fractional rupee payout input (₹200.75)', () => {
      const res = computeAnnualised({ invested: 100, payout: 200.75, durationDays: 365 });
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.totalGainPct).toBeCloseTo(100.75, 2);
      }
    });

    it('5.10 handles 30-year lump sum compounding at 15% rate', () => {
      const res = computeLumpSum(100000, 15, 30, 1);
      expect(res.success).toBe(true);
      expect(Math.round(res.finalMaturityAmount)).toBe(6621177);
    });

    it('5.11 handles 50-year lump sum compounding at 10% rate', () => {
      const res = computeLumpSum(10000, 10, 50, 1);
      expect(res.success).toBe(true);
      expect(Math.round(res.finalMaturityAmount)).toBe(1173909);
    });

    it('5.12 handles 40-year monthly SIP at ₹10,000/month at 12% rate', () => {
      const res = computeSip(10000, 12, 40);
      expect(res.success).toBe(true);
      expect(res.totalInvested).toBe(4800000);
      expect(res.finalEstimatedValue).toBeGreaterThan(100000000);
    });

    it('5.13 handles negative duration days (-30) in promise calculator', () => {
      const res = computeAnnualised({ invested: 10000, payout: 20000, durationDays: -30 });
      expect(res.success).toBe(false);
    });

    it('5.14 handles extremely high annual rate input (1000%) in Lump Sum', () => {
      const res = computeLumpSum(1000, 1000, 2, 1);
      expect(res.success).toBe(true);
      expect(res.finalMaturityAmount).toBe(121000);
    });

    it('5.15 handles negative interest rate (-5%) in Lump Sum', () => {
      const res = computeLumpSum(10000, -5, 2, 1);
      expect(res.success).toBe(true);
      expect(Math.round(res.finalMaturityAmount)).toBe(9025);
    });

    it('5.16 handles negative interest rate (-5%) in Monthly SIP', () => {
      const res = computeSip(1000, -5, 2);
      expect(res.success).toBe(true);
      expect(res.finalEstimatedValue).toBeLessThan(24000);
    });

    it('5.17 handles leap year duration calculation (366 days)', () => {
      const res = computeAnnualised({ invested: 10000, payout: 11000, durationDays: 366 });
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.totalGainPct).toBeCloseTo(10, 5);
      }
    });

    it('5.18 handles 10-year leap year duration (3652 days)', () => {
      const res = computeResearchCagrModeB({
        initialLumpSum: 10000,
        endingValue: 20000,
        startDateStr: '2016-01-01',
        endDateStr: '2026-01-01',
      });
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.daysDuration).toBe(3653);
        expect(res.cagrPct).toBeCloseTo(7.18, 1);
      }
    });

    it('5.19 computes monthly compounding frequency (n=12) in Lump Sum', () => {
      const res = computeLumpSum(100000, 12, 1, 12);
      expect(res.success).toBe(true);
      expect(Math.round(res.finalMaturityAmount)).toBe(112683);
    });

    it('5.20 computes daily compounding frequency (n=365) in Lump Sum', () => {
      const res = computeLumpSum(100000, 12, 1, 365);
      expect(res.success).toBe(true);
      expect(Math.round(res.finalMaturityAmount)).toBe(112747);
    });

    it('5.21 prevents Infinity in Lump Sum principal', () => {
      const res = computeLumpSum(Infinity, 10, 5);
      expect(res.success).toBe(false);
    });

    it('5.22 prevents Infinity in SIP monthly contribution', () => {
      const res = computeSip(Infinity, 12, 5);
      expect(res.success).toBe(false);
    });

    it('5.23 computes high CAGR (10x growth in 1 year)', () => {
      const res = computeResearchCagrModeB({
        initialLumpSum: 10000,
        endingValue: 100000,
        startDateStr: '2024-01-01',
        endDateStr: '2025-01-01',
      });
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.cagrPct).toBeCloseTo(895.29, 1);
      }
    });

    it('5.24 handles zero profit CAGR calculation (10k to 10k)', () => {
      const res = computeResearchCagrModeB({
        initialLumpSum: 10000,
        endingValue: 10000,
        startDateStr: '2024-01-01',
        endDateStr: '2025-01-01',
      });
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.cagrPct).toBe(0);
        expect(res.totalReturnPct).toBe(0);
      }
    });

    it('5.25 handles complete loss scenario (10k to 0) without throwing', () => {
      const res = computeResearchCagrModeB({
        initialLumpSum: 10000,
        endingValue: 0,
        startDateStr: '2024-01-01',
        endDateStr: '2025-01-01',
      });
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.isLoss).toBe(true);
        expect(res.totalReturnPct).toBe(-100);
      }
    });

    it('5.26 verifies analyst breakdown for zero gain', () => {
      const breakdown = computeResearchAnalystBreakdown(10000, 10000, 365);
      expect(breakdown).not.toBeNull();
      if (breakdown) {
        expect(breakdown.riskVerdict).toBe('SEBI_REGULATED_NORMAL');
        expect(breakdown.unbackedExceedanceAmount).toBe(0);
      }
    });
  });
});
