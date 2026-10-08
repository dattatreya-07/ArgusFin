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

const DEFAULT_TIER1_MAX_PCT = 8; // Typical savings/FD upper ceiling
const DEFAULT_TIER2_MAX_PCT = 15; // Typical 5-10y broad equity CAGR upper ceiling
const OVERFLOW_LIMIT = 1e15;

/**
 * Computes deterministic annualised return metrics for an investment promise (Promise Reality Check).
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

export interface LumpSumCalcResult {
  success: boolean;
  principal: number;
  annualRatePct: number;
  durationYears: number;
  compoundingFrequency: number;
  finalMaturityAmount: number;
  totalProfit: number;
  effectiveAnnualYieldPct: number;
  error?: string;
}

/**
 * Mode A: Lump Sum Compounding Calculator
 * Formula: A = P * (1 + r/n)^(n*t)
 */
export function computeLumpSum(
  principal: number,
  annualRatePct: number,
  durationYears: number,
  compoundingPerYear = 1
): LumpSumCalcResult {
  if (
    !Number.isFinite(principal) ||
    !Number.isFinite(annualRatePct) ||
    !Number.isFinite(durationYears) ||
    !Number.isFinite(compoundingPerYear)
  ) {
    return {
      success: false,
      principal: 0,
      annualRatePct: 0,
      durationYears: 0,
      compoundingFrequency: 1,
      finalMaturityAmount: 0,
      totalProfit: 0,
      effectiveAnnualYieldPct: 0,
      error: 'All inputs must be finite numbers.',
    };
  }

  if (principal <= 0) {
    return {
      success: false,
      principal: 0,
      annualRatePct: 0,
      durationYears: 0,
      compoundingFrequency: 1,
      finalMaturityAmount: 0,
      totalProfit: 0,
      effectiveAnnualYieldPct: 0,
      error: 'Principal must be greater than zero.',
    };
  }

  if (durationYears <= 0) {
    return {
      success: false,
      principal: 0,
      annualRatePct: 0,
      durationYears: 0,
      compoundingFrequency: 1,
      finalMaturityAmount: 0,
      totalProfit: 0,
      effectiveAnnualYieldPct: 0,
      error: 'Duration in years must be greater than zero.',
    };
  }

  if (compoundingPerYear <= 0) {
    compoundingPerYear = 1;
  }

  const r = annualRatePct / 100;
  const n = compoundingPerYear;
  const t = durationYears;

  const finalMaturityAmount = principal * Math.pow(1 + r / n, n * t);
  const totalProfit = finalMaturityAmount - principal;
  const effectiveAnnualYieldPct = (Math.pow(1 + r / n, n) - 1) * 100;

  return {
    success: true,
    principal,
    annualRatePct,
    durationYears,
    compoundingFrequency: compoundingPerYear,
    finalMaturityAmount,
    totalProfit,
    effectiveAnnualYieldPct,
  };
}

export interface SipCalcResult {
  success: boolean;
  monthlyContribution: number;
  annualRatePct: number;
  durationYears: number;
  totalInvested: number;
  totalGrowth: number;
  finalEstimatedValue: number;
  gainPct: number;
  error?: string;
}

/**
 * Mode B: Monthly Contribution (SIP-style) Calculator
 * Formula: A = M * [ (1 + i)^n - 1 ] / i * (1 + i)
 */
export function computeSip(
  monthlyContribution: number,
  annualRatePct: number,
  durationYears: number
): SipCalcResult {
  if (
    !Number.isFinite(monthlyContribution) ||
    !Number.isFinite(annualRatePct) ||
    !Number.isFinite(durationYears)
  ) {
    return {
      success: false,
      monthlyContribution: 0,
      annualRatePct: 0,
      durationYears: 0,
      totalInvested: 0,
      totalGrowth: 0,
      finalEstimatedValue: 0,
      gainPct: 0,
      error: 'Inputs must be finite numbers.',
    };
  }

  if (monthlyContribution <= 0) {
    return {
      success: false,
      monthlyContribution: 0,
      annualRatePct: 0,
      durationYears: 0,
      totalInvested: 0,
      totalGrowth: 0,
      finalEstimatedValue: 0,
      gainPct: 0,
      error: 'Monthly contribution must be greater than zero.',
    };
  }

  if (durationYears <= 0) {
    return {
      success: false,
      monthlyContribution: 0,
      annualRatePct: 0,
      durationYears: 0,
      totalInvested: 0,
      totalGrowth: 0,
      finalEstimatedValue: 0,
      gainPct: 0,
      error: 'Duration must be greater than zero.',
    };
  }

  const i = annualRatePct / 100 / 12;
  const n = durationYears * 12;
  const totalInvested = monthlyContribution * n;

  let finalEstimatedValue = 0;
  if (i === 0) {
    finalEstimatedValue = totalInvested;
  } else {
    finalEstimatedValue = monthlyContribution * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
  }

  const totalGrowth = finalEstimatedValue - totalInvested;
  const gainPct = totalInvested > 0 ? (totalGrowth / totalInvested) * 100 : 0;

  return {
    success: true,
    monthlyContribution,
    annualRatePct,
    durationYears,
    totalInvested,
    totalGrowth,
    finalEstimatedValue,
    gainPct,
  };
}

