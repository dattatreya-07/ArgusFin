import { Lang } from '../types';
import { TrustTier, NumericClaimPolicy } from './sources';

export interface CorpusDoc {
  id: string;
  sourceId?: string;
  title: string;
  publisher: string;
  sourceUrl: string;
  publishedAt?: string;
  verifiedAt: string;
  language: Lang;
  content: string;
  trustTier?: TrustTier;
  topic?: string;
}

export interface CorpusChunk {
  id: string;
  docId: string;
  sourceId?: string;
  title: string;
  publisher: string;
  sourceUrl: string;
  publishedAt?: string;
  verifiedAt: string;
  language: Lang;
  text: string;
  trustTier?: TrustTier;
  topic?: string;
}

export interface RetrievedChunk extends CorpusChunk {
  similarityScore: number;
}

export interface CitationReference {
  chunkId: string;
  docId: string;
  sourceId?: string;
  title: string;
  publisher: string;
  sourceUrl: string;
  verifiedAt: string;
  trustTier?: TrustTier;
}

export type Citation = CitationReference;

export type RetrievalStatus = 'FOUND' | 'NO_SOURCE' | 'INSUFFICIENT_SOURCE' | 'SOURCE_CONFLICT' | 'UNAVAILABLE';
export type GroundedState = 'GROUNDED' | 'PARTIALLY_GROUNDED' | 'NO_SOURCE' | 'SOURCE_CONFLICT' | 'ERROR';

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
  groundedState?: GroundedState;
}

export type AskStatus = 'ANSWERED' | 'NO_SOURCE' | 'SOURCE_CONFLICT' | 'UNAVAILABLE' | 'INVALID_REQUEST';

export interface RagResponse {
  status: AskStatus;
  groundedState: GroundedState;
  answer: string;
  verified: boolean;
  citations: CitationReference[];
  retrievedChunks: RetrievedChunk[];
  confidence: number;
  language: Lang;
  uncertainty?: string;
}
