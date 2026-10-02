import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { maskPII } from '@/lib/mask';
import { validateIncidentConsistency } from '@/lib/report/consistency';

const draftRequestSchema = z.object({
  incidentDate: z.string(),
  platform: z.string(),
  entityName: z.string().optional(),
  totalAmount: z.number().nonnegative(),
  transactions: z
    .array(
      z.object({
        utrNumber: z.string().optional(),
        amount: z.number(),
        beneficiaryAccountOrUpi: z.string().optional(),
        date: z.string().optional(),
      })
    )
    .optional(),
  narrative: z.string(),
  lang: z.enum(['en', 'hi', 'ta']).default('en'),
});

export async function POST(req: NextRequest) {
  try {
    const raw = await req.json();
    const parseRes = draftRequestSchema.safeParse(raw);

    if (!parseRes.success) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', details: parseRes.error.flatten() } },
        { status: 400 }
      );
    }

    const data = parseRes.data;

    // Check entity consistency
    const consistency = validateIncidentConsistency({
      incidentDate: data.incidentDate,
      platform: data.platform,
      entityName: data.entityName,
      totalAmount: data.totalAmount,
      transactions: data.transactions,
      narrative: data.narrative,
    });

    // Mask narrative locally
    const maskedNarrative = maskPII(data.narrative).masked;

    const formattedDraft = {
      header: {
        documentType: 'CITIZEN FINANCIAL FRAUD INCIDENT SUMMARY (UNOFFICIAL PRE-FILING AID)',
        generatedAt: new Date().toISOString(),
        guidanceNotice:
          'This summary is prepared on-device to assist the citizen when registering a formal complaint on the National Cyber Crime Portal (cybercrime.gov.in) or by calling 1930 within the golden hour.',
      },
      incidentDetails: {
        incidentDate: data.incidentDate,
        platformUsed: data.platform,
        claimedEntityOrAdvisor: data.entityName || 'Unspecified / Individual',
        totalClaimedLoss: `₹${data.totalAmount.toLocaleString('en-IN')}`,
      },
      transactions: data.transactions || [],
      narrative: maskedNarrative,
      consistency,
      immediateActionAdvice: [
        '1. Immediately call 1930 to alert the beneficiary banks to freeze transacted amounts.',
        '2. Log in to cybercrime.gov.in and file a financial fraud incident report with transaction UTR numbers.',
        '3. Report and block the fraudulent contact or channel on telecom Chakshu (sancharsaathi.gov.in).',
      ],
    };

    return NextResponse.json(formattedDraft, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to draft incident record' } },
      { status: 500 }
    );
  }
}
