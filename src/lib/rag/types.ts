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

export interface CitationReference {
  chunkId: string;
  docId: string;
  title: string;
  publisher: string;
  sourceUrl: string;
  verifiedAt: string;
}

export type Citation = CitationReference;

export type RetrievalStatus = 'FOUND' | 'NO_SOURCE' | 'UNAVAILABLE';

export interface EvidencePack {
  query: string;
  language: Lang;
  retrieved: RetrievedChunk[];
  status: RetrievalStatus;
  reason?: string;
}

export interface GeneratedAnswer {
  answer: string;
  citations: CitationReference[];
  uncertainty?: string;
}

export type AskStatus = 'ANSWERED' | 'NO_SOURCE' | 'UNAVAILABLE' | 'INVALID_REQUEST';

export interface RagResponse {
  status: AskStatus;
  answer: string;
  verified: boolean;
  citations: CitationReference[];
  retrievedChunks: RetrievedChunk[];
  confidence: number;
  language: Lang;
  uncertainty?: string;
}
