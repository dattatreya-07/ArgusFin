import { computeSip, computeLumpSum, SipCalcResult, LumpSumCalcResult } from '@/lib/calc';

export interface EducationalSipInput {
  monthlyContribution: number;
  annualRatePct: number;
  durationYears: number;
}

export interface EducationalSipOutput extends SipCalcResult {
  disclaimer: string;
}

export interface EducationalCompoundInput {
  principal: number;
  annualRatePct: number;
  durationYears: number;
  compoundingPerYear?: number;
}

export interface EducationalCompoundOutput extends LumpSumCalcResult {
  disclaimer: string;
}

const DISCLAIMER_TEXT =
  'Illustrative Assumption Only. Annual return rates are assumptions for mathematical education and do not represent guaranteed returns or investment advice.';

export class SimulatorService {
  public calculateSIP(input: EducationalSipInput): EducationalSipOutput {
    const res = computeSip(
      input.monthlyContribution,
      input.annualRatePct,
      input.durationYears
    );
    return {
      ...res,
      disclaimer: DISCLAIMER_TEXT,
    };
  }

  public calculateCompoundInterest(input: EducationalCompoundInput): EducationalCompoundOutput {
    const res = computeLumpSum(
      input.principal,
      input.annualRatePct,
      input.durationYears,
      input.compoundingPerYear || 1
    );
    return {
      ...res,
      disclaimer: DISCLAIMER_TEXT,
    };
  }
}

export const simulatorService = new SimulatorService();
