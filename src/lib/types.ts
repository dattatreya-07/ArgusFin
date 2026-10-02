export type Lang = 'en' | 'hi' | 'ta';

export type Archetype =
  | 'DOUBLING_SCHEME'
  | 'COPY_TRADING'
  | 'COURSE_FINFLUENCER'
  | 'CRYPTO_STAKING_MINING'
  | 'FAKE_TRADING_APP_OR_PORTAL'
  | 'FAKE_ADVISORY_OR_REG_CLAIM'
  | 'PUMP_AND_DUMP_GROUP'
  | 'REMOTE_ACCESS_SCAM'
  | 'FAKE_IPO_OR_ALLOTMENT'
  | 'OTHER_OR_NONE';

export type RiskBand = 'HIGH' | 'MEDIUM' | 'LOW_SIGNALS' | 'CANNOT_VERIFY';

export interface ExtractedClaims {
  promisedReturns: { multiple?: number; durationDays?: number; guaranteed?: boolean }[];
  urgencyPhrases: string[];
  requests: ('OTP' | 'APP_INSTALL' | 'PAYMENT' | 'GROUP_JOIN' | 'PERSONAL_ACCOUNT')[];
  registrationClaims: string[];
  urls: string[];
  handles: string[];
}

export interface Signal {
  id: string;
  label: string;
  value: string;
  sourceUrl?: string;
  asOf?: string;
}

export interface DecisionInput {
  maskedText: string;
  claims: ExtractedClaims;
  signals: Signal[];
  lang: Lang;
}

export interface Decision {
  archetype: Record<Archetype, number>; // probabilities, sum ≈ 1
  riskBand: Record<RiskBand, number>; // probabilities, sum ≈ 1
  urgency: number; // 0..1
  confidence: number; // 0..1
  engine: 'jev' | 'llm-fallback' | 'rules-only';
}

export interface DecisionEngine {
  decide(input: DecisionInput): Promise<Decision>;
}

export type ApiErrorCode =
  | 'INVALID_INPUT'
  | 'RATE_LIMITED'
  | 'UNAVAILABLE'
  | 'PRIVACY_BLOCKED'
  | 'NOT_FOUND'
  | 'INTERNAL_ERROR';

export interface ApiError {
  code: ApiErrorCode;
  message: string;
  details?: any;
}

export interface InvestorProtectionSession {
  language: Lang;
  rawMaskedText?: string;
  claims?: ExtractedClaims;
  signals?: Signal[];
  decision?: Decision;
  incidentRecord?: any;
  consistencyResult?: any;
  routedAuthorities?: any;
  citations?: Array<{ title: string; sourceUrl: string; publisher?: string }>;
}
