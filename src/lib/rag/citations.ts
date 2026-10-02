import { Lang } from '../types';
import { CitationReference, RetrievedChunk } from './types';

export const UNVERIFIED_FALLBACK_MESSAGES: Record<Lang, string> = {
  en: "I can't verify this. No official regulatory records or verified advisories support this claim.",
  hi: 'मैं इसकी पुष्टि नहीं कर सकता। कोई आधिकारिक विनियामक रिकॉर्ड या सत्यापित परामर्श इस दावे का समर्थन नहीं करता है।', // TODO(review)
  ta: 'என்னால் இதை சரிபார்க்க முடியவில்லை. எந்தவொரு அதிகாரப்பூர்வ ஒழுங்குமுறை ஆவணமும் இதற்கு ஆதரவளிக்கவில்லை.', // TODO(review)
};

export interface CitationValidationResult {
  valid: boolean;
  citations: CitationReference[];
  sanitizedAnswer: string;
  numericGrounded: boolean;
}

/**
 * Checks that all substantive numeric claims in the answer exist in the retrieved evidence chunks.
 */
export function verifyNumericGrounding(answer: string, retrievedChunks: RetrievedChunk[]): boolean {
  if (!answer || retrievedChunks.length === 0) return false;

  // Extract numeric tokens: e.g. "1930", "100%", "10%", "2", "4"
  const numbersInAnswer = answer.match(/\b\d+(?:\.\d+)?%?\b/g) || [];
  if (numbersInAnswer.length === 0) return true;

  const combinedEvidenceText = retrievedChunks.map((c) => `${c.title} ${c.text} ${c.sourceUrl}`).join(' ');

  for (const num of numbersInAnswer) {
    // Ignore markdown numbering like 1., 2., 3. or single-digit list indexes
    if (/^[1-9]$/.test(num)) continue;

    if (!combinedEvidenceText.includes(num)) {
      // Substantive number is not grounded in retrieved evidence
      return false;
    }
  }

  return true;
}

/**
 * Validates that all citations and numeric facts in the generated answer originate strictly from retrieved chunks.
 */
export function validateAndExtractCitations(
  rawAnswer: string,
  retrievedChunks: RetrievedChunk[],
  lang: Lang
): CitationValidationResult {
  if (!rawAnswer || retrievedChunks.length === 0) {
    return {
      valid: false,
      citations: [],
      sanitizedAnswer: UNVERIFIED_FALLBACK_MESSAGES[lang] || UNVERIFIED_FALLBACK_MESSAGES.en,
      numericGrounded: false,
    };
  }

  // Verify numeric grounding
  const numericGrounded = verifyNumericGrounding(rawAnswer, retrievedChunks);
  if (!numericGrounded) {
    return {
      valid: false,
      citations: [],
      sanitizedAnswer: UNVERIFIED_FALLBACK_MESSAGES[lang] || UNVERIFIED_FALLBACK_MESSAGES.en,
      numericGrounded: false,
    };
  }

  const matchedCitations: CitationReference[] = [];
  const seenUrls = new Set<string>();

  // Extract citation markers matching retrieved chunks
  for (const chunk of retrievedChunks) {
    if (
      rawAnswer.includes(`[${chunk.id}]`) ||
      rawAnswer.toLowerCase().includes(chunk.title.toLowerCase()) ||
      rawAnswer.includes(chunk.sourceUrl) ||
      rawAnswer.toLowerCase().includes(chunk.publisher.toLowerCase())
    ) {
      if (!seenUrls.has(chunk.sourceUrl)) {
        seenUrls.add(chunk.sourceUrl);
        matchedCitations.push({
          chunkId: chunk.id,
          docId: chunk.docId,
          title: chunk.title,
          publisher: chunk.publisher,
          sourceUrl: chunk.sourceUrl,
          verifiedAt: chunk.verifiedAt,
        });
      }
    }
  }

  // If no explicit citations were matched, but top chunk has strong relevance (similarity >= 0.25)
  if (matchedCitations.length === 0 && retrievedChunks.length > 0 && retrievedChunks[0].similarityScore >= 0.25) {
    const topChunk = retrievedChunks[0];
    matchedCitations.push({
      chunkId: topChunk.id,
      docId: topChunk.docId,
      title: topChunk.title,
      publisher: topChunk.publisher,
      sourceUrl: topChunk.sourceUrl,
      verifiedAt: topChunk.verifiedAt,
    });
  }

  if (matchedCitations.length === 0) {
    return {
      valid: false,
      citations: [],
      sanitizedAnswer: UNVERIFIED_FALLBACK_MESSAGES[lang] || UNVERIFIED_FALLBACK_MESSAGES.en,
      numericGrounded: false,
    };
  }

  return {
    valid: true,
    citations: matchedCitations,
    sanitizedAnswer: rawAnswer.trim(),
    numericGrounded: true,
  };
}
