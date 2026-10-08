import { describe, it, expect } from 'vitest';
import { simulatorService } from '@/lib/financeX/academy/simulators';

describe('FinanceX Educational Financial Simulators', () => {
  it('1. Computes SIP compounding math accurately with illustrative disclaimer', () => {
    const res = simulatorService.calculateSIP({
      monthlyContribution: 5000,
      annualRatePct: 12,
      durationYears: 10,
    });

    expect(res.success).toBe(true);
    expect(res.totalInvested).toBe(600000); // 5000 * 12 * 10
    expect(res.finalEstimatedValue).toBeGreaterThan(600000);
    expect(res.disclaimer).toContain('Illustrative Assumption Only');
  });

  it('2. Computes Lump Sum compounding math accurately', () => {
    const res = simulatorService.calculateCompoundInterest({
      principal: 100000,
      annualRatePct: 8,
      durationYears: 10,
    });

    expect(res.success).toBe(true);
    expect(res.principal).toBe(100000);
    expect(res.finalMaturityAmount).toBeGreaterThan(200000);
    expect(res.disclaimer).toBeDefined();
  });

  it('3. Handles zero or invalid input gracefully', () => {
    const res = simulatorService.calculateSIP({
      monthlyContribution: 0,
      annualRatePct: 12,
      durationYears: 5,
    });

    expect(res.success).toBe(false);
  });
});
