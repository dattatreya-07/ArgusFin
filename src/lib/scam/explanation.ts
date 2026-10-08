import { Archetype, ExtractedClaims, RiskBand, Signal } from '@/lib/types';
import { RuleResult } from '@/lib/rules';

export interface DetectedSignalContribution {
  type: string;
  label: string;
  evidence: string;
  explanation: string;
  contribution: number;
}

export interface ScoreCalculationBreakdown {
  baseScore: number;
  contributions: number[];
  finalScore: number; // 0..100
}

export interface RiskAnalysisExplanation {
  score: number;
  band: RiskBand;
  summary: string;
  detectedSignals: DetectedSignalContribution[];
  calculation: ScoreCalculationBreakdown;
  confidence: number;
  limitations: string[];
  actionSteps: string[];
}

/**
 * Deterministically constructs itemized signal contributions and score breakdown
 * derived authoritatively from detected rule flags, claims, signals, and pattern matches.
 * Never invents unsupported signals or overrides deterministic risk decisions.
 */
export function buildStructuredExplanation(options: {
  band: RiskBand;
  confidence: number;
  archetype: Archetype;
  flags: RuleResult[];
  signals: Signal[];
  claims: ExtractedClaims;
  rawText?: string;
}): RiskAnalysisExplanation {
  const { band, confidence, archetype, flags, signals, claims, rawText = '' } = options;
  const lowerText = rawText.toLowerCase();

  const detectedSignals: DetectedSignalContribution[] = [];
  const contributions: number[] = [];

  // Check if text is benign/educational context (e.g. general disclosures or advice)
  const isEducationalBenign =
    /\b(equity mutual funds|market risk|historical returns|past performance|fixed deposit|fd|sovereign gold bond|public provident fund|ppf|epf)\b/i.test(
      lowerText
    ) &&
    /\b(do not guarantee|does not guarantee|risk factors|read all scheme related documents)\b/i.test(lowerText) &&
    !/\b(pay|transfer|deposit|send ₹|send rs|won ₹|won rs|apk|anydesk|teamviewer)\b/i.test(lowerText);

  if (!isEducationalBenign && (band === 'HIGH' || band === 'MEDIUM')) {
    // 1. Unrealistic Return & Doubling Claims (+25)
    if (
      claims.promisedReturns.length > 0 ||
      flags.some((f) => f.ruleId.includes('RETURN') || f.ruleId.includes('PROMISE') || f.ruleId.includes('DOUBLING')) ||
      /\b(guaranteed|\d+%\s*daily|\d+%\s*weekly|double your money|100k a month|earn \d+k|daily yield|vip yield|10% daily)\b/i.test(lowerText)
    ) {
      const returnDetail = claims.promisedReturns[0];
      const evidenceText = returnDetail
        ? `Promised ${returnDetail.multiple ? `${returnDetail.multiple}x return` : 'unrealistic return rate'}`
        : 'Unrealistic return claim observed in message';
      detectedSignals.push({
        type: 'UNREALISTIC_RETURNS',
        label: 'Unrealistic Return Promise',
        evidence: evidenceText,
        explanation: 'Promises unusually high or guaranteed investment yields that exceed regulated market benchmarks.',
        contribution: 25,
      });
      contributions.push(25);
    }

    // 2. OTP & Credential Request (+25)
    if (
      claims.requests.includes('OTP') ||
      flags.some((f) => f.ruleId.includes('OTP') || f.ruleId.includes('CREDENTIAL')) ||
      /\b(otp|password|pin|netbanking password|net banking password|cvv|share otp)\b/i.test(lowerText)
    ) {
      detectedSignals.push({
        type: 'CREDENTIAL_REQUEST',
        label: 'OTP / Credential Harvesting Request',
        evidence: 'Direct request for one-time password (OTP) or banking credentials',
        explanation: 'Legitimate financial institutions and regulators never request OTPs, passwords, or PINs over chat or SMS.',
        contribution: 25,
      });
      contributions.push(25);
    }

    // 3. Remote Access & APK Download Bait (+25)
    if (
      claims.requests.includes('APP_INSTALL') ||
      flags.some((f) => f.ruleId.includes('REMOTE') || f.ruleId.includes('APK') || f.ruleId.includes('APP')) ||
      /\b(anydesk|teamviewer|quicksupport|rustdesk|\.apk|install the app|download.*apk|download.*app)\b/i.test(lowerText)
    ) {
      detectedSignals.push({
        type: 'REMOTE_ACCESS',
        label: 'Remote Access / External APK Software Directive',
        evidence: 'Instruction to install third-party APK or screen-sharing application',
        explanation: 'Attempts to gain remote control of your mobile device to intercept 2FA codes and access banking apps.',
        contribution: 25,
      });
      contributions.push(25);
    }

    // 4. Recovery Scam (+25)
    if (
      /\b(lost money|retrieve.*funds|lost.*crypto|recovery agent|recovery team|stolen funds)\b/i.test(lowerText)
    ) {
      detectedSignals.push({
        type: 'RECOVERY_SCAM',
        label: 'Secondary Recovery Scam Trap',
        evidence: 'Offer to recover previously lost funds in exchange for upfront fee',
        explanation: 'Secondary scammers target previous fraud victims with false promises of fund recovery for an advance charge.',
        contribution: 25,
      });
      contributions.push(25);
    }

    // 5. Investment Solicitation & VIP Channels (+20)
    if (
      claims.requests.includes('GROUP_JOIN') ||
      archetype === 'COPY_TRADING' ||
      archetype === 'PUMP_AND_DUMP_GROUP' ||
      flags.some((f) => f.ruleId.includes('GROUP') || f.ruleId.includes('ADVISORY') || f.ruleId.includes('VIP')) ||
      /\b(whatsapp group|telegram|vip channel|vip group|trading group|chat group)\b/i.test(lowerText)
    ) {
      detectedSignals.push({
        type: 'INVESTMENT_SOLICITATION',
        label: 'Unregulated Investment Channel Solicitation',
        evidence: 'Call to join private WhatsApp/Telegram trading channel or VIP group',
        explanation: 'Funneling users into private, unmonitored channels prevents public oversight and peer scrutiny.',
        contribution: 20,
      });
      contributions.push(20);
    }

    // 6. Urgency & Social Pressure (+20)
    if (
      claims.urgencyPhrases.length > 0 ||
      flags.some((f) => f.ruleId.includes('URGENCY')) ||
      /\b(immediately|urgent|within \d+ (minutes|hours)|tonight|suspended|disconnected|blocked|court summons)\b/i.test(lowerText)
    ) {
      detectedSignals.push({
        type: 'URGENCY_THREAT',
        label: 'Urgency & High-Pressure Persuasion',
        evidence: claims.urgencyPhrases[0] || 'Urgent countdown or account suspension threat',
        explanation: 'Manufactures artificial panic to force quick financial transfers before careful verification.',
        contribution: 20,
      });
      contributions.push(20);
    }

    // 7. Advance Fee / Prize Lottery Release (+20)
    if (
      claims.requests.includes('PAYMENT') ||
      flags.some((f) => f.ruleId.includes('FEE') || f.ruleId.includes('ADVANCE') || f.ruleId.includes('CLEARANCE')) ||
      /\b(won|lucky draw|processing fee|advance fee|registration fee|gate pass|release prize|release amount|clearance)\b/i.test(lowerText)
    ) {
      detectedSignals.push({
        type: 'ADVANCE_FEE',
        label: 'Advance Fee / Lottery Prize Release Charge',
        evidence: 'Directive to pay upfront fee to unlock prize, loan, or investment payout',
        explanation: 'Demands upfront payment before promised winnings or funds can allegedly be released.',
        contribution: 20,
      });
      contributions.push(20);
    }

    // 8. Suspicious Shortened Link / Domain (+15)
    if (
      claims.requests.includes('SHORT_LINK') ||
      claims.urls.length > 0 ||
      flags.some((f) => f.ruleId.includes('URL') || f.ruleId.includes('LINK') || f.ruleId.includes('DOMAIN')) ||
      /\b(https?:\/\/|bit\.ly|tinyurl|t\.me|\.xyz|\.top|\.link|\.biz)\b/i.test(lowerText)
    ) {
      detectedSignals.push({
        type: 'SUSPICIOUS_URL',
        label: 'Suspicious / Unverified URL Link',
        evidence: claims.urls[0] || 'Direct unverified link to external domain',
        explanation: 'Obfuscates actual destination domain to conceal unauthorized phishing or fake trading portals.',
        contribution: 15,
      });
      contributions.push(15);
    }
  }

  // Determine score calculation
  const baseScore = 0;
  let rawTotal = contributions.reduce((a, b) => a + b, baseScore);

  if (band === 'HIGH') {
    if (rawTotal < 70) {
      // Ensure high risk score reflects >= 70
      rawTotal = Math.max(75, rawTotal + 30);
    }
  } else if (band === 'MEDIUM') {
    if (rawTotal < 35) {
      rawTotal = 45;
    } else if (rawTotal >= 70) {
      rawTotal = 65;
    }
  } else {
    // LOW / CANNOT_VERIFY
    rawTotal = Math.min(20, rawTotal);
  }

  const finalScore = Math.min(100, Math.max(0, rawTotal));

  // Determine explainable summary
  let summary = '';
  if (band === 'HIGH') {
    if (detectedSignals.length > 0) {
      summary = `Identified high-risk indicators: ${detectedSignals
        .map((s) => s.label.toLowerCase())
        .slice(0, 3)
        .join(', ')}.`;
    } else {
      summary = 'High risk indicators detected based on multiple combined threat patterns.';
    }
  } else if (band === 'MEDIUM') {
    if (detectedSignals.length > 0) {
      summary = `Identified moderate risk signals (${detectedSignals.map((s) => s.label).join(', ')}). Proceed with caution.`;
    } else {
      summary = 'Moderate risk signals observed requiring independent regulatory verification.';
    }
  } else if (band === 'LOW_SIGNALS') {
    summary = 'No strong scam signals detected based on checked indicators. (This is not a guarantee of safety).';
  } else {
    summary = 'Cannot verify content validity from available source context.';
  }

  const actionSteps = [
    'Do not send money, OTPs, or passwords to unverified contacts.',
    'Do not click unverified links or install external APK screen-sharing tools.',
    'Verify any investment entity directly on official SEBI SCORES or RBI Sachet portals.',
    'Prepare an official incident record if money was transferred.',
  ];

  const limitations = [
    'Scoring reflects detected pattern signals and does not replace official regulatory background checks.',
    'Low risk indicates absence of known patterns in checked text, not an absolute guarantee.',
  ];

  return {
    score: finalScore,
    band,
    summary,
    detectedSignals,
    calculation: {
      baseScore,
      contributions,
      finalScore,
    },
    confidence,
    limitations,
    actionSteps,
  };
}
