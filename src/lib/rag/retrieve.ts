import { Lang } from '../types';
import { ALL_CORPUS_CHUNKS } from './corpus';
import { tokenizeText, computeTermFrequencyVector, cosineSimilarity } from './embed';
import { RetrievedChunk } from './types';

// Cross-lingual concept mappings (e.g. 1930 / cybercrime / sebi / copy trading)
const CONCEPT_MAPPINGS: Record<string, string[]> = {
  '1930': ['helpline', 'cybercrime', 'golden', 'hour', 'fraud', 'कॉल', 'हेल्पलाइन', 'உதவி', 'எண்'],
  'cybercrime': ['cybercrime', '1930', 'freeze', 'report', 'शिकायत', 'புகார்', 'साइबर', 'சைபர்'],
  'cyber': ['cybercrime', '1930', 'साइबर', 'சைபர்', 'freeze'],
  'साइबर': ['cybercrime', '1930', 'cyber', 'धोखाधड़ी', 'शिकायत', 'fraud'],
  'फ्रॉड': ['fraud', 'scam', 'धोखाधड़ी', 'cybercrime', '1930'],
  'சைபர்': ['cybercrime', '1930', 'fraud', 'புகார்', 'cyber'],
  'மோசடி': ['fraud', 'scam', 'cybercrime', '1930', 'புகார்'],
  'sebi': ['sebi', 'advisory', 'registered', 'scores', 'पंजीकृत', 'செபி', 'பதிவு'],
  'copy': ['copy', 'algo', 'automated', 'bot', 'mirror', 'कॉपी', 'காப்பி'],
  'ipo': ['ipo', 'fii', 'allotment', 'quota', 'अलॉटमेंट', 'ஒதுக்கீடு', 'asba'],
  'rbi': ['rbi', 'sachet', 'deposit', 'unregulated', 'buds', 'जमा', 'வங்கி'],
  'chakshu': ['chakshu', 'telecom', 'sms', 'whatsapp', 'dot', 'sanchar'],
  'complaint': ['complaint', 'report', 'cybercrime', '1930', 'scores', 'शिकायत', 'புகார்'],
  'fraud': ['fraud', 'scam', 'loss', 'धोखाधड़ी', 'மோசடி', '1930'],
  'nav': ['mutual', 'fund', 'units', 'asset', 'expense', 'ratio', 'म्यूचुअल', 'फंड'],
  'sip': ['systematic', 'mutual', 'fund', 'monthly', 'contribution', 'rupee', 'averaging'],
  'cagr': ['compound', 'annual', 'growth', 'rate', 'return', 'yield', 'सीएजीआर'],
  'bond': ['fixed', 'income', 'coupon', 'yield', 'price', 'maturity', 'g-sec', 'debenture', 'बॉन्ड'],
  'debt': ['fixed', 'income', 'bond', 'corporate', 'credit', 'interest', 'rate'],
  'equity': ['share', 'stock', 'market', 'capitalization', 'dividend', 'sebi', 'शेयर'],
  'share': ['equity', 'stock', 'dividend', 'demat', 'nsdl', 'cdsl', 'nse', 'bse'],
  'dividend': ['share', 'equity', 'payout', 'capital', 'gains', 'company'],
  'futures': ['derivatives', 'options', 'f&o', 'expiry', 'margin', 'leverage', 'strike'],
  'options': ['futures', 'call', 'put', 'premium', 'strike', 'expiry', 'derivatives', 'margin'],
  'margin': ['leverage', 'futures', 'options', 'derivatives', 'initial', 'balance'],
  'leverage': ['margin', 'loss', 'futures', 'options', 'risk', 'amplifies'],
  'crypto': ['virtual', 'digital', 'vda', 'blockchain', 'wallet', 'staking', 'counterparty'],
  'wallet': ['crypto', 'private', 'key', 'blockchain', 'custody', 'transfer'],
  'staking': ['crypto', 'yield', 'mining', 'ponzi', 'unregulated', 'unrealistic'],
  'settlement': ['t+1', 'broker', 'depository', 'nsdl', 'cdsl', 'clearing'],
};

/**
 * Retrieves the most relevant evidence chunks from the verified corpus.
 */
export function retrieveEvidence(
  query: string,
  lang: Lang,
  topK = 5,
  minSimilarity = 0.12
): RetrievedChunk[] {
  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    return [];
  }

  // 1. Build a local vocabulary from query and corpus chunks
  const queryTokens = tokenizeText(query);
  if (queryTokens.length === 0) return [];

  // Expand query with cross-lingual synonyms
  const expandedTokens = new Set<string>(queryTokens);
  for (const token of queryTokens) {
    for (const [key, synonyms] of Object.entries(CONCEPT_MAPPINGS)) {
      if (token.includes(key) || key.includes(token)) {
        synonyms.forEach((s) => expandedTokens.add(s));
      }
    }
  }

  // Collect all unique tokens across corpus + query
  const vocabSet = new Set<string>(expandedTokens);
  for (const chunk of ALL_CORPUS_CHUNKS) {
    const chunkTokens = tokenizeText(chunk.text + ' ' + chunk.title);
    chunkTokens.forEach((t) => vocabSet.add(t));
  }
  const vocabulary = Array.from(vocabSet);

  // 2. Compute query vector
  const queryVector = computeTermFrequencyVector(Array.from(expandedTokens).join(' '), vocabulary);

  // 3. Score every chunk
  const scoredChunks: RetrievedChunk[] = [];

  for (const chunk of ALL_CORPUS_CHUNKS) {
    const chunkVector = computeTermFrequencyVector(chunk.title + ' ' + chunk.text, vocabulary);
    let similarity = cosineSimilarity(queryVector, chunkVector);

    // Boost chunks that match the user's preferred language or specific direct keywords
    if (chunk.language === lang) {
      similarity *= 1.25;
    }

    // Direct token overlap boost
    let overlapCount = 0;
    const lowerChunkText = (chunk.title + ' ' + chunk.text).toLowerCase();
    for (const token of queryTokens) {
      if (lowerChunkText.includes(token.toLowerCase())) {
        overlapCount++;
      }
    }
    if (overlapCount > 0) {
      similarity += overlapCount * 0.08;
    }

    if (similarity >= minSimilarity) {
      scoredChunks.push({
        ...chunk,
        similarityScore: parseFloat(similarity.toFixed(4)),
      });
    }
  }

  // 4. Sort descending by similarity score
  scoredChunks.sort((a, b) => b.similarityScore - a.similarityScore);

  return scoredChunks.slice(0, topK);
}
