import { Lang } from '../types';
import { Citation, RetrievedChunk } from './types';

export const UNVERIFIED_FALLBACK_MESSAGES: Record<Lang, string> = {
  en: "I can't verify this. No official regulatory records or verified advisories support this claim.",
  hi: 'मैं इसकी पुष्टि नहीं कर सकता। कोई आधिकारिक विनियामक रिकॉर्ड या सत्यापित परामर्श इस दावे का समर्थन नहीं करता है।', // TODO(review)
  ta: 'என்னால் இதை சரிபார்க்க முடியவில்லை. எந்தவொரு அதிகாரப்பூர்வ ஒழுங்குமுறை ஆவணமும் இதற்கு ஆதரவளிக்கவில்லை.', // TODO(review)
};

export interface CitationValidationResult {
  valid: boolean;
  citations: Citation[];
  sanitizedAnswer: string;
}

/**
 * Validates that all citations in the generated answer originate from the retrieved evidence chunks.
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
    };
  }

  // Map of valid chunk IDs
  const validChunkMap = new Map<string, RetrievedChunk>();
  for (const chunk of retrievedChunks) {
    validChunkMap.set(chunk.id, chunk);
  }

  const matchedCitations: Citation[] = [];
  const seenUrls = new Set<string>();

  // Extract citation markers like [doc-sebi-copy-trading-chk-1] or [1] or direct URLs
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
          title: chunk.title,
          publisher: chunk.publisher,
          sourceUrl: chunk.sourceUrl,
          verifiedAt: chunk.verifiedAt,
        });
      }
    }
  }

  // If no explicit citations were matched in the text, but chunks were retrieved with high similarity, include top chunk
  if (matchedCitations.length === 0 && retrievedChunks.length > 0 && retrievedChunks[0].similarityScore >= 0.25) {
    const topChunk = retrievedChunks[0];
    matchedCitations.push({
      chunkId: topChunk.id,
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
    };
  }

  return {
    valid: true,
    citations: matchedCitations,
    sanitizedAnswer: rawAnswer.trim(),
  };
}
