import { describe, expect, it } from 'vitest';
import {
  computeReinvestProjection,
  formatAnnualisedMultiple,
  formatAnnualisedReturnPct,
  formatIndianNumber,
} from './format';

describe('format utilities', () => {
  it('formats Indian numbers with standard digit grouping', () => {
    expect(formatIndianNumber(10000)).toBe('10,000');
    expect(formatIndianNumber(10000000)).toBe('1,00,00,000');
    expect(formatIndianNumber(1e13)).toBe('1.00e+13');
  });

  it('formats annualised multiple with proper grouping or scientific notation', () => {
    expect(formatAnnualisedMultiple(2)).toBe('2.00x');
    expect(formatAnnualisedMultiple(4598)).toBe('4,598x');
    expect(formatAnnualisedMultiple(1e13)).toBe('1.00e+13x');
    expect(formatAnnualisedMultiple(Infinity, true)).toBe('> 10¹²x');
  });

  it('formats annualised percentage returns', () => {
    expect(formatAnnualisedReturnPct(6.5)).toBe('6.5%');
    expect(formatAnnualisedReturnPct(459700)).toBe('4,59,700%');
    expect(formatAnnualisedReturnPct(Infinity, true)).toBe('Exponential Rate');
  });

  it('computes 12-month reinvest projection correctly', () => {
    // 10,000 at ~4598x => ~4.598 crore
    const proj = computeReinvestProjection(10000, 4598, 30);
    expect(proj.isOverflow).toBe(false);
    expect(proj.finalValue).toBe(45980000);
    expect(proj.formattedValue).toBe('₹4,59,80,000');
  });

  it('handles overflow and extreme numbers in reinvest projection', () => {
    const proj = computeReinvestProjection(10000, 1e14, 1, true);
    expect(proj.isOverflow).toBe(true);
    expect(proj.formattedValue).toContain('Beyond Total Global Wealth');
  });
});
