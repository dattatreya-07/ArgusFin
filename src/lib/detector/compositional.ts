import { Archetype, RiskBand } from '@/lib/types';
import { SemanticFeatureModel } from '@/lib/scam/features';

export interface CompositionalResult {
  finalBand: RiskBand;
  topArchetype: {
    top: Archetype;
    prob: number;
  };
  confidence: number;
  reasoningNotes: string[];
}

/**
 * Evaluates semantic feature model compositionally across multiple risk dimensions.
 */
export function evaluateCompositionalReasoning(
  features: SemanticFeatureModel,
  rawText: string
): CompositionalResult {
  const notes: string[] = [];
  const lower = rawText.toLowerCase().trim();

  // 1. Check for Educational / General Inquiry Context (Context & Intent Safeguard)
  const cleanedLower = lower.replace(/\s*\(ref:.*?\)$/i, '').trim();
  const isQuestionOrEducational =
    /\b(what is|what are|why do|how does|how can|can a|could a|can you explain|meaning of|calculate|definition|educational|article about|news report|warning about|learned in|literacy class|backed by|sovereign guarantee|set by banks|g-sec|fixed deposit|fd)\b/i.test(
      cleanedLower
    ) || cleanedLower.endsWith('?');

  const lacksActiveSolicitationOrPayment =
    !features.payment.hasPaymentRequest &&
    !features.payment.isAdvancePayment &&
    !features.credentials.asksOtp &&
    !features.credentials.asksBankingDetailsOrCard &&
    !features.deviceAccess.asksRemoteSoftware &&
    !features.withdrawal.isWithdrawalBlocked;

  // Collect evidence roles across feature provenances
  const provenances = [
    ...features.promises.provenance,
    ...features.payment.provenance,
    ...features.credentials.provenance,
    ...features.deviceAccess.provenance,
    ...features.socialPressure.provenance,
    ...features.mechanisms.provenance,
    ...features.withdrawal.provenance,
    ...features.impersonation.provenance,
    ...features.technicalUrls.provenance,
    ...features.recovery.provenance,
    ...features.jobTasks.provenance,
    ...features.unknownOther.provenance,
  ];

  const hasEducationalOrQuestionRole = provenances.some(
    (p) => p.role === 'ASKED_AS_QUESTION' || p.role === 'EXPLAINED_AS_CONCEPT' || p.role === 'WARNING_ABOUT_SCAM' || p.role === 'NEGATED'
  );

  const hasGroupOrDownloadInvitation =
    features.socialPressure.invitesVipGroup ||
    features.deviceAccess.asksUnknownApkDownload ||
    /\b(add chat group|download for free|install their app|join my secret group)\b/i.test(lower);

  // If input is an educational question, definition, or banking concept without active payment/credential requests
  if (
    !hasGroupOrDownloadInvitation &&
    (isQuestionOrEducational || hasEducationalOrQuestionRole) &&
    lacksActiveSolicitationOrPayment &&
    !features.promises.isUnrealisticReturn
  ) {
    notes.push('Context indicates educational inquiry or banking product definition without active payment solicitation.');
    return {
      finalBand: 'LOW_SIGNALS',
      topArchetype: { top: 'OTHER_OR_NONE', prob: 0.95 },
      confidence: 0.9,
      reasoningNotes: notes,
    };
  }

  // 2. Evaluate Compositional High-Risk Feature Patterns
  let highRiskHits = 0;
  let detectedArchetype: Archetype = 'OTHER_OR_NONE';
  let maxArchetypeProb = 0.5;

  // Pattern 1: Community Mentor + Small Verification Deposit + Signals -> COPY_TRADING
  if (
    (/\b(community|mentor|trader|signal)\b/i.test(lower) && /\b(deposit|fee|verification|payment|pay)\b/i.test(lower)) ||
    (features.mechanisms.isCopyTrading && features.payment.hasPaymentRequest) ||
    (/\b(vip trading group|trading group)\b/i.test(lower) && /\b(join|guaranteed|return)\b/i.test(lower))
  ) {
    highRiskHits += 2;
    notes.push('Solicits deposit or fee to join community/mentor trading signals group.');
    detectedArchetype = 'COPY_TRADING';
    maxArchetypeProb = 0.92;
  }

  // Pattern 2: Customs Clearance Tax / International Withdrawal Block -> FAKE_TRADING_APP_OR_PORTAL
  else if (
    (/\b(customs|clearance tax|withdrawal tax|international crypto|release.*withdrawal|unlock fee)\b/i.test(lower) ||
    (features.withdrawal.isWithdrawalBlocked && features.payment.hasPaymentRequest) ||
    (features.payment.feeType === 'TAX_CLEARANCE' || features.payment.feeType === 'WITHDRAWAL')) && !hasEducationalOrQuestionRole
  ) {
    highRiskHits += 2;
    notes.push('Demands tax or clearance fee to release international withdrawal.');
    detectedArchetype = 'FAKE_TRADING_APP_OR_PORTAL';
    maxArchetypeProb = 0.93;
  }

  // Pattern 3: Doubling / Fixed Return Scheme
  else if ((features.promises.isGuaranteedOrFixed || features.promises.isUnrealisticReturn) && !hasEducationalOrQuestionRole) {
    highRiskHits++;
    notes.push('Promises guaranteed, fixed, or unrealistically high investment yield.');
    if (features.promises.cadence === 'DAILY' || (features.promises.promisedPercentage && features.promises.promisedPercentage >= 50)) {
      detectedArchetype = 'DOUBLING_SCHEME';
      maxArchetypeProb = 0.9;
    }
  }

  // Pattern 4: Advance Payment / Fee Demand
  if ((features.payment.requiresPaymentBeforeAccessOrWithdrawal || features.payment.isAdvancePayment) && !hasEducationalOrQuestionRole) {
    highRiskHits++;
    notes.push('Demands advance fee or payment before granting access or processing withdrawal.');
    if (detectedArchetype === 'OTHER_OR_NONE' && features.jobTasks.isTaskCompletionScheme) {
      detectedArchetype = 'PRE_APPROVED_LOAN_SCAM';
      maxArchetypeProb = 0.85;
    }
  }

  // Pattern 5: Crypto Staking / Mining Scheme
  if (features.mechanisms.isCryptoStakingOrMining && !hasEducationalOrQuestionRole) {
    highRiskHits++;
    notes.push('Promises fixed compounding returns from crypto staking or liquidity mining.');
    if (detectedArchetype === 'OTHER_OR_NONE') {
      detectedArchetype = 'CRYPTO_STAKING_MINING';
      maxArchetypeProb = 0.88;
    }
  }

  // Pattern 6: Remote Access / Screen Sharing
  if (features.deviceAccess.asksRemoteSoftware || features.deviceAccess.asksUnknownApkDownload) {
    highRiskHits += 2;
    notes.push('Requests remote desktop control (AnyDesk/TeamViewer) or unknown APK installation.');
    detectedArchetype = 'REMOTE_ACCESS_SCAM';
    maxArchetypeProb = 0.95;
  }

  // Pattern 7: Withdrawal Block & Escalation
  if (features.withdrawal.isWithdrawalBlocked || features.withdrawal.demandsAdditionalPaymentForWithdrawal) {
    highRiskHits += 2;
    notes.push('Blocked withdrawal with repeated tax, verification, or unfreeze fee demands.');
    if (detectedArchetype === 'OTHER_OR_NONE') {
      detectedArchetype = 'FAKE_TRADING_APP_OR_PORTAL';
      maxArchetypeProb = 0.91;
    }
  }

  // Pattern 8: Recovery Scam
  if (features.recovery.isRecoveryServiceClaim) {
    highRiskHits += 2;
    notes.push('Claims to guarantee recovery of previously scammed funds for an upfront fee.');
    if (detectedArchetype === 'OTHER_OR_NONE') {
      detectedArchetype = 'OTHER_OR_NONE';
      maxArchetypeProb = 0.85;
    }
  }

  // Pattern 9: Task / Job Investment Scam
  if (features.jobTasks.isTaskCompletionScheme || features.jobTasks.requiresDepositToUnlockTasks) {
    highRiskHits += 2;
    notes.push('Part-time rating/like job scheme requiring prepaid deposits to unlock task commission.');
    if (detectedArchetype === 'OTHER_OR_NONE') {
      detectedArchetype = 'PRE_APPROVED_LOAN_SCAM';
      maxArchetypeProb = 0.89;
    }
  }

  // Pattern 10: Impersonation of Regulators / Authorities
  if (features.impersonation.impersonatesRegulator || features.impersonation.impersonatesBank || features.socialPressure.hasAuthorityPressure) {
    highRiskHits += 2;
    notes.push('Impersonates regulator, bank officer, or cyber law enforcement under threat/fear.');
    if (detectedArchetype === 'OTHER_OR_NONE') {
      detectedArchetype = 'FAKE_ADVISORY_OR_REG_CLAIM';
      maxArchetypeProb = 0.9;
    }
  }

  // Pattern 11: Technical / Lookalike URL
  if (features.technicalUrls.hasLookalikeDomain || features.technicalUrls.hasPunycodeDomain) {
    highRiskHits += 2;
    notes.push('Contains lookalike or punycode domain impersonating an official financial portal.');
    if (detectedArchetype === 'OTHER_OR_NONE') {
      detectedArchetype = 'FAKE_TRADING_APP_OR_PORTAL';
    }
    maxArchetypeProb = Math.max(maxArchetypeProb, 0.88);
  }

  // Pattern 12: Generic Financial Promotion + Social Proof / Secrecy + Group Recruitment / App CTA
  if (
    !hasEducationalOrQuestionRole &&
    features.promises.hasPromise &&
    (features.socialPressure.hasExclusiveOpportunityClaim || features.socialPressure.hasSecrecy || features.socialPressure.hasScarcity) &&
    (features.socialPressure.invitesVipGroup || features.deviceAccess.asksUnknownApkDownload || features.payment.hasPaymentRequest)
  ) {
    highRiskHits += 2;
    notes.push('Combines financial earnings promotion with social proof/secrecy and a group invitation or application download call-to-action.');
    if (detectedArchetype === 'OTHER_OR_NONE') {
      detectedArchetype = 'OTHER_SUSPICIOUS_FINANCIAL_PATTERN';
      maxArchetypeProb = Math.max(maxArchetypeProb, 0.9);
    }
  }

  // Decision Matrix Assignment
  let finalBand: RiskBand = 'CANNOT_VERIFY';
  let confidence = 0.5;

  if (highRiskHits >= 2 || features.credentials.asksOtp || features.deviceAccess.asksRemoteSoftware) {
    finalBand = 'HIGH';
    confidence = Math.min(0.98, 0.8 + highRiskHits * 0.05);
  } else if (highRiskHits === 1 || features.socialPressure.invitesVipGroup) {
    finalBand = 'MEDIUM';
    confidence = 0.75;
  } else if (features.detectedFeatureCount === 0) {
    finalBand = 'CANNOT_VERIFY';
    confidence = 0.5;
  } else {
    finalBand = 'LOW_SIGNALS';
    confidence = 0.6;
  }

  return {
    finalBand,
    topArchetype: {
      top: detectedArchetype,
      prob: maxArchetypeProb,
    },
    confidence,
    reasoningNotes: notes,
  };
}
