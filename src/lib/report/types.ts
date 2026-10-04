import { AuthorityRouteResult } from '@/lib/authorities/types';

export interface EvidenceProvenanceItem {
  evidenceId: string;
  type: 'text' | 'ocr_image' | 'url' | 'user_input' | 'n8n_payload';
  sourceChannel: 'website' | 'telegram' | 'whatsapp';
  captureTimestamp: string;
  contentHash: string; // SHA-256 hash of masked content
  ocrConfidence?: number;
  urlProvenance?: string;
  extractionProvenance: 'USER_INPUT' | 'OCR_PARSER' | 'DETERMINISTIC_PARSER' | 'N8N_ADAPTER';
  maskingState: 'PII_MASKED' | 'UNMASKED_EXPORT';
  originalVsNormalized: {
    originalTextSnippet: string; // PII-masked original snippet
    normalizedText: string;
  };
}

export interface ObservedUrlItem {
  domain: string;
  fullUrl: string;
  source: 'EVIDENCE_OBSERVED';
}

export interface ObservedPaymentItem {
  handleOrAccount: string;
  paymentMethod?: string;
  amount?: number;
  utrNumber?: string;
}

export interface CanonicalReportPacket {
  reportVersion: '1.0';
  generatedAt: string; // ISO 8601 timestamp
  locale: 'en' | 'hi' | 'ta';
  jurisdiction: 'IN' | 'UNKNOWN' | string;
  incidentType: string;
  
  // Explicit Distinction of Content Sections
  analysisSummary: string;
  observedFacts: string[];
  observedClaims: string[];
  observedRequests: string[];
  urls: ObservedUrlItem[];
  paymentDetails: ObservedPaymentItem[];
  senderMetadata: {
    platform?: string;
    senderHandle?: string;
    maskedSenderId?: string;
  };
  timestamps: {
    incidentDate?: string;
    reportGenerated: string;
  };
  evidence: EvidenceProvenanceItem[];
  sangyanAnalysis: {
    riskBand: string;
    confidence: number;
    detectedSignals: string[];
    riskExplanation: string;
  };
  userStatements: string[];
  unverifiedClaims: string[];
  uncertainty: string[];
  citations: Array<{
    sourceId: string;
    title: string;
    url: string | null;
  }>;
  authorityRoutes: AuthorityRouteResult;
  submissionNotice: string; // "Prepared for your review — not automatically submitted."
  exportIntegrityHash: string; // SHA-256 hash of canonical report payload
}

export interface PrepareReportInput {
  locale?: 'en' | 'hi' | 'ta';
  jurisdiction?: 'IN' | 'UNKNOWN' | string;
  sourceChannel?: 'website' | 'telegram' | 'whatsapp';
  rawUserInput?: string;
  incidentDate?: string;
  platform?: string;
  claimedEntityOrAdvisor?: string;
  websiteOrDomain?: string;
  totalClaimedLoss?: number;
  transactions?: Array<{
    utrNumber?: string;
    amount: number;
    beneficiaryAccountOrUpi?: string;
    date?: string;
    paymentMethod?: string;
  }>;
  narrative?: string;
  credentialsShared?: boolean;
  otpShared?: boolean;
  remoteAccessGranted?: boolean;
  analysisResult?: {
    riskBand: string;
    confidence: number;
    signals: string[];
    explanation?: string;
    citations?: Array<{ sourceId: string; title: string; url: string | null }>;
  };
}
