import { Lang } from '../types';

export interface CorpusDoc {
  id: string;
  title: string;
  publisher: string;
  sourceUrl: string;
  publishedAt?: string;
  verifiedAt: string;
  language: Lang;
  content: string;
}

export interface CorpusChunk {
  id: string;
  docId: string;
  title: string;
  publisher: string;
  sourceUrl: string;
  publishedAt?: string;
  verifiedAt: string;
  language: Lang;
  text: string;
}

export interface RetrievedChunk extends CorpusChunk {
  similarityScore: number;
}

export interface Citation {
  chunkId: string;
  title: string;
  publisher: string;
  sourceUrl: string;
  verifiedAt: string;
}

export interface RagResponse {
  answer: string;
  verified: boolean;
  citations: Citation[];
  retrievedChunks: RetrievedChunk[];
  confidence: number;
  language: Lang;
}
