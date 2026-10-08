import { Archetype, Lang, RiskBand } from '@/lib/types';
import { CanonicalSource } from '@/lib/scam/types';

export type IntegrationChannel = 'TELEGRAM' | 'WHATSAPP';

export interface N8nMediaItem {
  type?: 'image' | 'audio' | 'document';
  mimeType?: string;
  data?: string; // Base64 data string
  filename?: string;
}

export interface N8nMessagePayload {
  id: string;
  text?: string;
  caption?: string;
  media?: N8nMediaItem[];
}

export interface N8nIntegrationRequest {
  channel: IntegrationChannel | 'telegram' | 'whatsapp';
  message: N8nMessagePayload;
  locale?: Lang | string;
  provenance?: {
    senderId?: string;
    timestamp?: string;
    channelId?: string;
  };
}

export type IntegrationErrorCode =
  | 'UNAUTHORIZED'
  | 'N8N_AUTH_FAILED'
  | 'INVALID_REQUEST'
  | 'N8N_BAD_REQUEST'
  | 'UNSUPPORTED_CHANNEL'
  | 'OVERSIZED_INPUT'
  | 'UNSUPPORTED_MEDIA'
  | 'RATE_LIMITED'
  | 'ANALYSIS_FAILURE'
  | 'SANGYAN_UNAVAILABLE'
  | 'SANGYAN_TIMEOUT'
  | 'SANGYAN_INTERNAL_ERROR'
  | 'CONFIGURATION_ERROR'
  | 'TELEGRAM_SEND_FAILED'
  | 'INVALID_RESPONSE'
  | 'INTERNAL_ERROR';

export interface IntegrationErrorResponse {
  status: 'ERROR';
  errorCode: IntegrationErrorCode;
  message: string;
  error: {
    code: IntegrationErrorCode;
    message: string;
    requestId: string;
  };
}

export interface N8nIntegrationResponse {
  status: 'SUCCESS';
  decision: {
    band: RiskBand;
    archetype: {
      top: Archetype;
      prob: number;
    };
    confidence: number;
  };
  summary: string;
  signals: string[];
  unverified?: string[];
  nextSteps?: any[];
  citations?: any[];
  locale?: Lang;
  formattedMessage: string;
  requestId: string;
  timestamp?: string;
  provenance?: {
    channel: IntegrationChannel;
    messageId: string;
    timestamp: string;
  };
}
