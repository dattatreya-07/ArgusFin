import { Archetype, Lang, RiskBand, Signal } from '@/lib/types';
import { RuleResult } from '@/lib/rules';
import { CanonicalInput } from '@/lib/scam/types';

export type ChannelType = 'web' | 'telegram' | 'whatsapp' | 'email' | 'pwa-share';

export interface ChannelInput {
  channel: ChannelType;
  text?: string;
  title?: string;
  url?: string;
  language?: string;
  senderId?: string;
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
    source: string;
    receivedAt: string;
  };
  privacyMasked?: boolean;
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
  domainSignals: any[];
  alertMatches: any[];
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
}

export interface ChannelResponse {
  summaryText: string;
  formattedMarkdown: string;
  riskBand: RiskBand;
  topSignals: string[];
  unverifiedAspects: string[];
  primaryAction: ChannelResponseAction;
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
      first_name: string;
      language_code?: string;
    };
    chat: {
      id: number;
      type: string;
      title?: string;
    };
    date: number;
    text?: string;
    caption?: string;
    photo?: Array<{
      file_id: string;
      file_unique_id: string;
      file_size?: number;
      width: number;
      height: number;
    }>;
  };
}

export interface ChannelAdapter<TInput = any> {
  readonly name: string;
  validate(rawInput: TInput): boolean;
  toCanonicalInput(rawInput: TInput): CanonicalInput;
}