export interface ResearchAnalystBreakdown {
  cagrPct: number;
  niftyExpectedPayout: number;
  fdExpectedPayout: number;
  marketFairPayout: number;
  unbackedExceedanceAmount: number;
  unbackedExceedanceRatio: number;
  riskVerdict: 'SEBI_REGULATED_NORMAL' | 'HIGH_EQUITY_RISK' | 'UNBACKED_PONZI_RISK';
  analystSummary: string;
}

/**
 * Computes detailed Research Analyst Lumpsum CAGR breakdown vs SEBI / RBI market benchmarks.
 */
export function computeResearchAnalystBreakdown(
  invested: number,
  payout: number,
  durationDays: number
): ResearchAnalystBreakdown | null {
  if (invested <= 0 || payout <= 0 || durationDays <= 0) return null;

  const years = durationDays / 365;
  const multiple = payout / invested;
  const cagrPct = (Math.pow(multiple, 1 / Math.max(years, 0.0027)) - 1) * 100;

  // Official benchmark rates: Nifty 50 ~12% CAGR, RBI/Bank FD ~7.1% CAGR
  const niftyRate = 0.12;
  const fdRate = 0.071;

  const niftyExpectedPayout = invested * Math.pow(1 + niftyRate, years);
  const fdExpectedPayout = invested * Math.pow(1 + fdRate, years);
  const marketFairPayout = niftyExpectedPayout; // Equity upper market ceiling

  const unbackedExceedanceAmount = Math.max(0, payout - marketFairPayout);
  const unbackedExceedanceRatio = marketFairPayout > 0 ? payout / marketFairPayout : 1;

  let riskVerdict: 'SEBI_REGULATED_NORMAL' | 'HIGH_EQUITY_RISK' | 'UNBACKED_PONZI_RISK';
  let analystSummary: string;

  if (cagrPct <= 8) {
    riskVerdict = 'SEBI_REGULATED_NORMAL';
    analystSummary = 'Return aligns with standard RBI/Bank Fixed Deposit rates or debt instruments.';
  } else if (cagrPct <= 15) {
    riskVerdict = 'HIGH_EQUITY_RISK';
    analystSummary = 'Return aligns with long-term broad equity market indices (Nifty 50/Sensex). Subject to market volatility.';
  } else {
    riskVerdict = 'UNBACKED_PONZI_RISK';
    analystSummary = `Claimed CAGR of ${cagrPct > 1000 ? '>1,000%' : cagrPct.toFixed(1) + '%'} exceeds top regulated equity CAGR (~12–15%) by ${unbackedExceedanceRatio.toFixed(1)}x. High likelihood of unbacked advance-fee or pyramid scheme.`;
  }

  return {
    cagrPct,
    niftyExpectedPayout,
    fdExpectedPayout,
    marketFairPayout,
    unbackedExceedanceAmount,
    unbackedExceedanceRatio,
    riskVerdict,
    analystSummary,
  };
}

export interface ResearchCagrModeBInput {
  initialLumpSum: number;
  endingValue: number;
  startDateStr: string; // YYYY-MM-DD
  endDateStr: string;   // YYYY-MM-DD
}

export interface ResearchCagrModeBSuccess {
  success: true;
  initialLumpSum: number;
  endingValue: number;
  absoluteChange: number;
  totalReturnPct: number;
  daysDuration: number;
  yearsDuration: number;
  cagrPct: number;
  isLoss: boolean;
  labelDisclaimer: string;
}

export interface ResearchCagrModeBError {
  success: false;
  error: string;
}

export type ResearchCagrModeBResult = ResearchCagrModeBSuccess | ResearchCagrModeBError;

/**
 * Mode C: Educational Research CAGR based on exact calendar date intervals.
 */
