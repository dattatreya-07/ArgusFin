import { describe, expect, it } from 'vitest';
import { computeAnnualised } from './calc';

describe('computeAnnualised', () => {
  it('computes worked example ₹10,000 -> ₹20,000 in 30 days correctly (~4,598x, tier 4)', () => {
    const result = computeAnnualised({
      invested: 10000,
      payout: 20000,
      durationDays: 30,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.multiple).toBe(2);
      expect(result.totalGainPct).toBe(100);
      expect(result.annualisedMultiple).toBeGreaterThan(4590);
      expect(result.annualisedMultiple).toBeLessThan(4605);
      expect(result.tier).toBe(4);
      expect(result.overflow).toBe(false);
    }
  });

  it('computes standard 1-year 6% return (10000 -> 10600 in 365 days)', () => {
    const result = computeAnnualised({
      invested: 10000,
      payout: 10600,
      durationDays: 365,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.multiple).toBe(1.06);
      expect(result.totalGainPct).toBeCloseTo(6, 4);
      expect(result.annualisedMultiple).toBeCloseTo(1.06, 4);
      expect(result.annualisedReturnPct).toBeCloseTo(6, 4);
      expect(result.tier).toBe(1);
      expect(result.overflow).toBe(false);
    }
  });

  it('correctly uses injectable thresholds for tiers 1, 2, and 3', () => {
    const thresholds = {
      tier1MaxAnnualisedReturnPct: 7,
      tier2MaxAnnualisedReturnPct: 14,
    };

    // Tier 1: 5% return
    const res1 = computeAnnualised({
      invested: 10000,
      payout: 10500,
      durationDays: 365,
      thresholds,
    });
    expect(res1.success && res1.tier).toBe(1);

    // Tier 2: 12% return
    const res2 = computeAnnualised({
      invested: 10000,
      payout: 11200,
      durationDays: 365,
      thresholds,
    });
    expect(res2.success && res2.tier).toBe(2);

    // Tier 3: 25% return (annualised multiple < 100, but > 14%)
    const res3 = computeAnnualised({
      invested: 10000,
      payout: 12500,
      durationDays: 365,
      thresholds,
    });
    expect(res3.success && res3.tier).toBe(3);
  });

  it('handles zero, negative, or invalid inputs safely without throwing', () => {
    const resZeroInvested = computeAnnualised({ invested: 0, payout: 1000, durationDays: 30 });
    expect(resZeroInvested.success).toBe(false);

    const resNegativePayout = computeAnnualised({ invested: 1000, payout: -500, durationDays: 30 });
    expect(resNegativePayout.success).toBe(false);

    const resZeroDays = computeAnnualised({ invested: 1000, payout: 2000, durationDays: 0 });
    expect(resZeroDays.success).toBe(false);

    const resNaN = computeAnnualised({ invested: NaN, payout: 2000, durationDays: 30 });
    expect(resNaN.success).toBe(false);

    const resInfinity = computeAnnualised({ invested: 1000, payout: Infinity, durationDays: 30 });
    expect(resInfinity.success).toBe(false);
  });

  it('handles huge results with overflow flag and tier 4', () => {
    // E.g., 10x in 1 day
    const result = computeAnnualised({
      invested: 1000,
      payout: 10000000,
      durationDays: 1,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.overflow).toBe(true);
      expect(result.tier).toBe(4);
    }
  });
});
