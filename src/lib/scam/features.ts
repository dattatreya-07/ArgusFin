export type FeatureConfidence = number; // 0.0 to 1.0

export type EvidenceRole =
  | 'CLAIMED_BY_SENDER'
  | 'REQUESTED_FROM_USER'
  | 'DESCRIBED_BY_USER'
  | 'ASKED_AS_QUESTION'
  | 'EXPLAINED_AS_CONCEPT'
  | 'HYPOTHETICAL'
  | 'NEGATED'
  | 'QUOTED_EXAMPLE'
  | 'WARNING_ABOUT_SCAM';

export type SignalCategory =
  | 'CONCEPTUAL_SIGNAL'
  | 'BEHAVIORAL_SIGNAL'
  | 'DIRECT_REQUEST_SIGNAL'
  | 'USER_HARM_SIGNAL';

export interface FeatureProvenance {
  extractedFrom: 'DETERMINISTIC_REGEX' | 'SEMANTIC_EXTRACTOR' | 'LEXICON_MATCH' | 'URL_INTELLIGENCE' | 'OCR_PIPELINE' | 'SEMANTIC_AI';
  textSnippet?: string;
  confidence: FeatureConfidence;
  role?: EvidenceRole;
  category?: SignalCategory;
}

export interface FinancialPromisesFeature {
  hasPromise: boolean;
  promisedAmount?: number;
  promisedPercentage?: number;
  timeframe?: string;
  cadence?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' | 'ONCE' | 'UNKNOWN';
  isGuaranteedOrFixed: boolean;
  hasNoLossClaim: boolean;
  hasCompoundingClaim: boolean;
  isUnrealisticReturn: boolean;
  provenance: FeatureProvenance[];
}

export interface PaymentBehaviorFeature {
  hasPaymentRequest: boolean;
  isAdvancePayment: boolean;
  feeType?: 'REGISTRATION' | 'ACTIVATION' | 'WITHDRAWAL' | 'TAX_CLEARANCE' | 'SECURITY_DEPOSIT' | 'UNFREEZE' | 'OTHER';
  method?: 'PERSONAL_UPI' | 'PERSONAL_BANK' | 'CRYPTO' | 'GIFT_CARD' | 'UNKNOWN';
  requiresPaymentBeforeAccessOrWithdrawal: boolean;
  provenance: FeatureProvenance[];
}

export interface CredentialRequestsFeature {
  asksOtp: boolean;
  asksPinOrPassword: boolean;
  asksBankingDetailsOrCard: boolean;
  asksCvv: boolean;
  asksSeedPhraseOrPrivateKey: boolean;
  asksApiKey: boolean;
  provenance: FeatureProvenance[];
}

export interface DeviceAccessRequestsFeature {
  asksRemoteDesktop: boolean;
  asksScreenSharing: boolean;
  asksUnknownApkDownload: boolean;
  asksBrowserExtension: boolean;
  asksRemoteSoftware: boolean;
  provenance: FeatureProvenance[];
}

export interface SocialPressureFeature {
  hasUrgency: boolean;
  hasScarcity: boolean;
  hasSecrecy: boolean;
  invitesVipGroup: boolean;
  hasAuthorityPressure: boolean;
  hasThreatOrFear: boolean;
  hasExclusiveOpportunityClaim: boolean;
  provenance: FeatureProvenance[];
}

export interface InvestmentMechanismsFeature {
  isCopyTrading: boolean;
  isManagedTrading: boolean;
  isTradingSignals: boolean;
  isCryptoStakingOrMining: boolean;
  isFakePlatformOrExchange: boolean;
  isFakeTradingApp: boolean;
  isIpoOrAllotmentClaim: boolean;
  isUnregisteredAdvisory: boolean;
  isTaskOrJobInvestment: boolean;
  provenance: FeatureProvenance[];
}

export interface WithdrawalPatternsFeature {
  isWithdrawalBlocked: boolean;
  demandsAdditionalPaymentForWithdrawal: boolean;
  demandsTaxOrVerificationBeforeWithdrawal: boolean;
  hasRepeatedEscalation: boolean;
  provenance: FeatureProvenance[];
}

export interface ImpersonationFeature {
  impersonatesRegulator: boolean; // SEBI, RBI, SEC
  impersonatesBank: boolean;
  impersonatesBrokerOrExchange: boolean;
  impersonatesGovernmentOrPolice: boolean;
  impersonatesKnownPerson: boolean;
  provenance: FeatureProvenance[];
}

export interface TechnicalUrlSignalsFeature {
  hasSuspiciousUrl: boolean;
  hasLookalikeDomain: boolean;
  hasPunycodeDomain: boolean;
  hasShortenedUrl: boolean;
  hasCredentialCollectionForm: boolean;
  hasSuspiciousQrUrl: boolean;
  provenance: FeatureProvenance[];
}

export interface RecoveryScamsFeature {
  isRecoveryServiceClaim: boolean;
  promisesFundsRecovery: boolean;
  targetsPreviousVictim: boolean;
  demandsRecoveryFee: boolean;
  provenance: FeatureProvenance[];
}

export interface JobTaskPatternsFeature {
  isTaskCompletionScheme: boolean;
  requiresDepositToUnlockTasks: boolean;
  requiresCommissionWithdrawalDeposit: boolean;
  hasEscalatingTaskDeposits: boolean;
  provenance: FeatureProvenance[];
}

export interface UnknownOtherFeature {
  hasNovelSuspiciousBehavior: boolean;
  behaviorDescription?: string;
  provenance: FeatureProvenance[];
}

export interface SemanticFeatureModel {
  promises: FinancialPromisesFeature;
  payment: PaymentBehaviorFeature;
  credentials: CredentialRequestsFeature;
  deviceAccess: DeviceAccessRequestsFeature;
  socialPressure: SocialPressureFeature;
  mechanisms: InvestmentMechanismsFeature;
  withdrawal: WithdrawalPatternsFeature;
  impersonation: ImpersonationFeature;
  technicalUrls: TechnicalUrlSignalsFeature;
  recovery: RecoveryScamsFeature;
  jobTasks: JobTaskPatternsFeature;
  unknownOther: UnknownOtherFeature;
  overallSuspicionScore: number; // 0.0 to 1.0
  detectedFeatureCount: number;
}
