import { Archetype, ExtractedClaims, Lang, RiskBand } from '@/lib/types';
import { UrlAnalysisResult } from '@/lib/scam/url';

export type RequestedActionType =
  | 'PAY'
  | 'CLICK'
  | 'SHARE_CREDENTIAL'
  | 'SHARE_OTP'
  | 'INSTALL_APP'
  | 'CONTACT'
  | 'JOIN_GROUP'
  | 'TRANSFER'
  | 'INVEST'
  | 'WITHDRAW'
  | 'VERIFY_IDENTITY'
  | 'OTHER';

export type PressureSignalType =
  | 'URGENCY'
  | 'THREAT'
  | 'FEAR'
  | 'REWARD'
  | 'SECRECY'
  | 'AUTHORITY_PRESSURE'
  | 'SOCIAL_PRESSURE'
  | 'SCARCITY';

export type FinancialSignalType =
  | 'PAYMENT_REQUEST'
  | 'INVESTMENT_REQUEST'
  | 'ADVANCE_FEE'
  | 'UNREALISTIC_RETURN'
  | 'GUARANTEED_RETURN'
  | 'WITHDRAWAL_BLOCK'
  | 'RECOVERY_PAYMENT'
  | 'MULE_TRANSFER'
  | 'OTHER';

export type TechnicalSignalType =
  | 'LINK'
  | 'QR'
  | 'APP_INSTALL'
  | 'REMOTE_ACCESS'
  | 'CREDENTIAL_REQUEST'
  | 'OTP_REQUEST';

export interface OpenWorldAnalysis {
  claimedActor?: {
    role: string;
    claimedIdentity?: string;
  };
  claimedSituation?: string;

  requestedActions: Array<{
    action: RequestedActionType;
    evidence: string;
    provenance: string;
  }>;

  pressureSignals: Array<{
    type: PressureSignalType;
    evidence: string;
  }>;

  financialSignals: Array<{
    type: FinancialSignalType;
    evidence: string;
  }>;

  technicalSignals: Array<{
    type: TechnicalSignalType;
    evidence: string;
  }>;

  impersonationSignals: Array<{
    claimedOrganization?: string;
    claimedRole?: string;
    evidence: string;
  }>;

  uncertainty: Array<{
    field: string;
    reason: string;
  }>;

  behavioralRiskScore: number;
  confidence: number;
  suggestedBand: RiskBand;
  suggestedArchetype: Archetype;
}

/**
 * Open-World General Scam Behavioral Extractor.
 * Analyzes semantic & behavioral characteristics of ANY message without requiring exact dataset match or predefined investment archetype.
 */
