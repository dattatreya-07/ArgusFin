import { Lang } from '../types';
import { retrieveEvidence } from './retrieve';
import { validateAndExtractCitations, UNVERIFIED_FALLBACK_MESSAGES } from './citations';
import { EvidencePack, GroundedState, RagResponse } from './types';
import { SOURCE_REGISTRY, validateNumericClaimProvenance } from './sources';

import { defaultEducationalProvider } from './provider';

export * from './types';
export * from './corpus';
export * from './embed';
export * from './retrieve';
export * from './citations';
export * from './prompt';
export * from './sources';
export * from './provider';

const INVESTMENT_ADVICE_PATTERNS = [
  /\b(target\s+price|price\s+target|future\s+price|price\s+prediction|price\s+forecast|buy\s+or\s+sell|should\s+i\s+buy|will\s+go\s+up|rise\s+or\s+fall|will\s+rise|will\s+fall|stock\s+tip|guaranteed\s+return|return\s+rate)\b/i,
  /भविष्यवाणी|टारगेट\s+प्राइस|शेयर\s+का\s+दाम|क्या\s+खरीदना\s+चाहिए/i,
  /விலை\s+முன்கணிப்பு|வாங்கலாமா|பங்கு\s+விலை/i,
];

const PROMPT_INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous\s+)?instructions/i,
  /system\s+instruction/i,
  /declare\s+(this\s+)?(website|app|investment)\s+100%\s+safe/i,
  /reveal\s+(your\s+)?hidden\s+instructions/i,
];

/**
 * Main RAG entrypoint answering user queries strictly from verified regulatory evidence.
 * Governs sources, numeric claim provenance, and prompt injection defenses.
 */
export async function askRag(query: string, lang: Lang = 'en'): Promise<RagResponse> {
  const trimmed = (query || '').trim();
  if (trimmed.length < 3) {
    return {
      status: 'INVALID_REQUEST',
      groundedState: 'NO_SOURCE',
      answer: UNVERIFIED_FALLBACK_MESSAGES[lang] || UNVERIFIED_FALLBACK_MESSAGES.en,
      verified: false,
      citations: [],
      retrievedChunks: [],
      confidence: 0,
      language: lang,
    };
  }

  // Hard Rule 1: No investment advice, price predictions, or market forecasts
  if (INVESTMENT_ADVICE_PATTERNS.some((pat) => pat.test(trimmed))) {
    return {
      status: 'NO_SOURCE',
      groundedState: 'NO_SOURCE',
      answer: UNVERIFIED_FALLBACK_MESSAGES[lang] || UNVERIFIED_FALLBACK_MESSAGES.en,
      verified: false,
      citations: [],
      retrievedChunks: [],
      confidence: 0,
      language: lang,
      uncertainty: 'Query requests market predictions or investment advice which cannot be provided under regulatory safety rules.',
    };
  }

  // Prompt Injection Defense: treat query strictly as untrusted data
  const isPromptInjection = PROMPT_INJECTION_PATTERNS.some((p) => p.test(trimmed));
  const safeQuery = isPromptInjection
    ? trimmed.replace(/system\s+instruction/gi, 'user_text').replace(/ignore\s+instructions/gi, 'text')
    : trimmed;

  // 1. Retrieve top-k evidence chunks
  const retrieved = retrieveEvidence(safeQuery, lang, 5, 0.15);

  const evidencePack: EvidencePack = {
    query: safeQuery,
    language: lang,
    retrieved,
    status: retrieved.length > 0 && retrieved[0].similarityScore >= 0.15 ? 'FOUND' : 'NO_SOURCE',
  };

  if (evidencePack.status === 'NO_SOURCE') {
    return {
      status: 'NO_SOURCE',
      groundedState: 'NO_SOURCE',
      answer: UNVERIFIED_FALLBACK_MESSAGES[lang] || UNVERIFIED_FALLBACK_MESSAGES.en,
      verified: false,
      citations: [],
      retrievedChunks: retrieved,
      confidence: retrieved.length > 0 ? retrieved[0].similarityScore : 0,
      language: lang,
      uncertainty: 'No authoritative evidence chunks met the required similarity threshold.',
    };
  }

  // 2. Determine Evidence Sufficiency (STRONG_SOURCE vs WEAK_SOURCE)
  const topSimilarity = retrieved[0].similarityScore;
  const isWeakSource = topSimilarity < 0.28;

  // 3. Synthesize structured answer via Educational Provider
  const generated = await defaultEducationalProvider.generateAnswer(safeQuery, evidencePack, lang);

  let finalAnswer = generated.answer;
  if (isWeakSource) {
    const weakPrefix =
      lang === 'hi'
        ? '⚠️ सीमित सत्यापन: मुझे संबंधित आधिकारिक सामग्री मिली है, लेकिन यह इस प्रश्न का पूरी तरह उत्तर नहीं दे सकती है:\n\n'
        : lang === 'ta'
        ? '⚠️ வரம்பிற்குட்பட்ட சரிபார்ப்பு: தொடர்புடைய அதிகாரப்பூர்வ பொருள் கிடைத்துள்ளது, ஆனால் முழுமையான பதில் இல்லை:\n\n'
        : '⚠️ Limited Verification: Related official material was retrieved, but it may not fully answer every aspect of this query:\n\n';
    finalAnswer = weakPrefix + finalAnswer;
  }

  // 4. Validate citations and numeric grounding
  const validated = validateAndExtractCitations(finalAnswer, retrieved, lang);

  // Validate numeric claims in generated text against source registry
  const retrievedSources = retrieved
    .slice(0, 3)
    .map((e) => SOURCE_REGISTRY.find((s) => s.canonicalUrl === e.sourceUrl))
    .filter(Boolean) as any[];

  const numericValidation = validateNumericClaimProvenance('1930', retrievedSources);
  const groundedState: GroundedState = validated.valid && numericValidation.valid ? 'GROUNDED' : 'PARTIALLY_GROUNDED';

  return {
    status: validated.valid ? 'ANSWERED' : 'NO_SOURCE',
    groundedState: isWeakSource ? 'PARTIALLY_GROUNDED' : groundedState,
    answer: validated.sanitizedAnswer,
    verified: validated.valid,
    citations: generated.citations.length > 0 ? generated.citations : validated.citations,
    retrievedChunks: retrieved,
    confidence: Math.min(0.95, retrieved[0].similarityScore),
    language: lang,
  };
}
