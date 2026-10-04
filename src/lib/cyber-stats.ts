import { z } from 'zod';
import rawCyberStatsJson from '../../data/cyber_fraud_stats.json';
import sampleCyberStatsJson from '../../data/cyber_fraud_stats.sample.json';

export const StateFraudStatSchema = z.object({
  code: z.string(),
  name: z.string(),
  reported_cases_2022: z.number().nullable().optional(),
  rate_per_lakh: z.number().nullable().optional(),
  source_url: z.string().nullable().optional(),
  as_of: z.string().nullable().optional(),
  illustrative: z.boolean().optional(),
});

export const NationalTrendPointSchema = z.object({
  year: z.number(),
  reported_cases: z.number().nullable().optional(),
  source_url: z.string().nullable().optional(),
  as_of: z.string().nullable().optional(),
  illustrative: z.boolean().optional(),
});

export const CyberFraudDataSchema = z.object({
  status: z.string().default('TODO(verify)'),
  disclaimer: z.string().optional(),
  national_trend: z.array(NationalTrendPointSchema).optional().default([]),
  states: z.array(StateFraudStatSchema).optional().default([]),
});

export type StateFraudStat = z.infer<typeof StateFraudStatSchema>;
export type CyberFraudData = z.infer<typeof CyberFraudDataSchema>;

export interface CyberFraudDisplayModel {
  status: string;
  isDemo: boolean;
  hasVerifiedData: boolean;
  nationalTrend: Array<{ year: number; cases: number; sourceUrl?: string; asOf?: string }>;
  states: Array<{
    code: string;
    name: string;
    reportedCases: number;
    ratePerLakh: number;
    sourceUrl?: string;
    asOf?: string;
    illustrative?: boolean;
  }>;
}

export async function loadCyberFraudModel(): Promise<CyberFraudDisplayModel> {
  const isDemo = process.env.NEXT_PUBLIC_DEMO_DATA === 'true';

  try {
    const validated = CyberFraudDataSchema.parse(rawCyberStatsJson);

    const verifiedStates = validated.states.filter(
      (s) => s.reported_cases_2022 !== null && s.reported_cases_2022 !== undefined
    );

    if (verifiedStates.length > 0) {
      return {
        status: validated.status,
        isDemo: false,
        hasVerifiedData: true,
        nationalTrend: validated.national_trend
          .filter((t) => t.reported_cases !== null && t.reported_cases !== undefined)
          .map((t) => ({
            year: t.year,
            cases: t.reported_cases as number,
            sourceUrl: t.source_url || undefined,
            asOf: t.as_of || undefined,
          })),
        states: verifiedStates.map((s) => ({
          code: s.code,
          name: s.name,
          reportedCases: s.reported_cases_2022 as number,
          ratePerLakh: s.rate_per_lakh || 0,
          sourceUrl: s.source_url || undefined,
          asOf: s.as_of || undefined,
          illustrative: s.illustrative ?? false,
        })),
      };
    }

    // If real data empty and demo mode on: load sample
    if (isDemo) {
      const validatedSample = CyberFraudDataSchema.parse(sampleCyberStatsJson);
      return {
        status: validatedSample.status,
        isDemo: true,
        hasVerifiedData: true,
        nationalTrend: validatedSample.national_trend
          .filter((t) => t.reported_cases !== null && t.reported_cases !== undefined)
          .map((t) => ({
            year: t.year,
            cases: t.reported_cases as number,
            sourceUrl: t.source_url || undefined,
            asOf: t.as_of || undefined,
          })),
        states: validatedSample.states.map((s) => ({
          code: s.code,
          name: s.name,
          reportedCases: s.reported_cases_2022 || 0,
          ratePerLakh: s.rate_per_lakh || 0,
          sourceUrl: s.source_url || undefined,
          asOf: s.as_of || undefined,
          illustrative: true,
        })),
      };
    }

    return {
      status: 'TODO(verify)',
      isDemo: false,
      hasVerifiedData: false,
      nationalTrend: [],
      states: [],
    };
  } catch {
    if (isDemo) {
      try {
        const validatedSample = CyberFraudDataSchema.parse(sampleCyberStatsJson);
        return {
          status: validatedSample.status,
          isDemo: true,
          hasVerifiedData: true,
          nationalTrend: validatedSample.national_trend
            .filter((t) => t.reported_cases !== null && t.reported_cases !== undefined)
            .map((t) => ({
              year: t.year,
              cases: t.reported_cases as number,
              sourceUrl: t.source_url || undefined,
              asOf: t.as_of || undefined,
            })),
          states: validatedSample.states.map((s) => ({
            code: s.code,
            name: s.name,
            reportedCases: s.reported_cases_2022 || 0,
            ratePerLakh: s.rate_per_lakh || 0,
            sourceUrl: s.source_url || undefined,
            asOf: s.as_of || undefined,
            illustrative: true,
          })),
        };
      } catch {
        // Fallback
      }
    }
    return {
      status: 'TODO(verify)',
      isDemo: false,
      hasVerifiedData: false,
      nationalTrend: [],
      states: [],
    };
  }
}
