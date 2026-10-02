import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';

export const RollingWindowSchema = z.object({
  years: z.union([z.literal(5), z.literal(10)]),
  min: z.number().nullable().optional(),
  median: z.number().nullable().optional(),
  max: z.number().nullable().optional(),
  share_below_fd: z.number().nullable().optional(),
});

export const LadderRungRawSchema = z.object({
  id: z.string(),
  label_key: z.string().optional().default(''),
  name: z.string(),
  value_low: z.number().nullable().optional(),
  value_high: z.number().nullable().optional(),
  unit: z.string().default('percent_per_year'),
  as_of: z.string().nullable().optional(),
  source_url: z.string().nullable().optional(),
  note: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  rolling_windows: z.array(RollingWindowSchema).nullable().optional(),
});

export const LadderDataRawSchema = z.object({
  status: z.string().default('TODO(verify)'),
  rungs: z.array(LadderRungRawSchema),
});

export type LadderRungRaw = z.infer<typeof LadderRungRawSchema>;
export type LadderDataRaw = z.infer<typeof LadderDataRawSchema>;

export interface LadderDisplayRung {
  id: string;
  label_key: string;
  name: string;
  unit: string;
  value_low: number;
  value_high: number;
  as_of: string;
  source_url: string;
  note?: string;
  rolling_windows?: Array<{
    years: 5 | 10;
    min: number;
    median: number;
    max: number;
    share_below_fd?: number;
  }>;
}

export interface HiddenRungInfo {
  id: string;
  label_key: string;
  name: string;
  reason: string;
}

export interface LadderDisplayModel {
  status: string;
  activeRungs: LadderDisplayRung[];
  hiddenRungs: HiddenRungInfo[];
  disclaimer: string;
  asOf: string | null;
  sources: Array<{ id: string; source_url: string; as_of?: string | null }>;
}

export function transformLadderToDisplay(raw: LadderDataRaw): LadderDisplayModel {
  const activeRungs: LadderDisplayRung[] = [];
  const hiddenRungs: HiddenRungInfo[] = [];
  const sources: Array<{ id: string; source_url: string; as_of?: string | null }> = [];

  for (const rung of raw.rungs) {
    const hasValidRange =
      rung.value_low !== null &&
      rung.value_low !== undefined &&
      rung.value_high !== null &&
      rung.value_high !== undefined &&
      rung.source_url &&
      rung.as_of;

    if (hasValidRange) {
      activeRungs.push({
        id: rung.id,
        label_key: rung.label_key || `ladder.${rung.id}`,
        name: rung.name,
        unit: rung.unit,
        value_low: rung.value_low as number,
        value_high: rung.value_high as number,
        as_of: rung.as_of as string,
        source_url: rung.source_url as string,
        note: rung.note || rung.notes || undefined,
      });

      sources.push({
        id: rung.id,
        source_url: rung.source_url as string,
        as_of: rung.as_of,
      });
    } else {
      hiddenRungs.push({
        id: rung.id,
        label_key: rung.label_key || `ladder.${rung.id}`,
        name: rung.name,
        reason: 'data being verified',
      });
    }
  }

  return {
    status: raw.status,
    activeRungs,
    hiddenRungs,
    disclaimer: 'Past returns do not predict future returns. Real rates shown with source citations.',
    asOf: activeRungs.length > 0 ? activeRungs[0].as_of : null,
    sources,
  };
}

export async function loadLadderModel(): Promise<LadderDisplayModel> {
  const filePath = path.join(process.cwd(), 'data', 'ladder.json');
  const fileData = await fs.readFile(filePath, 'utf-8');
  const parsedJson = JSON.parse(fileData);
  const validated = LadderDataRawSchema.parse(parsedJson);
  return transformLadderToDisplay(validated);
}
