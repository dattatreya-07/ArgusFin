import { describe, it, expect } from 'vitest';
import { computeAnnualised, computeLumpSum, computeSip, computeResearchCagrModeB } from '@/lib/calc';

describe('CORE-04 — Calculator Education & Integration Suite', () => {
  it('1. verifies Promise Reality Check (Mode D) returns valid annualized rate and tier', () => {
    const res = computeAnnualised({ invested: 10000, payout: 20000, durationDays: 30 });
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.multiple).toBe(2);
      expect(res.tier).toBe(4);
      expect(res.annualisedReturnPct).toBeGreaterThan(1000);
    }
  });

  it('2. verifies Lump Sum (Mode A) returns compound interest maturities', () => {
    const res = computeLumpSum(100000, 10, 5, 1);
    expect(res.success).toBe(true);
    expect(Math.round(res.finalMaturityAmount)).toBe(161051);
  });

  it('3. verifies Monthly SIP (Mode B) returns wealth growth projection', () => {
    const res = computeSip(5000, 12, 10);
    expect(res.success).toBe(true);
    expect(res.totalInvested).toBe(600000);
    expect(Math.round(res.finalEstimatedValue)).toBe(1161695);
  });

  it('4. verifies CAGR (Mode C) returns exact compound annual rate', () => {
    const res = computeResearchCagrModeB({
      initialLumpSum: 100000,
      endingValue: 144000,
      startDateStr: '2023-01-01',
      endDateStr: '2026-01-01',
    });
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.cagrPct).toBeCloseTo(12.92, 1);
    }
  });
});
