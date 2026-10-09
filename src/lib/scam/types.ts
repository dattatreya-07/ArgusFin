import { Archetype, ExtractedClaims, Lang, RiskBand, Signal } from '@/lib/types';
import { RuleResult } from '@/lib/rules';
import { SemanticEvidence } from '@/lib/semantic/types';

export type CanonicalSource =
  | 'WEB_TEXT'
  | 'CHAT'
  | 'URL'
  | 'IMAGE'
  | 'OCR'
  | 'AUDIO_TRANSCRIPT'
  | 'EMAIL'
  | 'TELEGRAM'
  | 'WHATSAPP';

export type PrivacyStatus = 'RAW_UNSAFE' | 'MASKED' | 'NO_SENSITIVE_DATA_DETECTED';

export interface AttachmentItem {
  type: 'image' | 'audio' | 'document' | 'url';
  url?: string;
  content?: string;
  mimeType?: string;
}

export interface CanonicalInput {
  source: CanonicalSource;
  language?: Lang;
  text?: string;
  urls?: string[];
  attachments?: AttachmentItem[];
  metadata?: Record<string, any>;
  provenance?: {
    timestamp?: string;
    senderId?: string;
    channelId?: string;
  };
  privacyStatus?: PrivacyStatus;
}

export type AnalysisStatusType = 'DECISION_AVAILABLE' | 'DECISION_DEGRADED' | 'DECISION_UNAVAILABLE';
export type RagStatus = 'RAG_FOUND' | 'RAG_NO_SOURCE' | 'RAG_UNAVAILABLE' | 'RAG_NOT_REQUIRED';
export type LlmStatus = 'LLM_EXPLANATION_AVAILABLE' | 'LLM_EXPLANATION_UNAVAILABLE';

export interface GroundedExplanation {
  summary: string;
  redFlags: string[];
  whatCouldNotBeVerified: string[];
  citations: Array<{ title: string; sourceUrl: string; publisher?: string }>;
  nextSteps: Array<{ id: string; label: string; url: string }>;
}

export interface AnalysisStatuses {
  decision: AnalysisStatusType;
  rag: RagStatus;
  llm: LlmStatus;
  hybrid?: 'SUCCESS' | 'FALLBACK_DETERMINISTIC' | 'REJECTED_CONTRADICTION' | 'TIMEOUT';
}

export interface AnalysisResult {
  decision: {
    band: RiskBand;
    archetype: {
      top: Archetype;
      prob: number;
    };
    confidence: number;
    engine: string;
  };
  extractedClaims: ExtractedClaims;
  signals: Signal[];
  flags: RuleResult[];
  explanation: GroundedExplanation;
  statuses: AnalysisStatuses;
  provenance: {
    source: CanonicalSource;
    maskedTextLength: number;
    timestamp: string;
  };
  limitations: string[];
  urlAnalysis?: any;
  openWorldAnalysis?: any;
  semanticEvidence?: SemanticEvidence;
  structuredExplanation?: import('./explanation').RiskAnalysisExplanation;
  hybridReasoning?: import('@/lib/ai/hybridReasoning').ValidatedHybridReasoningResult;
  advancedIntelligence?: import('./advancedIntelligence').StructuredClassification;
}

