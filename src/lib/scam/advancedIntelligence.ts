import { Archetype, ExtractedClaims, Lang, RiskBand, Signal } from '@/lib/types';
import { OpenWorldAnalysis } from '@/lib/detector/openWorld';
import { UrlAnalysisResult } from './url/types';

export type ScamPrimaryCategory =
  | 'IMPERSONATION'
  | 'INVESTMENT_FRAUD'
  | 'TASK_SCAM'
  | 'PHISHING'
  | 'REMOTE_ACCESS_ABUSE'
  | 'RECOVERY_SCAM'
  | 'EMERGING_PATTERN'
  | 'BENIGN_OR_OTHER';

export interface ConflictingSignalItem {
  id: string;
  signalA: string;
  signalB: string;
  description: string;
  severity: 'HIGH' | 'MEDIUM';
}

export interface StructuredClassification {
  primaryCategory: ScamPrimaryCategory;
  subCategory: string;
  confidence: number; // 0..1
  uncertaintyLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  uncertaintyReasons: string[];
  conflictingSignals: ConflictingSignalItem[];
  mitigationSlug: string;
}

/**
 * Advanced Scam Intelligence Classifier.
 * Analyzes multi-layered patterns across 7 core threat categories, calculates uncertainty,
 * and pinpoints conflicting social engineering signals.
 */
