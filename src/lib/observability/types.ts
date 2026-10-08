export type ErrorCategory =
  | 'UNAUTHORIZED'
  | 'N8N_AUTH_FAILED'
  | 'INVALID_REQUEST'
  | 'N8N_BAD_REQUEST'
  | 'UNSUPPORTED_CHANNEL'
  | 'OVERSIZED_INPUT'
  | 'UNSUPPORTED_MEDIA'
  | 'ANALYSIS_FAILURE'
  | 'VALIDATION_ERROR'
  | 'RATE_LIMITED'
  | 'UNAVAILABLE'
  | 'TIMEOUT'
  | 'SANGYAN_UNAVAILABLE'
  | 'SANGYAN_TIMEOUT'
  | 'SANGYAN_INTERNAL_ERROR'
  | 'UPSTREAM_ERROR'
  | 'CONFIGURATION_ERROR'
  | 'PRIVACY_BLOCKED'
  | 'RETRIEVAL_NO_SOURCE'
  | 'RETRIEVAL_UNAVAILABLE'
  | 'RETRIEVAL_FAILURE'
  | 'LLM_UNAVAILABLE'
  | 'LLM_FAILURE'
  | 'OCR_UNAVAILABLE'
  | 'OCR_FAILURE'
  | 'STT_UNAVAILABLE'
  | 'STT_FAILURE'
  | 'TELEGRAM_SEND_FAILED'
  | 'INVALID_RESPONSE'
  | 'PDF_GENERATION_ERROR'
  | 'EXPORT_FAILURE'
  | 'INTERNAL_ERROR';

export type AppEventName =
  | 'request_received'
  | 'request_completed'
  | 'request_failed'
  | 'validation_failure'
  | 'rate_limit_rejection'
  | 'llm_invocation'
  | 'llm_unavailable'
  | 'rag_retrieval'
  | 'rag_no_source'
  | 'rag_unavailable'
  | 'ocr_invocation'
  | 'ocr_unavailable'
  | 'stt_invocation'
  | 'stt_unavailable'
  | 'authority_routing'
  | 'report_generation'
  | 'pdf_generation'
  | 'evidence_processing'
  | 'deterministic_decision'
  | 'fallback_decision';

export interface AppEvent {
  name: AppEventName | string;
  requestId: string;
  timestamp: string;
  route?: string;
  durationMs?: number;
  status: 'success' | 'failure' | 'unavailable' | 'timeout';
  language?: 'en' | 'hi' | 'ta';
  subsystem: string;
  errorCode?: ErrorCategory;
  metadata?: Record<string, string | number | boolean | null>;
}
