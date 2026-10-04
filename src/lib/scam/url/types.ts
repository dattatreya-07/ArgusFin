export type UrlExtractionProvenance =
  | 'DIRECT_TEXT'
  | 'MARKDOWN'
  | 'HTML'
  | 'OCR'
  | 'EMAIL'
  | 'CHAT'
  | 'TELEGRAM'
  | 'WHATSAPP'
  | 'AUDIO_TRANSCRIPT'
  | 'OTHER';

export type UrlAnalysisStatus = 'AVAILABLE' | 'DEGRADED' | 'UNAVAILABLE' | 'BLOCKED_SSRF';
export type RdapStatus = 'VERIFIED' | 'UNAVAILABLE' | 'NOT_CHECKED';
export type RedirectStatus = 'CHECKED' | 'NOT_CHECKED' | 'BLOCKED_SSRF';

export interface UrlIndicators {
  isIpHost: boolean;
  isIdn: boolean;
  isPunycode: boolean;
  hasConfusableChars: boolean;
  hasMixedScript: boolean;
  isShortener: boolean;
  hasUserinfo: boolean;
  excessiveSubdomains: boolean;
  unknownReferenceDomain: boolean;
  ssrfBlocked: boolean;
}

export interface SingleUrlEvidence {
  id: string;
  originalUrl: string;
  normalizedUrl: string;
  scheme: string;
  hostname: string;
  registrableDomain: string;
  subdomain: string;
  port?: string;
  path: string;
  hasQuery: boolean;
  hasFragment: boolean;
  hasUserinfo: boolean;
  indicators: UrlIndicators;
  provenance: UrlExtractionProvenance;
  untrustedExtraction: boolean;
  explanationSignals: string[];
  rdapStatus: RdapStatus;
  redirectStatus: RedirectStatus;
  status: UrlAnalysisStatus;
}

export interface UrlAnalysisResult {
  urlCount: number;
  urls: SingleUrlEvidence[];
  aggregateSignals: string[];
  ssrfBlockedCount: number;
  status: UrlAnalysisStatus;
}
