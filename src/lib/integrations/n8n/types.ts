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
  | 'INVALID_REQUEST'
  | 'UNSUPPORTED_CHANNEL'
  | 'OVERSIZED_INPUT'
  | 'UNSUPPORTED_MEDIA'
  | 'RATE_LIMITED'
  | 'ANALYSIS_FAILURE'
  | 'INTERNAL_ERROR';

export interface IntegrationErrorResponse {
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
  unverified: string[];
  nextSteps: Array<{ id: string; label: string; url: string }>;
  citations: Array<{ title: string; sourceUrl: string; publisher?: string }>;
  formattedMessage: string;
  locale: Lang;
  requestId: string;
  timestamp: string;
}
