import crypto from 'crypto';
import { maskPii } from '@/lib/privacy';
import { routeAuthorities } from '@/lib/authorities/router';
import {
  CanonicalReportPacket,
  EvidenceProvenanceItem,
  ObservedPaymentItem,
  ObservedUrlItem,
  PrepareReportInput,
} from './types';

const SUBMISSION_NOTICE = 'Prepared for your review — not automatically submitted.';

function sha256(text: string): string {
  try {
    return crypto.createHash('sha256').update(text).digest('hex');
  } catch {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = (hash << 5) - hash + text.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(16).padStart(64, '0');
  }
}

/**
 * Creates a Canonical Immutable-ish Report Packet
 * Strictly separates Observed Facts, Sangyan Analysis, User Statements, and Unverified Claims.
 */
export function createCanonicalReportPacket(input: PrepareReportInput): CanonicalReportPacket {
  const locale = input.locale || 'en';
  const jurisdiction = input.jurisdiction || 'IN';
  const sourceChannel = input.sourceChannel || 'website';
  const generatedAt = new Date().toISOString();

  // Mask PII
  const rawText = input.rawUserInput || input.narrative || '';
  const maskedNarrative = maskPii(rawText);
  const maskedEntity = input.claimedEntityOrAdvisor ? maskPii(input.claimedEntityOrAdvisor) : undefined;
  const maskedDomain = input.websiteOrDomain ? maskPii(input.websiteOrDomain) : undefined;

  // Mask transactions
  const maskedTransactions: ObservedPaymentItem[] = (input.transactions || []).map((tx) => ({
    handleOrAccount: tx.beneficiaryAccountOrUpi ? maskPii(tx.beneficiaryAccountOrUpi) : 'Unspecified',
    paymentMethod: tx.paymentMethod || 'Bank Transfer / UPI',
    amount: tx.amount,
    utrNumber: tx.utrNumber ? maskPii(tx.utrNumber) : undefined,
  }));

  if (input.totalClaimedLoss && maskedTransactions.length === 0) {
    maskedTransactions.push({
      handleOrAccount: 'Reported Financial Loss',
      amount: input.totalClaimedLoss,
      paymentMethod: 'Unspecified',
    });
  }

  // Extract Observed URLs
  const observedUrls: ObservedUrlItem[] = [];
  if (maskedDomain) {
    observedUrls.push({
      domain: maskedDomain.replace(/^https?:\/\//i, '').split('/')[0],
      fullUrl: maskedDomain,
      source: 'EVIDENCE_OBSERVED',
    });
  }
  const urlMatches = rawText.match(/(?:https?:\/\/|www\.)[^\s<>"'{}|\\^`.]+\.[^\s<>"'{}|\\^`]+/gi);
  if (urlMatches) {
    urlMatches.forEach((u) => {
      const cleanUrl = u.trim();
      const domain = cleanUrl.replace(/^https?:\/\//i, '').split('/')[0];
      if (!observedUrls.some((existing) => existing.fullUrl === cleanUrl)) {
        observedUrls.push({
          domain,
          fullUrl: cleanUrl,
          source: 'EVIDENCE_OBSERVED',
        });
      }
    });
  }

  // Build Observed Facts
  const observedFacts: string[] = [];
  if (input.platform) observedFacts.push(`Communication Channel: ${maskPii(input.platform)}`);
  if (input.incidentDate) observedFacts.push(`Incident Date: ${input.incidentDate}`);
  if (input.totalClaimedLoss && input.totalClaimedLoss > 0) {
    observedFacts.push(`Reported Loss Amount: ₹${input.totalClaimedLoss.toLocaleString('en-IN')}`);
  }
  if (input.credentialsShared) observedFacts.push('Observed Fact: Citizen shared login credentials or passwords.');
  if (input.otpShared) observedFacts.push('Observed Fact: Citizen shared OTP or verification code.');
  if (input.remoteAccessGranted) observedFacts.push('Observed Fact: Remote access desktop software was installed/granted.');
  if (maskedTransactions.length > 0) {
    observedFacts.push(`Recorded Transactions: ${maskedTransactions.length} transaction entries specified.`);
  }

  // Build Observed Claims & Demands made by sender
  const observedClaims: string[] = [];
  const observedRequests: string[] = [];
  if (maskedEntity) observedClaims.push(`Claimed Entity/Advisor Identity: ${maskedEntity}`);
  if (observedUrls.length > 0) observedClaims.push(`Provided Websites/URLs: ${observedUrls.map((u) => u.fullUrl).join(', ')}`);
  
  if (/guarant|promised|100%|daily return|20%|double/i.test(rawText)) {
    observedClaims.push('Sender Claimed: Guaranteed high returns or risk-free investment opportunity.');
  }
  if (/sebi|rbi|government|police|customs|tax/i.test(rawText)) {
    observedClaims.push('Sender Claimed: Official regulatory or law enforcement authority affiliation.');
  }
  if (/pay|transfer|deposit|send|fee|tax/i.test(rawText)) {
    observedRequests.push('Sender Requested: Advance payment, tax fee, or money transfer.');
  }
  if (/otp|code|pin|password/i.test(rawText)) {
    observedRequests.push('Sender Requested: OTP, PIN, or credential disclosure.');
  }
  if (/anydesk|teamviewer|rustdesk|zoom/i.test(rawText)) {
    observedRequests.push('Sender Requested: Installation of remote access screen-sharing application.');
  }

  // User Statements (Explicitly labeled as user-provided content)
  const userStatements: string[] = [];
  if (maskedNarrative) {
    userStatements.push(`User Statement: "${maskedNarrative}"`);
  }

  // Unverified Claims & Uncertainty Notes
  const unverifiedClaims: string[] = [];
  const uncertainty: string[] = [];

  if (maskedEntity) {
    unverifiedClaims.push(`Claimed entity registration for '${maskedEntity}' could not be independently verified from regulatory registers.`);
  }
  if (observedUrls.length > 0) {
    unverifiedClaims.push('Provided websites are user-supplied evidence and are not verified statutory portals.');
  }
  if (jurisdiction === 'UNKNOWN') {
    uncertainty.push('Jurisdiction could not be conclusively determined. Authority routing is restricted until jurisdiction is specified.');
  }

  // Evidence Provenance
  const contentHash = sha256(maskedNarrative || JSON.stringify(input));
  const evidenceItems: EvidenceProvenanceItem[] = [
    {
      evidenceId: `EVID-${sha256(contentHash + generatedAt).substring(0, 8).toUpperCase()}`,
      type: sourceChannel === 'telegram' || sourceChannel === 'whatsapp' ? 'n8n_payload' : 'user_input',
      sourceChannel,
      captureTimestamp: generatedAt,
      contentHash,
      extractionProvenance: sourceChannel === 'telegram' || sourceChannel === 'whatsapp' ? 'N8N_ADAPTER' : 'USER_INPUT',
      maskingState: 'PII_MASKED',
      originalVsNormalized: {
        originalTextSnippet: maskedNarrative.substring(0, 200),
        normalizedText: maskedNarrative,
      },
    },
  ];

  // Sangyan Analysis
  const riskBand = input.analysisResult?.riskBand || (input.totalClaimedLoss || input.credentialsShared || input.otpShared ? 'HIGH' : 'MEDIUM');
  const confidence = input.analysisResult?.confidence ?? 0.85;
  const detectedSignals = input.analysisResult?.signals || [];
  const riskExplanation = input.analysisResult?.explanation || 'Analysis based on observed communication patterns and reported loss metadata.';

  // Determine Category for Deterministic Routing
  let resolvedCategory = 'CYBERCRIME_FINANCIAL_FRAUD';
  if (/sebi|stock|trade|advisor|share|ipo/i.test(rawText) || /sebi/i.test(input.claimedEntityOrAdvisor || '')) {
    resolvedCategory = 'SECURITIES_INVESTMENT_COMPLAINT';
  } else if (/deposit|scheme|ponzi|mlm|task/i.test(rawText)) {
    resolvedCategory = 'UNAUTHORIZED_FINANCIAL_ACTIVITY';
  } else if (/otp|bank|card|account|upi|paytm|phonepe/i.test(rawText)) {
    resolvedCategory = 'BANKING_PAYMENT_ISSUE';
  } else if (/whatsapp|telegram|sms|call|fake number/i.test(rawText)) {
    resolvedCategory = 'TELECOM_SPAM_PHISHING';
  }

  // Deterministic Authority Routing
  const authorityRoutes = routeAuthorities({
    category: resolvedCategory,
    platform: input.platform,
    jurisdiction,
    moneySent: (input.totalClaimedLoss || 0) > 0,
    credentialsShared: input.credentialsShared,
    otpShared: input.otpShared,
    remoteAccessGranted: input.remoteAccessGranted,
    lang: locale,
  });

  const packetWithoutHash = {
    reportVersion: '1.0' as const,
    generatedAt,
    locale,
    jurisdiction,
    incidentType: resolvedCategory,
    analysisSummary: `Preliminary analysis completed with ${riskBand} risk indicator based on available evidence.`,
    observedFacts,
    observedClaims,
    observedRequests,
    urls: observedUrls,
    paymentDetails: maskedTransactions,
    senderMetadata: {
      platform: input.platform,
      maskedSenderId: input.claimedEntityOrAdvisor ? maskPii(input.claimedEntityOrAdvisor) : undefined,
    },
    timestamps: {
      incidentDate: input.incidentDate,
      reportGenerated: generatedAt,
    },
    evidence: evidenceItems,
    sangyanAnalysis: {
      riskBand,
      confidence,
      detectedSignals,
      riskExplanation,
    },
    userStatements,
    unverifiedClaims,
    uncertainty,
    citations: input.analysisResult?.citations || [],
    authorityRoutes,
    submissionNotice: SUBMISSION_NOTICE,
  };

  const exportIntegrityHash = sha256(JSON.stringify(packetWithoutHash));

  return {
    ...packetWithoutHash,
    exportIntegrityHash,
  };
}
