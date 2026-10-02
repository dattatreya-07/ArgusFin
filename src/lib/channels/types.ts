import { Lang, RiskBand, Archetype } from '../types';
import { RuleResult } from '../rules';
import { Signal, DomainSignals, ExtractedSignalSet } from '../signals/types';

export type ChannelType = 'web' | 'pwa-share' | 'telegram' | 'whatsapp';

export interface ChannelInput {
  channel: ChannelType;
  text?: string;
  title?: string;
  url?: string;
  language?: string;
  senderId?: string; // Hashed or ephemeral identifier; never raw phone/PII
  metadata?: Record<string, string | number | boolean>;
}

export interface NormalizedChannelMessage {
  channel: ChannelType;
  rawText: string;
  normalizedText: string;
  title?: string;
  urls: string[];
  language: Lang;
  isForwarded: boolean;
  provenance: {
    source: ChannelType;
    receivedAt: string;
  };
}

export interface ChannelCheckResult {
  band: RiskBand;
  archetype: {
    top: Archetype;
    prob: number;
  };
  confidence: number;
  flags: RuleResult[];
  signals: Signal[];
  domainSignals?: DomainSignals[];
  alertMatches?: ExtractedSignalSet['alertMatches'];
  unverified: string[];
  explanation: string;
  engine: string;
  calcUrl?: string;
  language: Lang;
  durationMs: number;
}

export interface ChannelResponseAction {
  label: string;
  url: string;
  isExternal?: boolean;
}

export interface ChannelResponse {
  summaryText: string;
  formattedMarkdown: string;
  riskBand: RiskBand;
  topSignals: string[];
  unverifiedAspects: string[];
  primaryAction?: ChannelResponseAction;
  calculatorAction?: ChannelResponseAction;
  disclaimer: string;
}

export interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from?: {
      id: number;
      is_bot: boolean;
      first_name?: string;
      username?: string;
      language_code?: string;
    };
    chat: {
      id: number;
      type: 'private' | 'group' | 'supergroup' | 'channel';
      title?: string;
      username?: string;
    };
    date: number;
    text?: string;
    caption?: string;
    forward_from?: {
      id: number;
      first_name?: string;
      username?: string;
    };
    forward_from_chat?: {
      id: number;
      title?: string;
      type: string;
    };
    forward_date?: number;
    entities?: Array<{
      type: string;
      offset: number;
      length: number;
      url?: string;
    }>;
  };
}
