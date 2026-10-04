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
  const LOCALIZED_RISK_TITLES: Record<Lang, Record<string, string>> = {
    en: {
      HIGH: 'HIGH RISK (Major Red Flags Found)',
      MEDIUM: 'MEDIUM RISK (Caution Advised)',
      LOW_SIGNALS: 'Low Risk Signals Found (Not a Guarantee)',
      CANNOT_VERIFY: 'Cannot Verify From Available Data',
    },
    hi: {
      HIGH: 'उच्च जोखिम (गंभीर धोखाधड़ी के संकेत मिले)',
      MEDIUM: 'मध्यम जोखिम (सावधानी बरतें)',
      LOW_SIGNALS: 'कम जोखिम के संकेत (यह कोई गारंटी नहीं है)',
      CANNOT_VERIFY: 'उपलब्ध स्रोतों से पुष्टि नहीं की जा सकती',
    },
    ta: {
      HIGH: 'அதிக ஆபத்து (முக்கிய எச்சரிக்கை அறிகுறிகள் கண்டறியப்பட்டன)',
      MEDIUM: 'நடுத்தர ஆபத்து (எச்சரிக்கை தேவை)',
      LOW_SIGNALS: 'குறைந்த ஆபத்து அறிகுறிகள் (இது உத்தரவாதம் அல்ல)',
      CANNOT_VERIFY: 'கிடைக்கக்கூடிய தரவிலிருந்து சரிபார்க்க முடியவில்லை',
    },
  };

  const explanationLabels = {
    en: {
      summaryHeader: '### Risk Analysis Summary',
      detectedHeader: '### What we detected',
      whyHeader: '### Why this matters',
      unverifiedHeader: '### What we cannot verify',
      whatToDoHeader: '### What to do',
      sourcesHeader: '### Sources',
      noScamDetected: '- No explicit scam patterns detected.',
      whyHigh: 'These signals strongly combine high-risk patterns such as guaranteed/unrealistic returns, urgent calls-to-action, or requests to move conversations to private groups or install unverified applications.',
      whyMedium: 'The message exhibits suspicious promotional tactics, unverified advisory services, or high-pressure language that warrant caution.',
      whyLow: 'No acute behavioral manipulation or high-risk scam patterns were identified in this message.',
      whatToDo: [
        'Do not transfer money or share credentials/OTPs with unknown contacts.',
        'Verify any entity or advisor registration on the official regulator directory (e.g. SEBI/RBI).',
        'Report suspicious cyber or financial fraud attempts to the official national portal (1930 / cybercrime.gov.in).',
      ],
      claimsLabel: 'Claims related to',
      socialLabel: 'Uses social engineering tactics',
      requestsLabel: 'Requests action',
      mechanismsLabel: 'Exhibits patterns of',
    },
    hi: {
      summaryHeader: '### जोखिम विश्लेषण का सारांश',
      detectedHeader: '### हमने क्या पाया',
      whyHeader: '### यह महत्वपूर्ण क्यों है',
      unverifiedHeader: '### हम क्या सत्यापित नहीं कर सकते',
      whatToDoHeader: '### आपको क्या करना चाहिए',
      sourcesHeader: '### आधिकारिक स्रोत',
      noScamDetected: '- कोई स्पष्ट धोखाधड़ी पैटर्न नहीं पाया गया।',
      whyHigh: 'ये संकेत गारंटीकृत या अवास्तविक रिटर्न, दबाव बनाने वाले शब्दों, गुप्त समूहों में शामिल होने या अज्ञात ऐप डाउनलोड करने जैसे उच्च-जोखिम वाले पैटर्न को दर्शाते हैं।',
      whyMedium: 'यह संदेश संदिग्ध प्रचार रणनीतियों, असत्यापित सलाहकारी सेवाओं या दबाव की भाषा को दर्शाता है जिसके लिए सावधानी की आवश्यकता है।',
      whyLow: 'इस संदेश में कोई गंभीर धोखाधड़ी या हेरफेर के संकेत नहीं पाए गए हैं।',
      whatToDo: [
        'अज्ञात संपर्कों के साथ कभी भी पैसे ट्रांसफर न करें और न ही ओटीपी या पासवर्ड साझा करें।',
        'आधिकारिक नियामक निर्देशिका (जैसे SEBI / RBI) पर किसी भी संस्था या सलाहकार के पंजीकरण की जांच करें।',
        'किसी भी संदिग्ध साइबर या वित्तीय धोखाधड़ी के प्रयास की रिपोर्ट आधिकारिक राष्ट्रीय हेल्पलाइन (1930 / cybercrime.gov.in) पर करें।',
      ],
      claimsLabel: 'दावे',
      socialLabel: 'सामाजिक हेरफेर रणनीतियाँ',
      requestsLabel: 'अनुरोधित कार्रवाई',
      mechanismsLabel: 'पैटर्न संकेत',
    },
    ta: {
      summaryHeader: '### அபாய பகுப்பாய்வு சுருக்கம்',
      detectedHeader: '### நாங்கள் கண்டறிந்தவை',
      whyHeader: '### இது ஏன் முக்கியமானது',
      unverifiedHeader: '### எங்களால் சரிபார்க்க முடியாதவை',
      whatToDoHeader: '### நீங்கள் செய்ய வேண்டியவை',
      sourcesHeader: '### அதிகாரப்பூர்வ ஆதாரங்கள்',
      noScamDetected: '- வெளிப்படையான மோசடி வடிவங்கள் எதுவும் கண்டறியப்படவில்லை.',
      whyHigh: 'இந்த அறிகுறிகள் உத்தரவாதமான சாத்தியமில்லாத வருமானம், அவசரப்படுத்தும் வார்த்தைகள், ரகசிய குழுக்களில் சேருதல் அல்லது அறியப்படாத செயலிகளை பதிவிறக்குதல் போன்ற அதிக ஆபத்து வடிவங்களை காட்டுகின்றன.',
      whyMedium: 'இந்த செய்தி சந்தேகத்திற்குரிய விளம்பர உத்திகள் அல்லது எச்சரிக்கை தேவைப்படும் அழுத்தமான மொழியைக் காட்டுகிறது.',
      whyLow: 'இந்த செய்தியில் எந்த கடுமையான மோசடி அல்லது ஏமாற்று அறிகுறிகளும் கண்டறியப்படவில்லை.',
      whatToDo: [
        'தெரியாத நபர்களுக்கு பணம் அனுப்பவோ, கடவுச்சொல் / OTP பகிரவோ வேண்டாம்.',
        'அதிகாரப்பூர்வ ஒழுங்குமுறை அமைப்புகளின் தளத்தில் (SEBI / RBI) நிறுவனத்தின் பதிவை சரிபார்க்கவும்.',
        'சந்தேகத்திற்குரிய இணைய நிதி மோசடிகளை தேசிய உதவி எண் (1930 / cybercrime.gov.in) மூலம் புகாரளிக்கவும்.',
      ],
      claimsLabel: 'உரிமைகோரல்கள்',
      socialLabel: 'சமூக கையாளுதல் உத்திகள்',
      requestsLabel: 'கோரப்பட்ட செயல்',
      mechanismsLabel: 'முறை அறிகுறிகள்',
    },
  };

  const expLabels = explanationLabels[lang] || explanationLabels.en;
  const whatWeDetected: string[] = [];

  if (semanticEvidence) {
    if (semanticEvidence.claims.length > 0) {
      semanticEvidence.claims.forEach((c) => {
        whatWeDetected.push(`${expLabels.claimsLabel} (${c.type.toLowerCase().replace(/_/g, ' ')}): "${c.text}".`);
      });
    }
    if (semanticEvidence.socialEngineering.length > 0) {
      whatWeDetected.push(`${expLabels.socialLabel}: ${semanticEvidence.socialEngineering.map((t) => t.tactic.toLowerCase().replace(/_/g, ' ')).join(', ')}.`);
    }
    if (semanticEvidence.requests.length > 0) {
      whatWeDetected.push(`${expLabels.requestsLabel}: ${semanticEvidence.requests.map((r) => r.type.toLowerCase().replace(/_/g, ' ')).join(', ')}.`);
    }
    if (semanticEvidence.behavioralMechanisms.length > 0) {
      whatWeDetected.push(`${expLabels.mechanismsLabel}: ${semanticEvidence.behavioralMechanisms.map((m) => m.type.toLowerCase().replace(/_/g, ' ')).join(', ')}.`);
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
    whyItMattersParts.push(expLabels.whyHigh);
  } else if (detectorRes.fusion.finalBand === 'MEDIUM') {
    whyItMattersParts.push(expLabels.whyMedium);
  } else {
    whyItMattersParts.push(expLabels.whyLow);
  }

  const unverifiedList = [
    localeStrings.results.unverified_sender,
    localeStrings.results.unverified_reg,
    localeStrings.results.unverified_domain,
    localeStrings.results.unverified_exists,
  ];

  const riskTitleBand = (LOCALIZED_RISK_TITLES[lang] || LOCALIZED_RISK_TITLES.en)[detectorRes.fusion.finalBand] || detectorRes.fusion.finalBand;

  // Assemble formatted structured summary
  const summarySections = [
    `${expLabels.summaryHeader}\n${riskTitleBand}`,
    `${expLabels.detectedHeader}\n${whatWeDetected.length > 0 ? whatWeDetected.map((d) => `- ${d}`).join('\n') : expLabels.noScamDetected}`,
    `${expLabels.whyHeader}\n${whyItMattersParts.join(' ')}`,
    `${expLabels.unverifiedHeader}\n${unverifiedList.map((u) => `- ${u}`).join('\n')}`,
    `${expLabels.whatToDoHeader}\n${expLabels.whatToDo.map((a) => `- ${a}`).join('\n')}`,
  ];

  if (isKnowledgeRequired && ragResponse?.citations && ragResponse.citations.length > 0) {
    summarySections.push(`${expLabels.sourcesHeader}\n${ragResponse.citations.map((c) => `- [${c.title}](${c.sourceUrl}) (${c.publisher})`).join('\n')}`);
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
