/**
 * Helper functions for numbers, Indian digit grouping, and scientific notation
 */

/**
 * Format a number using Indian grouping style (Lakhs and Crores)
 */
export function formatIndianNumber(num: number, maxDecimals = 2): string {
  if (!Number.isFinite(num)) return 'Overflow';
  if (Math.abs(num) >= 1e12) {
    return num.toExponential(2);
  }
  return num.toLocaleString('en-IN', {
    maximumFractionDigits: maxDecimals,
  });
}

/**
 * Format annualised multiple string (e.g. ~4,598x or scientific notation if massive)
 */
export function formatAnnualisedMultiple(multiple: number, isOverflow = false): string {
  if (isOverflow || !Number.isFinite(multiple) || multiple >= 1e12) {
    if (!Number.isFinite(multiple) || isOverflow) return '> 10¹²x';
    return `${multiple.toExponential(2)}x`;
  }
  if (multiple >= 1000) {
    return `${Math.round(multiple).toLocaleString('en-IN')}x`;
  }
  return `${multiple.toFixed(2)}x`;
}

/**
 * Format annualised percentage return
 */
export function formatAnnualisedReturnPct(pct: number, isOverflow = false): string {
  if (isOverflow || !Number.isFinite(pct) || pct >= 1e12) {
    if (!Number.isFinite(pct) || isOverflow) return 'Exponential Rate';
    return `${pct.toExponential(2)}%`;
  }
  return `${pct.toLocaleString('en-IN', { maximumFractionDigits: 1 })}%`;
}

export interface ReinvestProjection {
  periodsPerYear: number;
  finalValue: number;
  formattedValue: string;
  isOverflow: boolean;
}

/**
 * Compute the 12-month compounding projection if the promised rate repeated for a year.
 * P_reinvest = P * (A / P)^(365 / days) = P * annualisedMultiple
 */
export function computeReinvestProjection(
  invested: number,
  annualisedMultiple: number,
  durationDays: number,
  isOverflow = false
): ReinvestProjection {
  const periodsPerYear = durationDays > 0 ? 365 / durationDays : 0;

  if (isOverflow || !Number.isFinite(annualisedMultiple) || !Number.isFinite(invested) || invested <= 0) {
    return {
      periodsPerYear,
      finalValue: Infinity,
      formattedValue: '₹ ∞ (Beyond Total Global Wealth)',
      isOverflow: true,
    };
  }

  const finalValue = invested * annualisedMultiple;

  if (!Number.isFinite(finalValue) || finalValue >= 1e12) {
    const formatted = !Number.isFinite(finalValue)
      ? '₹ > 10¹² (Beyond Total Global Wealth)'
      : `₹${finalValue.toExponential(2)} (Beyond Total Global Wealth)`;

    return {
      periodsPerYear,
      finalValue,
      formattedValue: formatted,
      isOverflow: true,
    };
  }

  return {
    periodsPerYear,
    finalValue,
    formattedValue: `₹${formatIndianNumber(finalValue, 0)}`,
    isOverflow: false,
  };
}
