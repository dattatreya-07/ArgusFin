import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const reportDraftRequestSchema = z.object({
  fields: z.record(z.unknown()),
  lang: z.enum(['en', 'hi', 'ta']).default('en'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parseResult = reportDraftRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid report draft request format',
            details: parseResult.error.flatten(),
          },
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: {
          code: 'NOT_IMPLEMENTED',
          message: 'Victim first-record report generator will be implemented in Phase 1.',
        },
      },
      { status: 501 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: { code: 'INVALID_JSON', message: 'Malformed JSON payload' } },
      { status: 400 }
    );
  }
}
