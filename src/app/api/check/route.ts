import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const checkRequestSchema = z.object({
  maskedText: z.string().min(1, 'Masked text is required'),
  imageBase64: z.string().optional(),
  consentImage: z.boolean().optional(),
  lang: z.enum(['en', 'hi', 'ta']).default('en'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parseResult = checkRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid check request format',
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
          message: 'Scam check pipeline will be implemented in Phase 1.',
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