export function classifyAdvancedScamIntelligence(options: {
  rawText: string;
  band: RiskBand;
  archetype: Archetype;
  claims: ExtractedClaims;
  signals: Signal[];
  openWorld?: OpenWorldAnalysis;
  urlAnalysis?: UrlAnalysisResult;
  lang?: Lang;
}): StructuredClassification {
  const { rawText, band, archetype, claims, signals, openWorld, urlAnalysis, lang = 'en' } = options;
  const lower = rawText.toLowerCase();

  let primaryCategory: ScamPrimaryCategory = 'BENIGN_OR_OTHER';
  let subCategory = 'Standard Transactional / Informational';
  let mitigationSlug = 'guaranteed-return-claims';
  let confidence = openWorld?.confidence || 0.8;

  const conflictingSignals: ConflictingSignalItem[] = [];
  const uncertaintyReasons: string[] = [];

  // ==========================================
  // 1. Structured Category & Sub-Category Mapping
  // ==========================================

  // A. RECOVERY SCAMS
  if (
    archetype === ('RECOVERY_SCAM' as any) ||
    lower.includes('recover') ||
    lower.includes('recovery fee') ||
    lower.includes('frozen scammer wallet') ||
    openWorld?.financialSignals.some((f) => f.type === 'RECOVERY_PAYMENT')
  ) {
    primaryCategory = 'RECOVERY_SCAM';
    subCategory = 'Advance Fee Asset / Crypto Recovery Fraud';
    mitigationSlug = 'recovery-scam-guide';
  }
  // B. TASK SCAMS
  else if (
    lower.includes('part-time') ||
    lower.includes('youtube video') ||
    lower.includes('prepaid task') ||
    lower.includes('security deposit to upgrade') ||
    lower.includes('video liking')
  ) {
    primaryCategory = 'TASK_SCAM';
    subCategory = 'Prepaid Social Media / E-Commerce Rating Task Scheme';
    mitigationSlug = 'part-time-prepaid-task-fraud';
  }
  // C. REMOTE ACCESS ABUSE
  else if (
    archetype === 'REMOTE_ACCESS_SCAM' ||
    openWorld?.technicalSignals.some((t) => t.type === 'REMOTE_ACCESS') ||
    /\b(anydesk|teamviewer|rustdesk|quicksupport|screen share)\b/i.test(lower)
  ) {
    primaryCategory = 'REMOTE_ACCESS_ABUSE';
    subCategory = 'Screen-Sharing & Unauthorized APK Device Takeover';
    mitigationSlug = 'remote-access-scams';
  }
  // D. PHISHING & CREDENTIAL HARVESTING
  else if (
    openWorld?.technicalSignals.some((t) => t.type === 'OTP_REQUEST' || t.type === 'CREDENTIAL_REQUEST') ||
    /\b(share otp|enter pin|netbanking password|kyc update.*http|account blocked.*login)\b/i.test(lower) ||
    claims.requests.includes('OTP')
  ) {
    primaryCategory = 'PHISHING';
    subCategory = 'Credential Harvesting & Fake Banking Portal Phishing';
    mitigationSlug = 'fake-investment-apps';
  }
  // E. IMPERSONATION FRAUD
  else if (
    openWorld?.impersonationSignals.length ||
    /\b(cbi|police|customs officer|court warrant|trai|bescom|tneb|electricity desk|fedex courier|bank manager)\b/i.test(lower)
  ) {
    primaryCategory = 'IMPERSONATION';
    subCategory = openWorld?.claimedActor?.role
      ? `${openWorld.claimedActor.role} Impersonation`
      : 'Institutional & Regulatory Authority Impersonation';
    mitigationSlug = 'digital-arrest-customs-parcel';
  }
  // F. EMERGING PATTERNS (AI Quant, Web3 Drainers, Arbitrage Bots)
  else if (
    /\b(quant bot|arbitrage bot|decentralised pool|smart contract|connect wallet|web3 wallet|crypto staking)\b/i.test(lower)
  ) {
    primaryCategory = 'EMERGING_PATTERN';
    subCategory = 'Automated Smart Contract Drainer & Algorithmic Yield Scheme';
    mitigationSlug = 'crypto-investment-scams';
  }
  // G. GENERAL INVESTMENT FRAUD
  else if (
    band === 'HIGH' ||
    archetype === 'DOUBLING_SCHEME' ||
    archetype === 'FAKE_IPO_OR_ALLOTMENT' ||
    archetype === 'COPY_TRADING' ||
    archetype === 'PUMP_AND_DUMP_GROUP' ||
    claims.promisedReturns.length > 0
  ) {
    primaryCategory = 'INVESTMENT_FRAUD';
    subCategory =
      archetype === 'FAKE_IPO_OR_ALLOTMENT'
        ? 'Fake Institutional IPO Allotment Trap'
        : archetype === 'COPY_TRADING'
        ? 'Unregistered Copy Trading & Mirror Account Scam'
        : 'Guaranteed Return Doubling / Ponzi Scheme';
    mitigationSlug =
      archetype === 'FAKE_IPO_OR_ALLOTMENT'
        ? 'institutional-fake-ipo-allotment'
        : 'guaranteed-return-claims';
  }

  // ==========================================
  // 2. Conflicting Signals Analysis
  // ==========================================

  // Contradiction 1: Regulatory Claim vs Private Account / UPI Payment
  const hasRegClaim = claims.registrationClaims.length > 0 || /\b(sebi|rbi|government registered|govt approved)\b/i.test(lower);
  const hasPrivatePayment = /\b(upi|personal account|gpay|phonepe|paytm|transfer to|deposit to)\b/i.test(lower);
  if (hasRegClaim && hasPrivatePayment) {
    conflictingSignals.push({
      id: 'REGULATION_VS_PRIVATE_PAYMENT',
      signalA: 'Official Regulatory Claim (SEBI/RBI registration asserted)',
      signalB: 'Direct Personal Payment Request (Demands transfer to private UPI/bank)',
      description: 'Legitimate regulated financial entities never collect investment deposits via personal UPI or third-party bank accounts.',
      severity: 'HIGH',
    });
  }

  // Contradiction 2: "100% Risk-Free Guarantee" vs High Pressure / Urgency
  const hasZeroRiskClaim = /\b(100% safe|risk free|guaranteed|zero risk|no loss)\b/i.test(lower);
  const hasUrgency = /\b(today only|within 2 hours|immediately|expires in|urgent|hurry)\b/i.test(lower);
  if (hasZeroRiskClaim && hasUrgency) {
    conflictingSignals.push({
      id: 'GUARANTEE_VS_URGENCY',
      signalA: 'Zero Risk Claim (Promises guaranteed, risk-free yields)',
      signalB: 'High Pressure Urgency (Artificial countdown / immediate transfer deadline)',
      description: 'Genuine market investments carry standard risk; scammers manufacture artificial urgency to bypass critical due diligence.',
      severity: 'HIGH',
    });
  }

  // Contradiction 3: Passive Alert Presentation vs Actionable Phishing Links
  const isPassiveNotice = /\b(salary credited|order delivered|bill generated|ticket confirmed)\b/i.test(lower);
  const hasSuspiciousLink = Boolean(urlAnalysis?.aggregateSignals.length || /https?:\/\//i.test(lower));
  if (isPassiveNotice && hasSuspiciousLink) {
    conflictingSignals.push({
      id: 'TRANSACTIONAL_VS_EXTERNAL_LINK',
      signalA: 'Passive Transaction Format (Imitates routine bank or utility receipt)',
      signalB: 'Embedded Unverified Link (Contains external link requiring immediate action)',
      description: 'Legitimate transaction receipts do not embed actionable external unverified links demanding login or credential input.',
      severity: 'MEDIUM',
    });
  }

  // Contradiction 4: Fund Recovery Assertion vs Advance Fee Directive
  if (primaryCategory === 'RECOVERY_SCAM' && /\b(advance|fee|deposit|clearance)\b/i.test(lower)) {
    conflictingSignals.push({
      id: 'RECOVERY_VS_ADVANCE_FEE',
      signalA: 'Stolen Fund Recovery Claim (Claims stolen cryptocurrency or money has been located)',
      signalB: 'Advance Release Fee Demand (Demands upfront deposit before releasing assets)',
      description: 'Authorized law enforcement and recovery agencies never demand an upfront processing fee to release recovered evidence.',
      severity: 'HIGH',
    });
  }

  // ==========================================
  // 3. Uncertainty Assessment
  // ==========================================
  if (!lower.includes('http') && !lower.includes('www.') && !lower.includes('.com')) {
    uncertaintyReasons.push('Absence of explicit destination URL or verified domain target.');
  }
  if (!/\b\d+\s*(?:rs|rupees|inr|₹|%)\b/i.test(lower)) {
    uncertaintyReasons.push('No explicit numerical monetary denomination or percentage return specified.');
  }
  if (!openWorld?.claimedActor) {
    uncertaintyReasons.push('Sender identity or corporate affiliation remains anonymous/unspecified.');
  }

  let uncertaintyLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
  if (uncertaintyReasons.length >= 2) {
    uncertaintyLevel = 'HIGH';
  } else if (uncertaintyReasons.length === 1) {
    uncertaintyLevel = 'MEDIUM';
  }

  return {
    primaryCategory,
    subCategory,
    confidence,
    uncertaintyLevel,
    uncertaintyReasons,
    conflictingSignals,
    mitigationSlug,
  };
}
