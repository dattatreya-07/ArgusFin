import { Lang } from '../types';
import { retrieveEvidence } from './retrieve';
import { validateAndExtractCitations, UNVERIFIED_FALLBACK_MESSAGES } from './citations';
import { RagResponse } from './types';

export * from './types';
export * from './corpus';
export * from './embed';
export * from './retrieve';
export * from './citations';

const INVESTMENT_ADVICE_PATTERNS = [
  /\b(price|target|prediction|forecast|buy\s+or\s+sell|future\s+price|should\s+i\s+buy|will\s+go\s+up|stock\s+tip)\b/i,
  /भविष्यवाणी|टारगेट\s+प्राइस|शेयर\s+का\s+दाम|क्या\s+खरीदना\s+चाहिए/i,
  /விலை\s+முன்கணிப்பு|வாங்கலாமா|பங்கு\s+விலை/i,
];

/**
 * Main RAG entrypoint answering user queries strictly from verified regulatory evidence.
 */
export async function askRag(query: string, lang: Lang = 'en'): Promise<RagResponse> {
  const trimmed = (query || '').trim();
  if (trimmed.length < 3) {
    return {
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
      answer: UNVERIFIED_FALLBACK_MESSAGES[lang] || UNVERIFIED_FALLBACK_MESSAGES.en,
      verified: false,
      citations: [],
      retrievedChunks: [],
      confidence: 0,
      language: lang,
    };
  }

  // 1. Retrieve top-k evidence chunks
  const retrieved = retrieveEvidence(trimmed, lang, 5, 0.15);

  if (retrieved.length === 0 || retrieved[0].similarityScore < 0.25) {
    return {
      answer: UNVERIFIED_FALLBACK_MESSAGES[lang] || UNVERIFIED_FALLBACK_MESSAGES.en,
      verified: false,
      citations: [],
      retrievedChunks: retrieved,
      confidence: retrieved.length > 0 ? retrieved[0].similarityScore : 0,
      language: lang,
    };
  }

  // 2. Synthesize structured answer grounded directly in evidence
  const topEvidence = retrieved.slice(0, 3);
  let synthesizedAnswer = '';

  if (lang === 'hi') {
    synthesizedAnswer = `सत्यापित आधिकारिक विनियामक दिशानिर्देशों के अनुसार:\n\n${topEvidence.map((e) => `• ${e.text} [${e.publisher}]`).join('\n\n')}`;
  } else if (lang === 'ta') {
    synthesizedAnswer = `சரிபார்க்கப்பட்ட அதிகாரப்பூர்வ ஒழுங்குமுறை வழிகாட்டுதல்களின்படி:\n\n${topEvidence.map((e) => `• ${e.text} [${e.publisher}]`).join('\n\n')}`;
  } else {
    synthesizedAnswer = `According to verified regulatory guidelines:\n\n${topEvidence.map((e) => `• ${e.text} [${e.publisher}]`).join('\n\n')}`;
  }

  // 3. Validate citations
  const validated = validateAndExtractCitations(synthesizedAnswer, retrieved, lang);

  return {
    answer: validated.sanitizedAnswer,
    verified: validated.valid,
    citations: validated.citations,
    retrievedChunks: retrieved,
    confidence: Math.min(0.95, retrieved[0].similarityScore),
    language: lang,
  };
}
