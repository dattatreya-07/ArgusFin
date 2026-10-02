import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { maskPII } from '@/lib/mask';
import { extractClaims } from '@/lib/extract';
import { evaluateRegisteredRules } from '@/lib/rules';
import { defaultDecisionEngine } from '@/lib/decision';
import { fuseDecisionAndRules } from '@/lib/fuse';
import { DecisionInput, Lang } from '@/lib/types';
import enMessages from '../../../../locales/en.json';
import hiMessages from '../../../../locales/hi.json';
import taMessages from '../../../../locales/ta.json';

const messagesMap: Record<Lang, typeof enMessages> = {
  en: enMessages,
  hi: hiMessages as unknown as typeof enMessages,
  ta: taMessages as unknown as typeof enMessages,
};

const checkRequestSchema = z
  .object({
    maskedText: z.string().min(1, 'Masked text is required').max(4000, 'Max 4000 characters'),
    lang: z.enum(['en', 'hi', 'ta']).default('en'),
  })
  .strict();

// In-memory rate limiting: 30 req / minute per IP
const ipRateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 30;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = ipRateLimitMap.get(ip);

  if (!record || now > record.resetAt) {
    ipRateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  record.count += 1;
  return true;
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';

  if (!checkRateLimit(clientIp)) {
    return NextResponse.json(
      { error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests. Please slow down.' } },
      { status: 429 }
    );
  }

  try {
    const rawBody = await req.json();
    const parseResult = checkRequestSchema.safeParse(rawBody);

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

    const { maskedText, lang } = parseResult.data;

    // Server-side re-masking as defense in depth
    const serverMaskResult = maskPII(maskedText);
    const sanitizedText = serverMaskResult.masked;

    // 1. Deterministic Extraction
    const claims = extractClaims(sanitizedText, lang);

    const decisionInput: DecisionInput = {
      maskedText: sanitizedText,
      claims,
      signals: [], // Signals pipeline (RDAP/Domain) is Phase 2
      lang,
    };

    // 2. Rules Evaluation
    const flags = evaluateRegisteredRules(decisionInput);

    // 3. Decision Engine Execution (Chain: Jev -> Fallback -> RulesOnly)
    let decision;
    try {
      decision = await defaultDecisionEngine.decide(decisionInput);
    } catch {
      // Graceful fallback to rules-only
      const { RulesOnlyDecisionEngine } = await import('@/lib/decision/rulesOnly');
      const rulesOnlyEngine = new RulesOnlyDecisionEngine();
      decision = await rulesOnlyEngine.decide(decisionInput);
    }

    // 4. Fusion Resolution
    const fusion = fuseDecisionAndRules(flags, decision);

    // 5. Assemble Explanation and Unverified list
    const localeStrings = messagesMap[lang] || enMessages;
    const ruleExplanations = flags
      .map((f) => {
        const ruleKey = f.ruleId as keyof typeof localeStrings.rules;
        return localeStrings.rules[ruleKey] || '';
      })
      .filter(Boolean);

    const fixedNote = localeStrings.results.explanationNote;
    const explanation =
      ruleExplanations.length > 0
        ? `${ruleExplanations.join(' ')}\n\n${fixedNote}`
        : fixedNote;

    const unverified = [
      localeStrings.results.unverified_sender,
      localeStrings.results.unverified_reg,
      localeStrings.results.unverified_domain,
      localeStrings.results.unverified_exists,
    ];

    // 6. Deep-link next steps
    let calcUrl = `/${lang}/calculator`;
    if (claims.promisedReturns.length > 0) {
      const pr = claims.promisedReturns[0];
      const multiple = pr.multiple || 2;
      const days = pr.durationDays || 30;
      const invested = 10000;
      const payout = invested * multiple;
      calcUrl += `?invested=${invested}&payout=${payout}&days=${days}`;
    }

    const nextSteps = [
      {
        id: 'calculator',
        label: localeStrings.results.actionCalculator,
        url: calcUrl,
      },
      {
        id: 'report',
        label: localeStrings.results.actionReport,
        url: `/${lang}/report`,
      },
    ];

    const durationMs = Date.now() - startTime;
    // Log safe telemetry only (status, engine used, latency)
    console.log(`[API /api/check] status=200 engine=${decision.engine} duration=${durationMs}ms`);

    return NextResponse.json(
      {
        band: fusion.finalBand,
        archetype: fusion.topArchetype,
        confidence: fusion.confidence,
        flags,
        signals: [],
        unverified,
        explanation,
        citations: [],
        nextSteps,
        engine: decision.engine,
      },
      { status: 200 }
    );
  } catch (error) {
    const durationMs = Date.now() - startTime;
    console.error(`[API /api/check] status=500 duration=${durationMs}ms`);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to evaluate check request' } },
      { status: 500 }
    );
  }
}
