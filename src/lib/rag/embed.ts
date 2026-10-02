import { CorpusChunk } from './types';

export interface EmbeddingProvider {
  embedQuery: (text: string) => Promise<number[]>;
  embedChunks: (chunks: CorpusChunk[]) => Promise<Map<string, number[]>>;
}

/**
 * Normalizes and tokenizes text supporting English, Hindi, and Tamil words in canonical NFC form.
 */
export function tokenizeText(text: string): string[] {
  if (!text) return [];
  const normalized = text.toLowerCase().normalize('NFC');
  
  // Extract words containing alphabetic, numeric, or Indic characters
  const rawTokens = normalized.match(/([^\s,.!?।:;"'()\[\]{}।/\\<>—–+-]+)/g) || [];
  
  // Stop words across English, Hindi, Tamil
  const stopWords = new Set([
    'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'in', 'to', 'of', 'for', 'with', 'by', 'as', 'it', 'from', 'what', 'will', 'be',
    'hai', 'ki', 'ke', 'ka', 'ko', 'me', 'mein', 'se', 'par', 'aur', 'ya', 'यह', 'है', 'की', 'के', 'का', 'को', 'में', 'से', 'पर', 'और', 'या', 'क्या', 'द्वारा',
    'idhu', 'oru', 'matrum', 'aanal', 'இது', 'ஒரு', 'மற்றும்', 'ஆனால்', 'இல்', 'க்கு', 'ஆக', 'என்பது'
  ]);

  return rawTokens
    .map((t) => t.trim())
    .filter((t) => t.length > 1 && !stopWords.has(t));
}

/**
 * Computes BM25/TF-IDF term vector for a string against a vocabulary.
 */
export function computeTermFrequencyVector(text: string, vocab: string[]): number[] {
  const tokens = tokenizeText(text);
  const counts = new Map<string, number>();
  for (const t of tokens) {
    counts.set(t, (counts.get(t) || 0) + 1);
  }

  const vec = new Array(vocab.length).fill(0);
  for (let i = 0; i < vocab.length; i++) {
    const word = vocab[i];
    if (counts.has(word)) {
      const tf = counts.get(word)! / (tokens.length || 1);
      vec[i] = tf;
    }
  }
  return vec;
}

/**
 * Computes cosine similarity between two numeric vectors.
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length || vecA.length === 0) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
