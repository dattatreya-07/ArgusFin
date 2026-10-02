export interface CalcThresholds {
  tier1MaxAnnualisedReturnPct?: number;
  tier2MaxAnnualisedReturnPct?: number;
}

export interface CalcInput {
  invested: number;
  payout: number;
  durationDays: number;
  thresholds?: CalcThresholds;
}

export type CalcTier = 1 | 2 | 3 | 4;

export interface CalcSuccessResult {
  success: true;
  multiple: number;
  totalGainPct: number;
  annualisedMultiple: number;
  annualisedReturnPct: number;
  tier: CalcTier;
  overflow: boolean;
}

export interface CalcErrorResult {
  success: false;
  error: string;
}

export type CalcResult = CalcSuccessResult | CalcErrorResult;

const DEFAULT_TIER1_MAX_PCT = 8; // Typical savings/FD upper ceiling (default placeholder)
const DEFAULT_TIER2_MAX_PCT = 15; // Typical 5-10y broad equity CAGR upper ceiling (default placeholder)
const OVERFLOW_LIMIT = 1e15;

/**
 * Computes deterministic annualised return metrics for an investment promise.
 * Pure function, never throws on invalid/non-finite inputs.
 */
export function computeAnnualised(input: CalcInput): CalcResult {
  const { invested, payout, durationDays, thresholds } = input;

  if (
    typeof invested !== 'number' ||
    typeof payout !== 'number' ||
    typeof durationDays !== 'number' ||
    !Number.isFinite(invested) ||
    !Number.isFinite(payout) ||
    !Number.isFinite(durationDays)
  ) {
    return {
      success: false,
      error: 'Inputs must be finite numbers.',
    };
  }

  if (invested <= 0) {
    return {
      success: false,
      error: 'Invested amount must be greater than zero.',
    };
  }

  if (payout <= 0) {
    return {
      success: false,
      error: 'Promised payout must be greater than zero.',
    };
  }

  if (durationDays <= 0) {
    return {
      success: false,
      error: 'Duration in days must be greater than zero.',
    };
  }

  const multiple = payout / invested;
  const totalGainPct = (multiple - 1) * 100;
  const exponent = 365 / durationDays;

  const rawAnnualisedMultiple = Math.pow(multiple, exponent);
  const overflow =
    !Number.isFinite(rawAnnualisedMultiple) ||
    rawAnnualisedMultiple > OVERFLOW_LIMIT ||
    Number.isNaN(rawAnnualisedMultiple);

  const annualisedMultiple = overflow ? Infinity : rawAnnualisedMultiple;
  const rawAnnualisedReturnPct = overflow ? Infinity : (annualisedMultiple - 1) * 100;
  const annualisedReturnPct = rawAnnualisedReturnPct;

  let tier: CalcTier;
  if (overflow || annualisedMultiple > 100) {
    tier = 4;
  } else {
    const tier1Max = thresholds?.tier1MaxAnnualisedReturnPct ?? DEFAULT_TIER1_MAX_PCT;
    const tier2Max = thresholds?.tier2MaxAnnualisedReturnPct ?? DEFAULT_TIER2_MAX_PCT;

    if (annualisedReturnPct <= tier1Max) {
      tier = 1;
    } else if (annualisedReturnPct <= tier2Max) {
      tier = 2;
    } else {
      tier = 3;
    }
  }

  return {
    success: true,
    multiple,
    totalGainPct,
    annualisedMultiple,
    annualisedReturnPct,
    tier,
    overflow,
  };
}