export function computeResearchCagrModeB(input: ResearchCagrModeBInput): ResearchCagrModeBResult {
  const { initialLumpSum, endingValue, startDateStr, endDateStr } = input;

  if (
    typeof initialLumpSum !== 'number' ||
    typeof endingValue !== 'number' ||
    !Number.isFinite(initialLumpSum) ||
    !Number.isFinite(endingValue)
  ) {
    return { success: false, error: 'Amounts must be valid finite numbers.' };
  }

  if (initialLumpSum <= 0) {
    return { success: false, error: 'Initial lump sum must be greater than zero for valid CAGR calculation.' };
  }

  if (endingValue < 0) {
    return { success: false, error: 'Ending value cannot be negative.' };
  }

  const start = new Date(startDateStr);
  const end = new Date(endDateStr);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return { success: false, error: 'Invalid date format provided. Use YYYY-MM-DD.' };
  }

  const diffTimeMs = end.getTime() - start.getTime();
  const daysDuration = Math.round(diffTimeMs / (1000 * 60 * 60 * 24));

  if (daysDuration < 0) {
    return { success: false, error: 'End date must be after start date.' };
  }

  if (daysDuration === 0) {
    return { success: false, error: 'Start date and end date cannot be on the same day.' };
  }

  const yearsDuration = daysDuration / 365.25;
  const absoluteChange = endingValue - initialLumpSum;
  const totalReturnPct = (absoluteChange / initialLumpSum) * 100;
  const isLoss = absoluteChange < 0;

  let cagrPct = 0;
  if (endingValue > 0) {
    const multiple = endingValue / initialLumpSum;
    cagrPct = (Math.pow(multiple, 1 / yearsDuration) - 1) * 100;
  } else {
    cagrPct = -100;
  }

  return {
    success: true,
    initialLumpSum,
    endingValue,
    absoluteChange,
    totalReturnPct,
    daysDuration,
    yearsDuration,
    cagrPct,
    isLoss,
    labelDisclaimer: 'Based only on the values you entered. This is an educational calculation, not an investment recommendation or historical research study.',
  };
}

export interface InflationMilestone {
  years: number;
  futureMonthlyExpense: number;
  purchasingPowerRemainingPct: number;
  realValueOfLakh: number;
}

export interface InflationErosionResult {
  currentMonthlyExpense: number;
  annualInflationPct: number;
  horizonYears: number;
  futureMonthlyExpense: number;
  purchasingPowerLossPct: number;
  milestones: InflationMilestone[];
}

export function computeInflationErosion(
  currentMonthlyExpense: number,
  annualInflationPct: number,
  horizonYears: number
): InflationErosionResult {
  const r = annualInflationPct / 100;
  const futureMonthlyExpense = currentMonthlyExpense * Math.pow(1 + r, horizonYears);
  const purchasingPowerLossPct = (1 - 1 / Math.pow(1 + r, horizonYears)) * 100;

  const milestoneYears = [5, 10, 15, 20, 25, 30].filter((y) => y <= Math.max(horizonYears, 30));
  const milestones: InflationMilestone[] = milestoneYears.map((y) => {
    const fCost = currentMonthlyExpense * Math.pow(1 + r, y);
    const pRem = (1 / Math.pow(1 + r, y)) * 100;
    const realLakh = 100000 / Math.pow(1 + r, y);
    return {
      years: y,
      futureMonthlyExpense: Math.round(fCost),
      purchasingPowerRemainingPct: Math.round(pRem * 10) / 10,
      realValueOfLakh: Math.round(realLakh),
    };
  });

  return {
    currentMonthlyExpense,
    annualInflationPct,
    horizonYears,
    futureMonthlyExpense: Math.round(futureMonthlyExpense),
    purchasingPowerLossPct: Math.round(purchasingPowerLossPct * 10) / 10,
    milestones,
  };
}

export interface RuleOf72Result {
  promisedDurationText: string;
  durationYears: number;
  impliedAnnualRatePct: number;
  isImpossiblePromise: boolean;
  fdDoublingYears: number;
  indexDoublingYears: number;
}

export function computeRuleOf72(durationValue: number, unit: 'days' | 'months' | 'years'): RuleOf72Result {
  let durationYears = durationValue;
  if (unit === 'days') {
    durationYears = durationValue / 365.25;
  } else if (unit === 'months') {
    durationYears = durationValue / 12;
  }

  // Exact CAGR required to double: (2^(1/years) - 1) * 100
  const impliedAnnualRatePct = durationYears > 0 ? (Math.pow(2, 1 / durationYears) - 1) * 100 : 0;
  const isImpossiblePromise = durationYears < 3; // Any guarantee under 3 years (>26% p.a. guaranteed) is impossible

  return {
    promisedDurationText: `${durationValue} ${unit}`,
    durationYears,
    impliedAnnualRatePct: Math.round(impliedAnnualRatePct * 10) / 10,
    isImpossiblePromise,
    fdDoublingYears: Math.round((72 / 7.1) * 10) / 10, // ~10.1 years at 7.1% RBI/SBI FD rate
    indexDoublingYears: Math.round((72 / 12.0) * 10) / 10, // ~6.0 years at 12% Nifty long term
  };
}

export interface EmergencyFundResult {
  monthlyEssential: number;
  threeMonths: number;
  sixMonths: number;
  twelveMonths: number;
}

export function computeEmergencyFund(
  rentEmi: number,
  groceries: number,
  utilities: number,
  healthInsurance: number
): EmergencyFundResult {
  const monthlyEssential = Math.max(0, rentEmi) + Math.max(0, groceries) + Math.max(0, utilities) + Math.max(0, healthInsurance);
  return {
    monthlyEssential,
    threeMonths: monthlyEssential * 3,
    sixMonths: monthlyEssential * 6,
    twelveMonths: monthlyEssential * 12,
  };
}