export function analyzeOpenWorldBehavior(
  text: string,
  lang: Lang = 'en',
  claims?: ExtractedClaims,
  urlAnalysis?: UrlAnalysisResult
): OpenWorldAnalysis {
  const lower = text.toLowerCase().replace(/[\r\n]+/g, ' ').trim();

  const requestedActions: OpenWorldAnalysis['requestedActions'] = [];
  const pressureSignals: OpenWorldAnalysis['pressureSignals'] = [];
  const financialSignals: OpenWorldAnalysis['financialSignals'] = [];
  const technicalSignals: OpenWorldAnalysis['technicalSignals'] = [];
  const impersonationSignals: OpenWorldAnalysis['impersonationSignals'] = [];
  const uncertainty: OpenWorldAnalysis['uncertainty'] = [];

  // 0. Passive Bank Transaction & Routine Utility Bill Safeguard (Benign Content)
  const isPassiveTransactionalAlert =
    /\b(debited for|credited with|salary credited|trip receipt|order delivered|order dispatched|pnr.*confirmed|seat.*confirmed|swiggy order|zomato order|uber trip|ola ride|flight confirmed|ticket confirmed|avail balance|txn id|transaction id|monthly mobile bill|received ₹|dispatched)\b/i.test(
      lower
    ) && !/\b(click link|pay fee|share otp|enter pin|verify at|claim refund|unfreeze|disconnected|deactivated|penalty|warrant|urgent|call|http)\b/i.test(lower);

  const isRoutineUtilityBill =
    /\b(electricity bill|monthly mobile bill|water bill|gas bill|dth bill|broadband bill)\b/i.test(lower) &&
    /\b(due on|is generated|due date|pay online at|official app)\b/i.test(lower) &&
    !/\b(disconnected|power cut|cut off|in 2 hours|in 1 hour|deactivated|tonight|illegal activity|jail|warrant|penalty|bit\.ly|\.site|\.top|\.online)\b/i.test(lower);

  if (isPassiveTransactionalAlert || isRoutineUtilityBill) {
    return {
      claimedSituation: 'Passive bank transaction notification or routine utility bill receipt',
      requestedActions: [],
      pressureSignals: [],
      financialSignals: [],
      technicalSignals: [],
      impersonationSignals: [],
      uncertainty: [],
      behavioralRiskScore: 0.05,
      confidence: 0.95,
      suggestedBand: 'LOW_SIGNALS',
      suggestedArchetype: 'OTHER_OR_NONE',
    };
  }

  // 1. Context & Educational Inquiry Check (Safeguard for Benign / Educational Content)
  const cleanedLower = lower.replace(/\s*\(ref:.*?\)$/i, '').trim();
  const isEducationalOrQuestion =
    /\b(what is|what are|what should|what does|why do|how do|how does|how can|can a|could a|can you explain|meaning of|definition of|calculate|i received a job offer|कैलकुलेट|என்ன|ஏன்|எப்படி|literacy|awareness|educational|news report|warning about|sebi alert|rbi warning|police alert)\b/i.test(
      cleanedLower
    ) || cleanedLower.endsWith('?');

  const activeSolicitationPhrases =
    !isEducationalOrQuestion &&
    /\b(pay|transfer|deposit|send money|recharge|click|call|contact|share otp|enter pin|download|install|verify account|claim refund|scan qr|கட்டணம்|அனுப்பவும்|भेजें|पे करें|क्लिक करें)\b/i.test(
      lower
    );

  // 2. Impersonation & Claimed Actor Extraction (only if not a benign educational inquiry)
  let claimedOrg: string | undefined;
  let claimedRole: string | undefined;

  if (!isEducationalOrQuestion || activeSolicitationPhrases) {
    // Authorities / Regulators / Police / TRAI
    if (/\b(police|cbi|trai|cyber cell|income tax|sebi|rbi|customs|court|judicial|trai alert|cbi cyber cell|police alert)\b/i.test(lower)) {
      claimedOrg = 'Government / Law Enforcement / Regulator';
      if (/\bpolice|cbi|trai|cyber cell\b/i.test(lower)) claimedRole = 'Police / Cyber Crime Officer';
      else if (/\bincome tax\b/i.test(lower)) claimedRole = 'Tax Inspector';
      else if (/\bcustoms\b/i.test(lower)) claimedRole = 'Customs Official';
      else claimedRole = 'Official Authority';

      impersonationSignals.push({
        claimedOrganization: claimedOrg,
        claimedRole,
        evidence: 'Claims representation of official government, regulatory, or police authority',
      });
    }
    // Utilities / Electricity
    else if (/\b(electricity|power|bescom|tneb|mseb|pspcl|dhbvn|uppcl|wbsetcl|bill update|மின்சாரம்|बिजली)\b/i.test(lower)) {
      claimedOrg = 'Electricity / Power Utility Department';
      claimedRole = 'Customer Support / Accounts Officer';

      impersonationSignals.push({
        claimedOrganization: claimedOrg,
        claimedRole,
        evidence: 'Claims representation of power / electricity utility department',
      });
    }
    // Courier / Logistics
    else if (/\b(fedex|dhl|bluedart|indiapost|courier|parcel|customs duty|पार्सல்|कूरियर)\b/i.test(lower)) {
      claimedOrg = 'Courier / Postal Logistics Service';
      claimedRole = 'Customs / Delivery Officer';

      impersonationSignals.push({
        claimedOrganization: claimedOrg,
        claimedRole,
        evidence: 'Claims representation of courier or postal parcel delivery service',
      });
    }
    // Banking / Financial Institution
    else if (/\b(sbi manager|hdfc fraud department|icici manager|bank manager|yono block|paytm kyc|gpay support|sbi alert|netbanking account blocked|account blocked|netbanking blocked)\b/i.test(lower)) {
      claimedOrg = 'Bank / Digital Payments Provider';
      claimedRole = 'Bank Manager / Fraud Verification Team';

      impersonationSignals.push({
        claimedOrganization: claimedOrg,
        claimedRole,
        evidence: 'Claims representation of bank or digital payment service',
      });
    }
    // E-commerce / Tech Services
    else if (/\b(amazon support|flipkart support|meta verification|instagram team|netflix alert|indigo flight|lic bonus)\b/i.test(lower)) {
      claimedOrg = 'E-commerce / Subscription / Brand Service';
      claimedRole = 'Customer Service Representative';

      impersonationSignals.push({
        claimedOrganization: claimedOrg,
        claimedRole,
        evidence: 'Claims representation of e-commerce, streaming, or brand service provider',
      });
    }
  }

  // 3. Claimed Situation Extraction
  let claimedSituation: string | undefined;

  if (/\b(disconnected|disconnection|power cut|cut off|துண்டிக்கப்படும்|बिजली कटेगी)\b/i.test(lower)) {
    claimedSituation = 'Imminent utility service disconnection due to pending bill';
  } else if (/\b(customs|parcel.*hold|duty fee|package.*held|on hold)\b/i.test(lower)) {
    claimedSituation = 'Courier parcel on hold pending tax / clearance payment';
  } else if (/\b(tax refund|refund of|income tax refund|வரி ரீஃபண்ட்|रिफंड)\b/i.test(lower)) {
    claimedSituation = 'Government / tax refund available for instant payout';
  } else if (/\b(digital arrest|warrant|illegal activity|cyber crime|jail|arrest|கைது|अरेस्ट)\b/i.test(lower)) {
    claimedSituation = 'Alleged illegal activity or arrest warrant threat';
  } else if (/\b(matured|policy bonus|bonus amount|lic bonus)\b/i.test(lower)) {
    claimedSituation = 'Unclaimed policy bonus or maturity payout';
  } else if (/\b(scholarship|lottery|reward points|gift voucher)\b/i.test(lower)) {
    claimedSituation = 'Monetary reward, scholarship, or loyalty points payout claim';
  } else if (/\b(flat.*rent|booking token|apartment.*deposit)\b/i.test(lower)) {
    claimedSituation = 'Rental property booking token or deposit request';
  } else if (/\b(traffic fine|e-challan|challan pending|vehicle fine)\b/i.test(lower)) {
    claimedSituation = 'Pending traffic penalty e-challan threat';
  } else if (/\b(work from home|part time job|rating task|like youtube)\b/i.test(lower)) {
    claimedSituation = 'High-paying online task or part-time job offer';
  } else if (/\b(suspended|blocked|frozen|kyc update|reactivate|unblock)\b/i.test(lower)) {
    claimedSituation = 'Account suspension or block threat demanding immediate verification';
  }

  // 4. Pressure Signals (Urgency, Threat, Fear, Secrecy, Authority, Scarcity)
  if (/\b(tonight|within 2 hours|immediately|today only|expires in|urgent|last chance|जल्दी|உடனடியாக)\b/i.test(lower)) {
    pressureSignals.push({
      type: 'URGENCY',
      evidence: 'Imposes short deadline or immediate time pressure',
    });
  }

  if (/\b(disconnected|arrest|court warrant|jail|legal action|fine|penalty|deleting account|suspended|deactivated|deactivation|sim block|sim card|blocked|சிறை|जेल)\b/i.test(lower)) {
    pressureSignals.push({
      type: 'THREAT',
      evidence: 'Threatens severe negative consequences (disconnection, arrest, SIM deactivation, fine, suspension)',
    });
    pressureSignals.push({
      type: 'FEAR',
      evidence: 'Leverages fear or legal penalty to coerce action',
    });
  }

  if (/\b(do not disconnect|do not tell|keep private|secret|do not share with bank|secret method|secret group|private circle|ரகசியம்|गुप्त)\b/i.test(lower)) {
    pressureSignals.push({
      type: 'SECRECY',
      evidence: 'Instructs recipient to keep transaction private or asserts secret methods',
    });
  }

  if (/\b(others are consistently profiting|everyone posts profit|everyone is making|consistently profiting)\b/i.test(lower)) {
    pressureSignals.push({
      type: 'SOCIAL_PRESSURE',
      evidence: 'Uses social proof or comparison claiming peers are consistently earning profit',
    });
  }

  if (claimedOrg?.includes('Government') || claimedOrg?.includes('Power') || claimedOrg?.includes('Bank')) {
    pressureSignals.push({
      type: 'AUTHORITY_PRESSURE',
      evidence: 'Uses institutional or official authority to enforce compliance',
    });
  }

  // 5. Financial Signals (Payment, Fee, Unrealistic Returns, Guarantee, Withdrawal Block)
  const containsAmount = /₹\s*\d+|\b\d+\s*(?:rs|rupees|inr)\b/i.test(lower);
  const paymentWords = /\b(pay|transfer|deposit|clearance tax|processing fee|booking amount|registration fee|fine|token|कैटम|शुल्क|கட்டணம்)\b/i.test(lower);

  if (paymentWords || containsAmount || claims?.requests.includes('PAYMENT')) {
    financialSignals.push({
      type: 'PAYMENT_REQUEST',
      evidence: 'Requests monetary payment, transfer, or fee deposit',
    });
  }

  if (/\b(registration fee|processing fee|upfront|activation fee|documentation fee|clearance tax|advance|मुன்பணம்|अग्रिम)\b/i.test(lower)) {
    financialSignals.push({
      type: 'ADVANCE_FEE',
      evidence: 'Demands advance fee or upfront payment before releasing service/funds',
    });
  }

  if (/\b(guaranteed|fixed profit|100% win|no loss|sure return|गारंटी|உத்தரவாதம்)\b/i.test(lower)) {
    financialSignals.push({
      type: 'GUARANTEED_RETURN',
      evidence: 'Claims 100% guaranteed or risk-free financial return',
    });
  }

  if (/\b(daily 10%|daily 5%|double your money|2x in 30 days|100% profit in 1 week|5x your money|earn 100k a month|turn .*? into huge|huge monthly income)\b/i.test(lower)) {
    financialSignals.push({
      type: 'UNREALISTIC_RETURN',
      evidence: 'Promises mathematically unrealistic or impossible investment yields',
    });
  }

  if (/\b(cannot withdraw|unable to withdraw|withdrawal tax|unfreeze fee)\b/i.test(lower)) {
    financialSignals.push({
      type: 'WITHDRAWAL_BLOCK',
      evidence: 'Prevents money withdrawal unless extra fees are paid',
    });
  }

  // 6. Technical Signals (Link, QR, App Install, Remote Access, Credentials, OTP)
  const hasLink = (claims?.urls && claims.urls.length > 0) || /https?:\/\/|www\.|bit\.ly|tinyurl|\.site|\.top|\.online|\.incometax/i.test(lower);
  if (hasLink) {
    technicalSignals.push({
      type: 'LINK',
      evidence: 'Contains external hyperlink or URL destination',
    });
    requestedActions.push({
      action: 'CLICK',
      evidence: 'Prompts recipient to click link',
      provenance: 'TEXT_REGEX',
    });
  }

  if (/\b(scan qr|qr code|scan to receive|upi:\/\/pay)\b/i.test(lower)) {
    technicalSignals.push({
      type: 'QR',
      evidence: 'Contains QR code or payment QR scan instruction',
    });
  }

  if (/\b(anydesk|teamviewer|rustdesk|quicksupport|remote access|screen share|திரை பகிர்வு)\b/i.test(lower)) {
    technicalSignals.push({
      type: 'REMOTE_ACCESS',
      evidence: 'Requests installation or execution of remote desktop screen-sharing software',
    });
    requestedActions.push({
      action: 'INSTALL_APP',
      evidence: 'Requests remote access app installation',
      provenance: 'TEXT_REGEX',
    });
  } else if (!isEducationalOrQuestion && /\b(apk|sideload|download.*app|install.*app|install.*application|verification application|install their app|download for free)\b/i.test(lower)) {
    technicalSignals.push({
      type: 'APP_INSTALL',
      evidence: 'Requests downloading unverified mobile APK file or external application',
    });
    requestedActions.push({
      action: 'INSTALL_APP',
      evidence: 'Prompts recipient to install application',
      provenance: 'TEXT_REGEX',
    });
  }

  if (/\b(add chat group|join.*group|telegram group|whatsapp group|trading circle|private group)\b/i.test(lower)) {
    requestedActions.push({
      action: 'JOIN_GROUP',
      evidence: 'Solicits joining an external chat group, private trading circle, or channel',
      provenance: 'TEXT_REGEX',
    });
  }

  if (
    (/\b(share|send|tell|enter|give|verify)\b.*?\botp\b/i.test(lower) ||
      /\botp\b.*?\b(share|send|tell|enter|give|verify|code)\b/i.test(lower) ||
      /\b(ओटीपी शेयर|கடவுச்சொல் பகிரவும்)\b/i.test(lower)) &&
    !/\b(never share|don't share|do not share|otp confidentiality|what is otp)\b/i.test(lower)
  ) {
    technicalSignals.push({
      type: 'OTP_REQUEST',
      evidence: 'Requests recipient to share active One-Time Password (OTP)',
    });
    requestedActions.push({
      action: 'SHARE_OTP',
      evidence: 'Requests OTP sharing',
      provenance: 'TEXT_REGEX',
    });
  }

  if (/\b(pin|password|cvv|card details|netbanking credentials)\b/i.test(lower) && !isEducationalOrQuestion) {
    technicalSignals.push({
      type: 'CREDENTIAL_REQUEST',
      evidence: 'Requests confidential banking credentials, PIN, CVV, or passwords',
    });
    requestedActions.push({
      action: 'SHARE_CREDENTIAL',
      evidence: 'Prompts for credential sharing',
      provenance: 'TEXT_REGEX',
    });
  }

  if (financialSignals.some((f) => f.type === 'PAYMENT_REQUEST' || f.type === 'ADVANCE_FEE')) {
    requestedActions.push({
      action: 'PAY',
      evidence: 'Prompts recipient to make payment or money transfer',
      provenance: 'TEXT_REGEX',
    });
  }

  if (/\b(call|contact|whatsapp|phone number|helpline)\s*:?\s*\d+/i.test(lower)) {
    requestedActions.push({
      action: 'CONTACT',
      evidence: 'Directs recipient to call or contact phone number',
      provenance: 'TEXT_REGEX',
    });
  }

  // 7. Uncertainty Assessment
  if (!claimedOrg && impersonationSignals.length === 0) {
    uncertainty.push({ field: 'claimedActor', reason: 'Sender identity/organization is unspecified' });
  }
  if (!hasLink && !paymentWords && !containsAmount && requestedActions.length === 0) {
    uncertainty.push({ field: 'actionableCallToText', reason: 'No clear URL, payment, or credential request detected' });
  }

  // 8. Open-World Compositional Risk Scoring & Band Assignment
  let riskScorePoints = 0;

  // Signal combinations elevate score compositionally
  if (financialSignals.some((f) => f.type === 'PAYMENT_REQUEST' || f.type === 'ADVANCE_FEE')) {
    riskScorePoints += 2.0;
  }
  if (pressureSignals.some((p) => p.type === 'URGENCY')) {
    riskScorePoints += 1.5;
  }
  if (pressureSignals.some((p) => p.type === 'THREAT' || p.type === 'FEAR')) {
    riskScorePoints += 2.0;
  }
  if (impersonationSignals.length > 0) {
    riskScorePoints += 1.5;
  }
  if (hasLink || technicalSignals.some((t) => t.type === 'LINK')) {
    riskScorePoints += 1.0;
  }
  if (technicalSignals.some((t) => t.type === 'REMOTE_ACCESS' || t.type === 'APP_INSTALL' || t.type === 'OTP_REQUEST' || t.type === 'CREDENTIAL_REQUEST')) {
    riskScorePoints += 3.5;
  }

  // Calculate normalized risk score 0..1
  const behavioralRiskScore = Math.min(1.0, riskScorePoints / 5.0);

  let suggestedBand: RiskBand = 'CANNOT_VERIFY';
  let confidence = 0.6;
  let suggestedArchetype: Archetype = 'OTHER_OR_NONE';

  // Rule matrix assignment:
  if (isEducationalOrQuestion && !activeSolicitationPhrases && !technicalSignals.some((t) => t.type === 'OTP_REQUEST' || t.type === 'REMOTE_ACCESS')) {
    suggestedBand = 'LOW_SIGNALS';
    confidence = 0.92;
    suggestedArchetype = 'OTHER_OR_NONE';
  } else if (
    riskScorePoints >= 3.0 ||
    technicalSignals.some((t) => t.type === 'REMOTE_ACCESS' || t.type === 'OTP_REQUEST' || t.type === 'CREDENTIAL_REQUEST' || t.type === 'APP_INSTALL') ||
    (pressureSignals.length > 0 && (impersonationSignals.length > 0 || hasLink)) ||
    (financialSignals.length > 0 && (pressureSignals.length > 0 || hasLink || requestedActions.some((a) => a.action === 'INSTALL_APP' || a.action === 'JOIN_GROUP')))
  ) {
    suggestedBand = 'HIGH';
    confidence = Math.min(0.98, 0.85 + (riskScorePoints - 3.0) * 0.04);
    suggestedArchetype = 'OTHER_SUSPICIOUS_FINANCIAL_PATTERN';
  } else if (riskScorePoints >= 1.5) {
    suggestedBand = 'MEDIUM';
    confidence = 0.78;
    suggestedArchetype = 'OTHER_SUSPICIOUS_FINANCIAL_PATTERN';
  } else {
    suggestedBand = 'LOW_SIGNALS';
    confidence = 0.7;
    suggestedArchetype = 'OTHER_OR_NONE';
  }

  return {
    claimedActor: claimedOrg ? { role: claimedRole || 'Representative', claimedIdentity: claimedOrg } : undefined,
    claimedSituation,
    requestedActions,
    pressureSignals,
    financialSignals,
    technicalSignals,
    impersonationSignals,
    uncertainty,
    behavioralRiskScore,
    confidence,
    suggestedBand,
    suggestedArchetype,
  };
}
