import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { maskPii } from '@/lib/privacy';
import { validateIncidentConsistency } from '@/lib/incident/consistency';
import { routeAuthorities } from '@/lib/authorities/router';
import { IncidentReportDraft } from '@/lib/incident/types';
import { generateRequestId, logAppEvent } from '@/lib/observability';

const incidentDraftSchema = z.object({
  language: z.enum(['en', 'hi', 'ta']).default('en'),
  category: z.string().optional(),
  incidentDate: z.string().default(() => new Date().toISOString()),
  platform: z.string().default('WhatsApp / Telegram'),
  entityName: z.string().optional(),
  domain: z.string().optional(),
  totalAmount: z.number().nonnegative().default(0),
  paymentMethod: z.string().optional(),
  transactions: z
    .array(
      z.object({
        id: z.string().optional(),
        utrNumber: z.string().optional(),
        amount: z.number().nonnegative(),
        beneficiaryAccountOrUpi: z.string().optional(),
        date: z.string().optional(),
        paymentMethod: z.string().optional(),
        sourceBank: z.string().optional(),
      })
    )
    .optional(),
  narrative: z.string().max(5000).default(''),
  credentialsShared: z.boolean().default(false),
  otpShared: z.boolean().default(false),
  remoteAccessGranted: z.boolean().default(false),
  userConfirmed: z.boolean().default(false),
});

const LOCALIZED_DOC_TYPES = {
  en: 'CITIZEN FINANCIAL FRAUD INCIDENT SUMMARY (UNOFFICIAL PRE-FILING AID)',
  hi: 'नागरिक वित्तीय धोखाधड़ी घटना विवरण (अनौपचारिक पूर्व-शिकायत सहायता)',
  ta: 'குடிமக்கள் நிதி மோசடி சம்பவ அறிக்கை (அதிகாரப்பூர்வமற்ற முன்-பதிவு ஆவணம்)',
};

const LOCALIZED_GUIDANCE = {
  en: 'This summary is prepared on-device to assist the citizen when registering a formal complaint on the National Cyber Crime Portal (cybercrime.gov.in) or by calling 1930 within the golden hour.',
  hi: 'यह विवरण नागरिक को राष्ट्रीय साइबर अपराध पोर्टल (cybercrime.gov.in) पर औपचारिक शिकायत दर्ज करने या गोल्डन ऑवर में 1930 पर कॉल करने में सहायता के लिए तैयार किया गया है।',
  ta: 'தேசிய சைபர் குற்ற போர்ட்டலில் (cybercrime.gov.in) புகார் பதிவு செய்ய அல்லது முதல் 60 நிமிடங்களில் 1930 எண்ணை அழைக்க உதவும் வகையில் இந்த அறிக்கை தயாரிக்கப்பட்டுள்ளது.',
};

