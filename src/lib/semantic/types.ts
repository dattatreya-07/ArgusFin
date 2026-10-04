/**
 * Canonical Semantic Evidence Model for SANGYAN / FinanceX
 * Represents structured semantic understanding extracted from arbitrary natural language.
 */

export type SemanticIntent =
  | 'CONTENT_ANALYSIS'
  | 'EDUCATIONAL_QA'
  | 'CALCULATOR_NUMERIC'
  | 'REPORTING'
  | 'AUTHORITY_LOOKUP'
  | 'UNSUPPORTED';

export type FinancialContext =
  | 'STOCKS_EQUITY'
  | 'MUTUAL_FUNDS'
  | 'CRYPTO'
  | 'FUTURES_OPTIONS'
  | 'COMMODITIES'
  | 'BONDS'
  | 'IPO_ALLOTMENT'
  | 'COPY_TRADING'
  | 'TRADING_PLATFORM'
  | 'DEPOSIT_SCHEME'
  | 'UNKNOWN_FINANCIAL_MECHANISM'
  | 'NONE';

export type ClaimType =
  | 'RETURN_OR_PROFIT'
  | 'GUARANTEED_RETURN'
  | 'PASSIVE_INCOME'
  | 'DOUBLING_MULTIPLICATION'
  | 'LOW_RISK_HIGH_RETURN'
  | 'INVESTMENT_OPPORTUNITY'
  | 'WITHDRAWAL_CLAIM'
  | 'REGISTRATION_CLAIM'
  | 'AUTHORITY_CLAIM'
  | 'OTHER';

export type EvidenceProvenance = 'USER_TEXT' | 'OCR' | 'URL' | 'AUDIO_TRANSCRIPT' | 'OTHER';

export interface SemanticClaim {
  type: ClaimType;
  text: string;
  numericValue?: {
    amount?: number;
    currency?: string;
    percentage?: number;
    period?: string;
  };
  provenance: EvidenceProvenance;
}

export type RequestType =
  | 'SEND_MONEY'
  | 'JOIN_GROUP'
  | 'DOWNLOAD_APPLICATION'
  | 'INSTALL_APK'
  | 'SHARE_OTP'
  | 'SHARE_PASSWORD'
  | 'SHARE_BANK_DETAILS'
  | 'CONNECT_WALLET'
  | 'REMOTE_ACCESS'
  | 'PAY_FEE_OR_TAX'
  | 'RECRUIT_OTHERS'
  | 'CLICK_LINK';

export interface SemanticRequest {
  type: RequestType;
  target?: string;
  provenance: EvidenceProvenance;
}

export type SocialEngineeringTacticType =
  | 'URGENCY'
  | 'FEAR'
  | 'SECRECY'
  | 'EXCLUSIVITY'
  | 'SOCIAL_PROOF'
  | 'AUTHORITY_IMPERSONATION'
  | 'SCARCITY'
  | 'GUARANTEED_OUTCOME'
  | 'EMOTIONAL_PRESSURE'
  | 'CURIOSITY_HOOK'
  | 'SHAME_OR_COMPARISON';

export interface SocialEngineeringTactic {
  tactic: SocialEngineeringTacticType;
  evidence: string;
}

export type BehavioralMechanismType =
  | 'ADVANCE_FEE'
  | 'PERSONAL_ACCOUNT_PAYMENT'
  | 'WITHDRAWAL_BLOCKING'
  | 'FAKE_INVESTMENT_PORTAL'
  | 'FAKE_TRADING_APP'
  | 'COPY_TRADING'
  | 'CRYPTO_STAKING_MINING'
  | 'RECOVERY_SCAM'
  | 'TASK_OR_JOB_INVESTMENT'
  | 'IMPERSONATION'
  | 'ACCOUNT_TAKEOVER'
  | 'PHISHING'
  | 'MALICIOUS_DOWNLOAD'
  | 'MULE_PAYMENT'
  | 'GROUP_RECRUITMENT'
  | 'NOVEL_OR_UNKNOWN_SUSPICIOUS';

export interface BehavioralMechanism {
  type: BehavioralMechanismType;
  rationale: string;
}

export type KnowledgeRequirementType =
  | 'NONE'
  | 'AUTHORITATIVE_SOURCE_REQUIRED'
  | 'CURRENT_SOURCE_REQUIRED'
  | 'NUMERIC_SOURCE_REQUIRED'
  | 'AUTHORITY_LOOKUP_REQUIRED'
  | 'REGULATORY_SOURCE_REQUIRED';

export interface KnowledgeRequirement {
  type: KnowledgeRequirementType;
  topic?: string;
  reason: string;
}

export interface SemanticEvidence {
  intent: SemanticIntent;
  financialContext: FinancialContext;
  claims: SemanticClaim[];
  requests: SemanticRequest[];
  socialEngineering: SocialEngineeringTactic[];
  behavioralMechanisms: BehavioralMechanism[];
  knowledgeRequired: KnowledgeRequirement;
  summary: string;
  uncertainty: string[];
  provider: 'gemini-2.5-flash' | 'deterministic-fallback' | string;
  latencyMs?: number;
}

export interface SemanticInput {
  text?: string;
  sanitizedText?: string;
  source?: EvidenceProvenance;
  language?: string;
  lang?: string;
  extractedUrls?: string[];
  urls?: string[];
}
