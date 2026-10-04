import { Lang } from '@/lib/types';
import { CanonicalInput, AnalysisResult, AnalysisStatuses, GroundedExplanation } from './types';
import { enforcePrivacyGate } from './privacy';
import { normalizeCanonicalInput } from './normalize';
import { runDetectorAdapter } from './adapters/detector';
import { extractSemanticFeatures } from '@/lib/detector/semanticExtract';
import { evaluateCompositionalReasoning } from '@/lib/detector/compositional';
import { askRag } from '@/lib/rag';
import { analyzeUrlsInText } from './url';
import { analyzeOpenWorldBehavior, OpenWorldAnalysis } from '@/lib/detector/openWorld';
import { getSemanticProvider } from '@/lib/semantic';
import { SemanticEvidence } from '@/lib/semantic/types';
import enMessages from '../../../locales/en.json';
import hiMessages from '../../../locales/hi.json';
import taMessages from '../../../locales/ta.json';

const messagesMap: Record<Lang, typeof enMessages> = {
  en: enMessages,
  hi: hiMessages as unknown as typeof enMessages,
  ta: taMessages as unknown as typeof enMessages,
};

export async function analyzeScam(input: CanonicalInput): Promise<AnalysisResult> {
  const timestamp = input.provenance?.timestamp || new Date().toISOString();
  const rawText = input.text || '';

  // 1. Input Validation
  if (!rawText.trim()) {
    return {
      decision: {
        band: 'CANNOT_VERIFY',
        archetype: { top: 'OTHER_OR_NONE', prob: 1 },
        confidence: 0,
        engine: 'none',
      },
      extractedClaims: {
        promisedReturns: [],
        urgencyPhrases: [],
        requests: [],
        registrationClaims: [],
        urls: [],
        handles: [],
      },
      signals: [],
      flags: [],
      explanation: {
        summary: 'No text was provided for analysis.',
        redFlags: [],
        whatCouldNotBeVerified: ['Empty message payload.'],
        citations: [],
        nextSteps: [],
      },
      statuses: {
        decision: 'DECISION_UNAVAILABLE',
        rag: 'RAG_NOT_REQUIRED',
        llm: 'LLM_EXPLANATION_UNAVAILABLE',
      },
      provenance: {
        source: input.source,
        maskedTextLength: 0,
        timestamp,
      },
      limitations: ['Empty or whitespace-only input.'],
    };
  }

  // 2. Privacy Gate Enforcement (PII is masked before any third-party or LLM call)
  const privacyGate = enforcePrivacyGate(input);
  const sanitizedText = privacyGate.sanitizedText;

  // 3. Normalization
  const normalization = normalizeCanonicalInput(sanitizedText, input.urls || [], input.language);
  const lang: Lang = normalization.detectedLang;
  const localeStrings = messagesMap[lang] || enMessages;

  // 4. Safe URL Intelligence Analysis
  const urlProvenance = input.source === 'OCR' ? 'OCR' : input.source === 'AUDIO_TRANSCRIPT' ? 'AUDIO_TRANSCRIPT' : 'DIRECT_TEXT';
  const urlAnalysis = await analyzeUrlsInText(normalization.normalizedText, urlProvenance);

  // 5. Semantic Understanding Layer (Gemini 2.5 with Deterministic Fallback)
  let semanticEvidence: SemanticEvidence | undefined;
  const semanticProvider = getSemanticProvider();
  try {
    semanticEvidence = await semanticProvider.analyze({
      sanitizedText: normalization.normalizedText,
      language: lang,
      extractedUrls: normalization.extractedUrls,
      source: input.source === 'OCR' ? 'OCR' : 'USER_TEXT',
    });
  } catch (err) {
    console.warn('[analyzeScam] Semantic provider exception:', err);
  }

  // 6. Detector Execution (Deterministic + Semantic Compositional + Open-World Behavioral Fusion)
  let detectorRes;
  let openWorldEval: OpenWorldAnalysis | undefined;
  let decisionStatus: AnalysisStatuses['decision'] = 'DECISION_AVAILABLE';
  try {
    detectorRes = await runDetectorAdapter(normalization.normalizedText, lang);
    
    // 6b. Semantic Feature Extraction & Compositional Reasoning (Ingesting Gemini Semantic Evidence)
    const semanticFeatures = extractSemanticFeatures(normalization.normalizedText, lang, detectorRes.claims, semanticEvidence);
    const compositionalEval = evaluateCompositionalReasoning(semanticFeatures, normalization.normalizedText);

    // 6c. Open-World General Behavioral Analysis
    openWorldEval = analyzeOpenWorldBehavior(normalization.normalizedText, lang, detectorRes.claims, urlAnalysis);

    // Fuse decision (open-world behavioral signals, semantic evidence or compositional matrix elevate risk)
    if (detectorRes.fusion.finalBand === 'HIGH') {
      // Deterministic rules or primary engine already established HIGH
      if (openWorldEval.suggestedArchetype && openWorldEval.suggestedArchetype !== 'OTHER_OR_NONE' && (detectorRes.fusion.topArchetype.top === 'OTHER_OR_NONE' || detectorRes.fusion.topArchetype.top === 'OTHER_SUSPICIOUS_FINANCIAL_PATTERN')) {
        detectorRes.fusion.topArchetype = { top: openWorldEval.suggestedArchetype, prob: openWorldEval.confidence };
      }
    } else if (compositionalEval.finalBand === 'HIGH' || openWorldEval.suggestedBand === 'HIGH') {
      detectorRes.fusion.finalBand = 'HIGH';
      if (openWorldEval.suggestedArchetype && openWorldEval.suggestedArchetype !== 'OTHER_OR_NONE') {
        detectorRes.fusion.topArchetype = { top: openWorldEval.suggestedArchetype, prob: openWorldEval.confidence };
      } else if (compositionalEval.topArchetype && compositionalEval.topArchetype.top !== 'OTHER_OR_NONE') {
        detectorRes.fusion.topArchetype = compositionalEval.topArchetype;
      }
      detectorRes.fusion.confidence = Math.max(detectorRes.fusion.confidence, compositionalEval.confidence, openWorldEval.confidence);
      detectorRes.engineName = 'semantic-compositional-fusion';
    } else if (detectorRes.fusion.finalBand === 'CANNOT_VERIFY' || detectorRes.fusion.finalBand === 'LOW_SIGNALS') {
      if (openWorldEval.suggestedBand === 'MEDIUM') {
        detectorRes.fusion.finalBand = 'MEDIUM';
        detectorRes.fusion.topArchetype = { top: openWorldEval.suggestedArchetype, prob: openWorldEval.confidence };
        detectorRes.fusion.confidence = openWorldEval.confidence;
        detectorRes.engineName = 'open-world-behavioral-fusion';
      } else if (compositionalEval.finalBand === 'MEDIUM') {
        detectorRes.fusion.finalBand = 'MEDIUM';
        detectorRes.fusion.topArchetype = compositionalEval.topArchetype;
        detectorRes.fusion.confidence = compositionalEval.confidence;
        detectorRes.engineName = 'semantic-compositional-fusion';
      }
    }

    // Educational question & passive transaction override safeguard
    const cleanNormText = normalization.normalizedText.replace(/\s*\(ref:.*?\)$/i, '').trim();
    const isEducationalQuery =
      semanticEvidence?.intent === 'EDUCATIONAL_QA' ||
      /\b(what is|what are|what should|why do|how does|how do|how to|how can|what standard|can a|could a|can you explain|meaning of|definition of|calculate|कैलकुलेट|என்ன|ஏன்|எப்படி|section 80c|sovereign gold bond|repo rate|ponzi scheme)\b/i.test(
        cleanNormText
      ) || cleanNormText.endsWith('?');

    const isPassiveAlert =
      /\b(debited for|credited with|salary credited|trip receipt|order delivered|order dispatched|pnr|seat|booking confirmed|swiggy order|zomato order|uber trip|ola ride|flight confirmed|ticket confirmed|avail balance|txn id|transaction id|monthly mobile bill|received ₹|dispatched)\b/i.test(
        cleanNormText
      ) && !/\b(click link|pay fee|share otp|enter pin|verify at|claim refund|unfreeze|disconnected|penalty|warrant|urgent|http:\/\/|https:\/\/(?!bescom|tneb|airtel|jio|hdfcbank|sbi|icicibank))\b/i.test(cleanNormText);

    const hasActiveMaliciousSolicitation =
      /\b(pay fee|transfer money|deposit first|recharge|send money|share otp|enter pin|download|install|anydesk|teamviewer|rustdesk|remote access|disconnected tonight|in 2 hours|digital arrest|cbi officer|court warrant)\b/i.test(
        cleanNormText
      ) || Boolean(semanticEvidence?.requests.some((r) => ['SHARE_OTP', 'REMOTE_ACCESS', 'INSTALL_APK', 'SEND_MONEY'].includes(r.type)));

    if ((isEducationalQuery || isPassiveAlert) && !hasActiveMaliciousSolicitation) {
      detectorRes.fusion.finalBand = 'LOW_SIGNALS';
      detectorRes.fusion.topArchetype = { top: 'OTHER_OR_NONE', prob: 0.95 };
    }
  } catch (err) {
    decisionStatus = 'DECISION_DEGRADED';
    detectorRes = {
      fusion: {
        finalBand: 'CANNOT_VERIFY' as const,
        topArchetype: { top: 'OTHER_OR_NONE' as const, prob: 0 },
        confidence: 0,
        ruleDerivedBand: 'CANNOT_VERIFY' as const,
        decisionTopBand: 'CANNOT_VERIFY' as const,
      },
      flags: [],
      claims: {
        promisedReturns: [],
        urgencyPhrases: [],
        requests: [],
        registrationClaims: [],
        urls: normalization.extractedUrls,
        handles: [],
      },
      signals: [],
      engineName: 'error-degraded',
    };
  }

  // 7. RAG Decision Gate (RAG ONLY IF NEEDED)
  const isKnowledgeRequired = semanticEvidence?.knowledgeRequired && semanticEvidence.knowledgeRequired.type !== 'NONE';
  let ragStatus: AnalysisStatuses['rag'] = isKnowledgeRequired ? 'RAG_NO_SOURCE' : 'RAG_NOT_REQUIRED';
  let ragResponse;

  if (isKnowledgeRequired) {
    try {
      ragResponse = await askRag(normalization.normalizedText, lang);
      if (ragResponse.status === 'ANSWERED' && ragResponse.citations.length > 0) {
        ragStatus = 'RAG_FOUND';
      }
    } catch {
      ragStatus = 'RAG_UNAVAILABLE';
    }
  }

  // 8. Build 5-Part Message-Specific Grounded Explanation
  const whatWeDetected: string[] = [];
  if (semanticEvidence) {
    if (semanticEvidence.claims.length > 0) {
      semanticEvidence.claims.forEach((c) => {
        whatWeDetected.push(`Claims related to ${c.type.toLowerCase().replace(/_/g, ' ')}: "${c.text}".`);
      });
    }
    if (semanticEvidence.socialEngineering.length > 0) {
      whatWeDetected.push(`Uses social engineering tactics: ${semanticEvidence.socialEngineering.map((t) => t.tactic.toLowerCase().replace(/_/g, ' ')).join(', ')}.`);
    }
    if (semanticEvidence.requests.length > 0) {
      whatWeDetected.push(`Requests action: ${semanticEvidence.requests.map((r) => r.type.toLowerCase().replace(/_/g, ' ')).join(', ')}.`);
    }
    if (semanticEvidence.behavioralMechanisms.length > 0) {
      whatWeDetected.push(`Exhibits patterns of: ${semanticEvidence.behavioralMechanisms.map((m) => m.type.toLowerCase().replace(/_/g, ' ')).join(', ')}.`);
    }
  }

  // Fallback / supplement with detector flags if semantic list is minimal
  if (whatWeDetected.length === 0) {
    detectorRes.flags.forEach((f) => {
      const ruleKey = f.ruleId as keyof typeof localeStrings.rules;
      const desc = localeStrings.rules[ruleKey];
      if (desc) whatWeDetected.push(desc);
    });
  }

  // Include URL evidence signals into rule explanations if present
  if (urlAnalysis.aggregateSignals.length > 0) {
    whatWeDetected.push(...urlAnalysis.aggregateSignals);
  }

  // Build Why This Matters
  const whyItMattersParts: string[] = [];
  if (detectorRes.fusion.finalBand === 'HIGH') {
    whyItMattersParts.push('These signals strongly combine high-risk patterns such as guaranteed/unrealistic returns, urgent calls-to-action, or requests to move conversations to private groups or install unverified applications.');
  } else if (detectorRes.fusion.finalBand === 'MEDIUM') {
    whyItMattersParts.push('The message exhibits suspicious promotional tactics, unverified advisory services, or high-pressure language that warrant caution.');
  } else {
    whyItMattersParts.push('No acute behavioral manipulation or high-risk scam patterns were identified in this message.');
  }

  const unverifiedList = [
    localeStrings.results.unverified_sender,
    localeStrings.results.unverified_reg,
    localeStrings.results.unverified_domain,
    localeStrings.results.unverified_exists,
  ];

  const whatToDoList = [
    'Do not transfer money or share credentials/OTPs with unknown contacts.',
    'Verify any entity or advisor registration on the official regulator directory (e.g. SEBI/RBI).',
    'Report suspicious cyber or financial fraud attempts to the official national portal (1930 / cybercrime.gov.in).',
  ];

  // Assemble formatted structured summary
  const summarySections = [
    `### Risk Analysis Summary\n${detectorRes.fusion.finalBand}`,
    `### What we detected\n${whatWeDetected.length > 0 ? whatWeDetected.map((d) => `- ${d}`).join('\n') : '- No explicit scam patterns detected.'}`,
    `### Why this matters\n${whyItMattersParts.join(' ')}`,
    `### What we cannot verify\n${unverifiedList.map((u) => `- ${u}`).join('\n')}`,
    `### What to do\n${whatToDoList.map((a) => `- ${a}`).join('\n')}`,
  ];

  if (isKnowledgeRequired && ragResponse?.citations && ragResponse.citations.length > 0) {
    summarySections.push(`### Sources\n${ragResponse.citations.map((c) => `- [${c.title}](${c.sourceUrl}) (${c.publisher})`).join('\n')}`);
  }

  const summaryText = summarySections.join('\n\n');

  // 9. Calculate Deep-Link Next Steps
  let calcUrl = `/${lang}/calculator`;
  if (detectorRes.claims.promisedReturns.length > 0) {
    const pr = detectorRes.claims.promisedReturns[0];
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

  const citations = (ragResponse?.citations || []).map((c) => ({
    title: c.title,
    sourceUrl: c.sourceUrl,
    publisher: c.publisher,
  }));

  const groundedExplanation: GroundedExplanation = {
    summary: summaryText,
    redFlags: detectorRes.flags.map((f) => f.ruleId),
    whatCouldNotBeVerified: unverifiedList,
    citations,
    nextSteps,
  };

  const limitations: string[] = [];
  if (privacyGate.privacyStatus === 'MASKED') {
    limitations.push('Personal identifiers were anonymized prior to analysis.');
  }
  if (normalization.hasAmbiguousNumbers) {
    limitations.push('Promised returns lacked an explicit timeline or duration statement.');
  }
  if (urlAnalysis.ssrfBlockedCount > 0) {
    limitations.push('One or more internal/private IP targets were blocked for security reasons.');
  }

  return {
    decision: {
      band: detectorRes.fusion.finalBand,
      archetype: detectorRes.fusion.topArchetype,
      confidence: detectorRes.fusion.confidence,
      engine: detectorRes.engineName,
    },
    extractedClaims: detectorRes.claims,
    signals: detectorRes.signals,
    flags: detectorRes.flags,
    semanticEvidence,
    explanation: groundedExplanation,
    statuses: {
      decision: decisionStatus,
      rag: ragStatus,
      llm: 'LLM_EXPLANATION_AVAILABLE',
    },
    provenance: {
      source: input.source,
      maskedTextLength: sanitizedText.length,
      timestamp,
    },
    limitations,
    urlAnalysis,
    openWorldAnalysis: openWorldEval,
  };
}
