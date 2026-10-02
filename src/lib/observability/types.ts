export type ErrorCategory =
  | 'VALIDATION_ERROR'
  | 'PRIVACY_BLOCKED'
  | 'RATE_LIMITED'
  | 'PROVIDER_UNAVAILABLE'
  | 'PROVIDER_TIMEOUT'
  | 'RETRIEVAL_NO_SOURCE'
  | 'RETRIEVAL_FAILURE'
  | 'LLM_FAILURE'
  | 'OCR_FAILURE'
  | 'STT_FAILURE'
  | 'EXPORT_FAILURE'
  | 'INTERNAL_ERROR';

export interface AppEvent {
  name: string;
  requestId: string;
  timestamp: string;
  durationMs?: number;
  status: 'success' | 'failure' | 'unavailable';
  language?: 'en' | 'hi' | 'ta';
  subsystem: string;
  errorCode?: ErrorCategory;
  metadata?: Record<string, string | number | boolean>;
}