const LOCALIZED_DISCLAIMER = {
  en: 'Educational & Pre-filing Tool: SANGYAN does not file complaints directly with law enforcement. The citizen must present this summary through official portals (cybercrime.gov.in / 1930 / scores.gov.in).',
  hi: 'शैक्षिक उपकरण: संज्ञान सीधे पुलिस में शिकायत दर्ज नहीं करता है। नागरिक को यह विवरण आधिकारिक पोर्टल (cybercrime.gov.in / 1930) पर स्वयं दर्ज करना होगा।',
  ta: 'கல்வி வழிகாட்டி: இந்த தளம் நேரடியாக புகார்களை பதிவு செய்யாது. குடிமக்கள் அதிகாரப்பூர்வ தளம் (cybercrime.gov.in / 1930) மூலம் புகாரளிக்க வேண்டும்.',
};

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const requestId = req.headers.get('x-request-id') || generateRequestId();

  try {
    let raw: any;
    try {
      raw = await req.json();
    } catch {
      logAppEvent({
        name: 'validation_failure',
        requestId,
        route: '/api/report/draft',
        subsystem: 'report',
        status: 'failure',
        errorCode: 'VALIDATION_ERROR',
        durationMs: Date.now() - startTime,
      });

      return NextResponse.json(
        {
          requestId,
          status: 'INVALID_INPUT',
          error: { code: 'VALIDATION_ERROR', message: 'Malformed JSON payload.' },
        },
        { status: 400 }
      );
    }

    const parseRes = incidentDraftSchema.safeParse(raw);
    if (!parseRes.success) {
      logAppEvent({
        name: 'validation_failure',
        requestId,
        route: '/api/report/draft',
        subsystem: 'report',
        status: 'failure',
        errorCode: 'VALIDATION_ERROR',
        durationMs: Date.now() - startTime,
      });

      return NextResponse.json(
        {
          requestId,
          status: 'INVALID_INPUT',
          error: { code: 'VALIDATION_ERROR', details: parseRes.error.flatten() },
        },
        { status: 400 }
      );
    }

    const data = parseRes.data;
    const lang = data.language;

    // 1. Mask PII in narrative, entityName, and domain
    const maskedNarrative = maskPii(data.narrative);
    const maskedEntity = data.entityName ? maskPii(data.entityName) : 'Unspecified / Individual';
    const maskedDomain = data.domain ? maskPii(data.domain) : undefined;

    // Mask transactions identifiers
    const maskedTransactions = (data.transactions || []).map((tx) => ({
      ...tx,
      utrNumber: tx.utrNumber ? maskPii(tx.utrNumber) : undefined,
      beneficiaryAccountOrUpi: tx.beneficiaryAccountOrUpi
        ? maskPii(tx.beneficiaryAccountOrUpi)
        : undefined,
    }));

    // 2. Validate Entity Consistency
    const consistency = validateIncidentConsistency({
      language: lang,
      when: data.incidentDate,
      platform: data.platform,
      entityName: data.entityName,
      domain: data.domain,
      amount: data.totalAmount,
      transactions: data.transactions,
      whatHappened: data.narrative,
      credentialsShared: data.credentialsShared,
      otpShared: data.otpShared,
      remoteAccessGranted: data.remoteAccessGranted,
      category: data.category,
    });

    // 3. Deterministic Authority Routing
    const routedAuthorities = routeAuthorities({
      category: data.category,
      platform: data.platform,
      moneySent: data.totalAmount > 0,
      credentialsShared: data.credentialsShared,
      otpShared: data.otpShared,
      remoteAccessGranted: data.remoteAccessGranted,
      lang,
    });

    // 4. Format Output Draft
    const formattedDraft: IncidentReportDraft = {
      header: {
        documentType: LOCALIZED_DOC_TYPES[lang] || LOCALIZED_DOC_TYPES.en,
        generatedAt: new Date().toISOString(),
        guidanceNotice: LOCALIZED_GUIDANCE[lang] || LOCALIZED_GUIDANCE.en,
        disclaimer: LOCALIZED_DISCLAIMER[lang] || LOCALIZED_DISCLAIMER.en,
        language: lang,
      },
      incidentDetails: {
        incidentDate: data.incidentDate,
        platformUsed: data.platform,
        claimedEntityOrAdvisor: maskedEntity,
        websiteOrDomain: maskedDomain,
        totalClaimedLoss: `₹${data.totalAmount.toLocaleString('en-IN')}`,
        category: data.category || routedAuthorities.category,
        credentialsCompromised: Boolean(data.credentialsShared || data.otpShared),
        remoteAccessGranted: Boolean(data.remoteAccessGranted),
      },
      fieldProvenance: {
        incidentDate: 'USER',
        platformUsed: 'USER',
        claimedEntityOrAdvisor: 'USER',
        totalClaimedLoss: 'USER',
        category: data.category ? 'USER' : 'SYSTEM',
        consistencyWarnings: 'SYSTEM',
        routedAuthorities: 'SYSTEM',
      },
      transactions: maskedTransactions,
      narrative: maskedNarrative,
      consistency,
      routedAuthorities,
      immediateActionDirectives: [
        '1. Immediately call 1930 (National Cyber Crime Helpline) to request transaction freeze on beneficiary accounts.',
        '2. File a formal cyber financial fraud complaint at cybercrime.gov.in attaching your bank transaction statement.',
        '3. If communication occurred via WhatsApp, SMS, or fake calls, report the number to DoT Chakshu (sancharsaathi.gov.in).',
        '4. If investment advisory or share allotment was claimed, search the SEBI Intermediary Portal and lodge a grievance on scores.gov.in.',
      ],
    };

    const durationMs = Date.now() - startTime;
    logAppEvent({
      name: 'report_generation',
      requestId,
      route: '/api/report/draft',
      subsystem: 'report',
      status: 'success',
      language: lang,
      durationMs,
    });

    return NextResponse.json(
      {
        requestId,
        status: 'READY',
        draft: formattedDraft,
      },
      { status: 200 }
    );
  } catch (err: any) {
    logAppEvent({
      name: 'request_failed',
      requestId,
      route: '/api/report/draft',
      subsystem: 'report',
      status: 'failure',
      errorCode: 'INTERNAL_ERROR',
      durationMs: Date.now() - startTime,
    });

    return NextResponse.json(
      {
        requestId,
        status: 'UNAVAILABLE',
        error: { code: 'INTERNAL_ERROR', message: 'Failed to generate incident draft.' },
      },
      { status: 500 }
    );
  }
}
