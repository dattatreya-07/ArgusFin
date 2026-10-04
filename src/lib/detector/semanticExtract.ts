import { ExtractedClaims, Lang } from '@/lib/types';
import { extractClaims } from '@/lib/extract';
import { SemanticFeatureModel, FeatureProvenance, EvidenceRole, SignalCategory } from '@/lib/scam/features';
import { SemanticEvidence } from '@/lib/semantic/types';

/**
 * Extracts evidence role from text snippet.
 */
export function detectEvidenceRole(text: string): EvidenceRole {
  const lower = text.toLowerCase().trim();

  // 1. NEGATED
  if (
    /\b(do not|don't|never|cannot|no one should|banks do not|sebi does not|rbi does not|நம்பாதீர்கள்|ஆகாது|मत करें|कभी नहीं)\b/i.test(
      lower
    ) && !/\b(no loss|full guaranteed|100% guaranteed)\b/i.test(lower)
  ) {
    return 'NEGATED';
  }

  // 2. WARNING_ABOUT_SCAM
  if (
    /\b(warned|warning|alert|scam awareness|cybercrime alert|beware|learned in|literacy class|scam example|police alert|sebi warning|rbi alert|எச்சரிக்கை|सावधान)\b/i.test(
      lower
    )
  ) {
    return 'WARNING_ABOUT_SCAM';
  }

  // 3. ASKED_AS_QUESTION
  const hasActiveSolicitationInRole = /\b(add|download|install|join|chat group|earn \d|investing in)\b/i.test(lower);
  if (
    !hasActiveSolicitationInRole &&
    (/\b(what is|what are|why do|how does|how can|can a|could a|is it|is copy trading|meaning of|definition of|calculate|कैलकुलेट|என்ன|ஏன்|எப்படி)\b/i.test(
      lower
    ) ||
    lower.endsWith('?'))
  ) {
    return 'ASKED_AS_QUESTION';
  }

  // 4. EXPLAINED_AS_CONCEPT
  if (
    /\b(fixed deposit|fd|g-sec|government securities|mutual fund|sovereign guarantee|backed by rbi|set by banks|equity market|sip|cagr|annual return|bank interest|சட்டப்பூர்வ|வங்கி)\b/i.test(
      lower
    ) &&
    !/\b(invest now|transfer|pay fee|whatsapp|telegram|vip group|double your money)\b/i.test(lower)
  ) {
    return 'EXPLAINED_AS_CONCEPT';
  }

  // 5. QUOTED_EXAMPLE / HYPOTHETICAL
  if (/\b(he said|she said|claims that|suppose|hypothetically|for example|instance|they say|சொன்னார்கள்|कहते हैं)\b/i.test(lower) || /^["'].*["']$/.test(lower)) {
    return 'QUOTED_EXAMPLE';
  }

  // 6. REQUESTED_FROM_USER
  if (
    /\b(pay|send|transfer|deposit|share otp|enter pin|download|install|recharge|join vip|click link|பகிரவும்|அனுப்பவும்|भेजें|पे करें|शेयर करें)\b/i.test(
      lower
    )
  ) {
    return 'REQUESTED_FROM_USER';
  }

  // 7. CLAIMED_BY_SENDER
  if (/\b(guaranteed|guarantee|fixed profit|100% profit|no loss|double your|10% daily|20% daily|உத்தரவாதம்|गारंटी)\b/i.test(lower)) {
    return 'CLAIMED_BY_SENDER';
  }

  return 'DESCRIBED_BY_USER';
}

/**
 * Categorizes signal into conceptual, behavioral, direct request, or user harm.
 */
export function detectSignalCategory(text: string): SignalCategory {
  const lower = text.toLowerCase();
  if (/\b(otp|pin|password|cvv|anydesk|remote desktop|teamviewer|screen share|private key)\b/i.test(lower)) {
    return 'USER_HARM_SIGNAL';
  }
  if (/\b(pay|transfer|deposit|send money|recharge|payment|registration fee|activation fee)\b/i.test(lower)) {
    return 'DIRECT_REQUEST_SIGNAL';
  }
  if (/\b(guaranteed|fixed profit|double money|unrealistic|high yield|vip group)\b/i.test(lower)) {
    return 'BEHAVIORAL_SIGNAL';
  }
  return 'CONCEPTUAL_SIGNAL';
}

/**
 * Normalizes numbers written in words or mixed scripts across EN, HI, TA, Hinglish, Tanglish.
 */
function parsePercentageFromText(text: string): number | undefined {
  const lower = text.toLowerCase();
  
  // 1. Literal percentage pattern (e.g., 5%, 10 %, 5 percent, 5 प्रतिशत, 5 சதவீதம்)
  const pctMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:%|percent|per cent|प्रतिशत|சதவீதம்|pratishat)/i);
  if (pctMatch) {
    return parseFloat(pctMatch[1]);
  }

  // 2. Paraphrased multipliers (e.g., 2x, 5x, 100%, double, 2 गुना, 2 மடங்கு)
  if (/\b(?:double|दोगुना|இரட்டிப்பு|2x|doubling)\b/i.test(lower)) {
    return 100;
  }
  if (/\b(?:triple|3x|तीन गुना|மூன்று மடங்கு)\b/i.test(lower)) {
    return 200;
  }

  return undefined;
}

/**
 * Extracts daily/weekly/monthly/yearly return cadence from paraphrased text across EN, HI, TA.
 */
function parseCadenceFromText(text: string): 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' | 'ONCE' | 'UNKNOWN' {
  const lower = text.toLowerCase();

  if (/\b(?:daily|every day|per day|each day|every morning|रोजाना|हर दिन|प्रतिदिन|தினசரி|ஒவ்வொரு நாளும்|rozana|har din)\b/i.test(lower)) {
    return 'DAILY';
  }
  if (/\b(?:weekly|every week|per week|हर हफ्ते|प्रति सप्ताह|வாராந்திர|ஒவ்வொரு வாரமும்|har hafte)\b/i.test(lower)) {
    return 'WEEKLY';
  }
  if (/\b(?:monthly|every month|per month|हर महीने|प्रति माह|மாதாந்திர|ஒவ்வொரு மாதமும்|har mahine|per month)\b/i.test(lower)) {
    return 'MONTHLY';
  }
  if (/\b(?:yearly|annual|per annum|p\.a\.|वार्षिक|हर साल|ஆண்டு|வருடாந்திர|p\.a)\b/i.test(lower)) {
    return 'YEARLY';
  }

  return 'UNKNOWN';
}

/**
 * Performs deep multi-lingual semantic extraction of scam claims, behaviors, and risk features.
 */
export function extractSemanticFeatures(
  text: string,
  lang: Lang = 'en',
  existingClaims?: ExtractedClaims,
  semanticEvidence?: SemanticEvidence
): SemanticFeatureModel {
  const lower = text.toLowerCase();
  const claims = existingClaims || extractClaims(text, lang);
  const role = detectEvidenceRole(text);
  const category = detectSignalCategory(text);

  // Initialize Provenance Builder
  const createProvenance = (
    extractedFrom: FeatureProvenance['extractedFrom'],
    textSnippet?: string,
    confidence = 0.9
  ): FeatureProvenance[] => [{ extractedFrom, textSnippet: textSnippet?.substring(0, 100), confidence, role, category }];

  // 1. FINANCIAL PROMISES
  const pct = parsePercentageFromText(text);
  const cadence = parseCadenceFromText(text);

  const hasSemanticGuaranteed = semanticEvidence?.claims.some(
    (c) => c.type === 'GUARANTEED_RETURN'
  );
  const hasSemanticPromise = semanticEvidence?.claims.some(
    (c) =>
      c.type === 'RETURN_OR_PROFIT' ||
      c.type === 'GUARANTEED_RETURN' ||
      c.type === 'DOUBLING_MULTIPLICATION' ||
      c.type === 'LOW_RISK_HIGH_RETURN'
  );

  const isGuaranteedOrFixed =
    /\b(guarantee|guaranteed|fixed return|sure profit|100% safe|100% win|no risk|zero risk|पक्का|गारंटी|உத்தரவாதம்|அபாயமில்லை|no loss|sure shot)\b/i.test(
      lower
    ) ||
    claims.promisedReturns.some((r) => r.guaranteed === true) ||
    Boolean(hasSemanticGuaranteed);

  const hasNoLossClaim = /\b(no loss|zero loss|loss free|100% win|नुकसान नहीं|இழப்பில்லை)\b/i.test(lower);
  const hasCompoundingClaim = /\b(compound|compounding|reinvest|चक्रवृद्धि|கூட்டு வட்டி)\b/i.test(lower);

  // Evaluate yield realistic boundary (Annualized > 30% is suspicious, > 100% is unrealistic)
  let isUnrealisticReturn = false;
  if (pct !== undefined) {
    if (cadence === 'DAILY' && pct >= 0.5) isUnrealisticReturn = true; // 0.5% daily = ~500% annualized
    if (cadence === 'WEEKLY' && pct >= 2) isUnrealisticReturn = true;
    if (cadence === 'MONTHLY' && pct >= 5) isUnrealisticReturn = true;
    if (cadence === 'YEARLY' && pct >= 35) isUnrealisticReturn = true;
    if (pct >= 50) isUnrealisticReturn = true; // 50%+ lump return is unrealistic
  }

  const hasPromise = claims.promisedReturns.length > 0 || pct !== undefined || isGuaranteedOrFixed || Boolean(hasSemanticPromise);

  const promisesFeature = {
    hasPromise,
    promisedAmount: claims.promisedReturns[0]?.multiple ? claims.promisedReturns[0].multiple : undefined,
    promisedPercentage: pct || (claims.promisedReturns[0]?.multiple ? claims.promisedReturns[0].multiple * 100 : undefined),
    timeframe: claims.promisedReturns[0]?.durationDays ? `${claims.promisedReturns[0].durationDays} days` : undefined,
    cadence,
    isGuaranteedOrFixed,
    hasNoLossClaim,
    hasCompoundingClaim,
    isUnrealisticReturn,
    provenance: hasPromise ? createProvenance('SEMANTIC_EXTRACTOR', text) : [],
  };

  // 2. PAYMENT BEHAVIOR
  const hasSemanticPayment = semanticEvidence?.requests.some((r) =>
    ['SEND_MONEY', 'PAY_FEE_OR_TAX', 'MULE_PAYMENT'].includes(r.type)
  );
  const isAdvancePayment =
    /\b(advance|upfront|before|deposit first|registration fee|activation fee|joining fee|अग्रिम|முன்பணம்|pehle)\b/i.test(
      lower
    ) ||
    Boolean(
      semanticEvidence?.behavioralMechanisms.some((b) => b.type === 'ADVANCE_FEE') ||
      semanticEvidence?.requests.some((r) => r.type === 'PAY_FEE_OR_TAX')
    );

  let feeType: 'REGISTRATION' | 'ACTIVATION' | 'WITHDRAWAL' | 'TAX_CLEARANCE' | 'SECURITY_DEPOSIT' | 'UNFREEZE' | 'OTHER' | undefined;
  if (/\b(registration|joining|membership|रजिस्ट्रेशन|பதிவு)\b/i.test(lower)) feeType = 'REGISTRATION';
  else if (/\b(activation|activate|सक्रियकरण|செயல்படுத்தல்)\b/i.test(lower)) feeType = 'ACTIVATION';
  else if (/\b(withdrawal|withdraw|निकासी|திரும்பப் பெறுதல்)\b/i.test(lower) || semanticEvidence?.behavioralMechanisms.some((b) => b.type === 'WITHDRAWAL_BLOCKING')) feeType = 'WITHDRAWAL';
  else if (/\b(tax|clearance|gst|customs|टैक्स|வரி)\b/i.test(lower)) feeType = 'TAX_CLEARANCE';
  else if (/\b(security deposit|deposit|सुरक्षा जमा|பாதுகாப்பு வைப்பு)\b/i.test(lower) && !/\b(fixed deposit|recurring deposit|bank deposit|fd|rd)\b/i.test(lower)) feeType = 'SECURITY_DEPOSIT';
  else if (/\b(unfreeze|unlock|unblock|अनफ्रीज)\b/i.test(lower)) feeType = 'UNFREEZE';
  else if (hasSemanticPayment) feeType = 'OTHER';

  let method: 'PERSONAL_UPI' | 'PERSONAL_BANK' | 'CRYPTO' | 'GIFT_CARD' | 'UNKNOWN' | undefined;
  if (/@(?:upi|ybl|paytm|okhdfcbank|oksbi|ibl)\b/i.test(lower) || /\b(upi|gpay|phonepe|paytm)\b/i.test(lower)) {
    method = 'PERSONAL_UPI';
  } else if (/\b(crypto|usdt|btc|eth|binance|trc20)\b/i.test(lower) || semanticEvidence?.financialContext === 'CRYPTO') {
    method = 'CRYPTO';
  } else if (/\b(bank transfer|account number|ifsc|खाता)\b/i.test(lower) || semanticEvidence?.behavioralMechanisms.some((b) => b.type === 'PERSONAL_ACCOUNT_PAYMENT')) {
    method = 'PERSONAL_BANK';
  }

  const hasPaymentRequest = claims.requests.length > 0 || isAdvancePayment || feeType !== undefined || method !== undefined || Boolean(hasSemanticPayment);

  const paymentFeature = {
    hasPaymentRequest,
    isAdvancePayment,
    feeType,
    method,
    requiresPaymentBeforeAccessOrWithdrawal: isAdvancePayment || feeType === 'WITHDRAWAL' || feeType === 'TAX_CLEARANCE' || feeType === 'UNFREEZE',
    provenance: hasPaymentRequest ? createProvenance(semanticEvidence ? 'SEMANTIC_AI' : 'SEMANTIC_EXTRACTOR', text) : [],
  };

  // 3. CREDENTIAL REQUESTS
  const isOtpRequest =
    (/\b(share|send|tell|enter|give|provide|disburse|verify|confirm)\b.*?\botp\b/i.test(lower) ||
      /\botp\b.*?\b(share|send|tell|enter|give|provide|disburse|verify|confirm|code)\b/i.test(lower) ||
      /\[OTP\]/i.test(lower) ||
      /\b(ओटीपी शेयर|ओटीपी भेजें|கடவுச்சொல் பகிரவும்)\b/i.test(lower) ||
      Boolean(semanticEvidence?.requests.some((r) => r.type === 'SHARE_OTP'))) &&
    !/\b(never share|don't share|do not share|otp confidentiality|what is otp|otp security|why banks send otp)\b/i.test(lower);

  const asksOtp = isOtpRequest;
  const asksPinOrPassword =
    /\b(pin|password|passcode|पासवर्ड|கடவுச்சொல்)\b/i.test(lower) ||
    Boolean(semanticEvidence?.requests.some((r) => r.type === 'SHARE_PASSWORD'));
  const asksBankingDetailsOrCard =
    /\b(card number|cvv|expiry|account credentials|netbanking|डेबिट कार्ड|வங்கி விவரங்கள்)\b/i.test(lower) ||
    Boolean(semanticEvidence?.requests.some((r) => r.type === 'SHARE_BANK_DETAILS'));
  const asksCvv = /\b(cvv|cvv2|security code)\b/i.test(lower);
  const asksSeedPhraseOrPrivateKey =
    /\b(seed phrase|private key|recovery phrase|secret words|12 words|24 words)\b/i.test(lower) ||
    Boolean(semanticEvidence?.requests.some((r) => r.type === 'CONNECT_WALLET'));
  const asksApiKey = /\b(api key|secret key|api secret)\b/i.test(lower);

  const credentialsFeature = {
    asksOtp,
    asksPinOrPassword,
    asksBankingDetailsOrCard,
    asksCvv,
    asksSeedPhraseOrPrivateKey,
    asksApiKey,
    provenance: asksOtp || asksPinOrPassword || asksBankingDetailsOrCard ? createProvenance(semanticEvidence ? 'SEMANTIC_AI' : 'DETERMINISTIC_REGEX', text) : [],
  };

  // 4. DEVICE / ACCESS REQUESTS
  const asksRemoteDesktop =
    /\b(anydesk|teamviewer|rustdesk|any desk|team viewer)\b/i.test(lower) ||
    Boolean(semanticEvidence?.requests.some((r) => r.type === 'REMOTE_ACCESS'));
  const asksScreenSharing =
    /\b(share screen|screen share|allow access|remote control|स्क्रीन शेयर)\b/i.test(lower) ||
    Boolean(semanticEvidence?.requests.some((r) => r.type === 'REMOTE_ACCESS'));
  const asksUnknownApkDownload =
    /\b(apk|sideload|install app|download application|apk file|एपीके)\b/i.test(lower) ||
    Boolean(semanticEvidence?.requests.some((r) => ['INSTALL_APK', 'DOWNLOAD_APPLICATION'].includes(r.type)));
  const asksBrowserExtension = /\b(extension|chrome extension|plugin)\b/i.test(lower);
  const asksRemoteSoftware = asksRemoteDesktop || asksScreenSharing || /\b(remote access|quicksupport)\b/i.test(lower);

  const deviceAccessFeature = {
    asksRemoteDesktop,
    asksScreenSharing,
    asksUnknownApkDownload,
    asksBrowserExtension,
    asksRemoteSoftware,
    provenance: asksRemoteSoftware || asksUnknownApkDownload ? createProvenance(semanticEvidence ? 'SEMANTIC_AI' : 'SEMANTIC_EXTRACTOR', text) : [],
  };

  // 5. SOCIAL PRESSURE
  const hasUrgency =
    claims.urgencyPhrases.length > 0 ||
    /\b(hurry|limited slots|fast|quick|expires in|today only|जल्दी|உடனடியாக|urgent)\b/i.test(lower) ||
    Boolean(semanticEvidence?.socialEngineering.some((s) => s.tactic === 'URGENCY'));
  const hasScarcity =
    /\b(only 5 left|limited offer|exclusive slot|few seats|केवल कुछ सीट)\b/i.test(lower) ||
    Boolean(semanticEvidence?.socialEngineering.some((s) => s.tactic === 'SCARCITY' || s.tactic === 'EXCLUSIVITY'));
  const hasSecrecy =
    /\b(don't tell|keep secret|private|do not share with bank|गुप्त|ரகசியம்)\b/i.test(lower) ||
    Boolean(semanticEvidence?.socialEngineering.some((s) => s.tactic === 'SECRECY' || s.tactic === 'CURIOSITY_HOOK'));
  const invitesVipGroup =
    /\b(vip group|vip channel|telegram group|whatsapp group|trading group|वीआईपी)\b/i.test(lower) ||
    Boolean(semanticEvidence?.requests.some((r) => r.type === 'JOIN_GROUP') || semanticEvidence?.behavioralMechanisms.some((b) => b.type === 'GROUP_RECRUITMENT'));
  const hasAuthorityPressure =
    /\b(police|sebi notice|rbi order|court warrant|arrest|अरेस्ट|கைது)\b/i.test(lower) ||
    Boolean(semanticEvidence?.socialEngineering.some((s) => s.tactic === 'AUTHORITY_IMPERSONATION'));
  const hasThreatOrFear =
    /\b(account frozen|legal action|penalty|fine|jail|जेल|சிறை)\b/i.test(lower) ||
    Boolean(semanticEvidence?.socialEngineering.some((s) => s.tactic === 'FEAR' || s.tactic === 'EMOTIONAL_PRESSURE'));
  const hasExclusiveOpportunityClaim =
    /\b(secret strategy|insider signal|guaranteed win|100% success)\b/i.test(lower) ||
    Boolean(semanticEvidence?.socialEngineering.some((s) => s.tactic === 'EXCLUSIVITY' || s.tactic === 'SOCIAL_PROOF'));

  const socialPressureFeature = {
    hasUrgency,
    hasScarcity,
    hasSecrecy,
    invitesVipGroup,
    hasAuthorityPressure,
    hasThreatOrFear,
    hasExclusiveOpportunityClaim,
    provenance: hasUrgency || invitesVipGroup || hasAuthorityPressure ? createProvenance(semanticEvidence ? 'SEMANTIC_AI' : 'SEMANTIC_EXTRACTOR', text) : [],
  };

  // 6. INVESTMENT MECHANISMS
  const isCopyTrading =
    /\b(copy trading|master trader|auto trade|mirror trading|कॉपी ट्रेडिंग|காப்பி டிரேடிங்)\b/i.test(lower) ||
    Boolean(semanticEvidence?.financialContext === 'COPY_TRADING' || semanticEvidence?.behavioralMechanisms.some((b) => b.type === 'COPY_TRADING'));
  const isManagedTrading = /\b(managed account|pool account|fund manager|पूल अकाउंट)\b/i.test(lower);
  const isTradingSignals = /\b(trading signals|vip signals|call option|buy call|put option|सिग्नल)\b/i.test(lower);
  const isCryptoStakingOrMining =
    /\b(crypto staking|liquidity mining|yield farming|usdt staking|माइनिंग|ஸ்டேக்கிங்)\b/i.test(lower) ||
    Boolean(semanticEvidence?.behavioralMechanisms.some((b) => b.type === 'CRYPTO_STAKING_MINING'));
  const isFakePlatformOrExchange =
    /\b(trading portal|investment app|fake exchange|unregistered portal)\b/i.test(lower) ||
    Boolean(semanticEvidence?.behavioralMechanisms.some((b) => b.type === 'FAKE_INVESTMENT_PORTAL' || b.type === 'FAKE_TRADING_APP'));
  const isFakeTradingApp = isFakePlatformOrExchange || asksUnknownApkDownload;
  const isIpoOrAllotmentClaim =
    /\b(ipo allotment|pre-ipo|hni quota|institutional quota|आईपीओ)\b/i.test(lower) ||
    Boolean(semanticEvidence?.financialContext === 'IPO_ALLOTMENT');
  const isUnregisteredAdvisory = /\b(tips provider|stock advisor|advisory service|सलाहकार)\b/i.test(lower);
  const isTaskOrJobInvestment =
    /\b(part time job|like youtube|rating task|task scam|होटल रेटिंग|பகுதி நேர வேலை)\b/i.test(lower) ||
    Boolean(semanticEvidence?.behavioralMechanisms.some((b) => b.type === 'TASK_OR_JOB_INVESTMENT'));

  const mechanismsFeature = {
    isCopyTrading,
    isManagedTrading,
    isTradingSignals,
    isCryptoStakingOrMining,
    isFakePlatformOrExchange,
    isFakeTradingApp,
    isIpoOrAllotmentClaim,
    isUnregisteredAdvisory,
    isTaskOrJobInvestment,
    provenance: isCopyTrading || isCryptoStakingOrMining || isTaskOrJobInvestment ? createProvenance(semanticEvidence ? 'SEMANTIC_AI' : 'SEMANTIC_EXTRACTOR', text) : [],
  };

  // 7. WITHDRAWAL PATTERNS
  const isWithdrawalBlocked =
    /\b(cannot withdraw|unable to withdraw|withdrawal pending|frozen account|निकासी रोक दी|திரும்பப் பெற முடியவில்லை)\b/i.test(lower) ||
    Boolean(semanticEvidence?.behavioralMechanisms.some((b) => b.type === 'WITHDRAWAL_BLOCKING'));
  const demandsAdditionalPaymentForWithdrawal =
    role !== 'ASKED_AS_QUESTION' &&
    (/\b(pay to withdraw|tax to release|fee before withdrawal|withdrawal fee)\b/i.test(lower) ||
      Boolean(semanticEvidence?.behavioralMechanisms.some((b) => b.type === 'ADVANCE_FEE') && isWithdrawalBlocked));
  const demandsTaxOrVerificationBeforeWithdrawal = demandsAdditionalPaymentForWithdrawal || feeType === 'TAX_CLEARANCE';
  const hasRepeatedEscalation = /\b(more money|another deposit|level 2 deposit|upgrade account)\b/i.test(lower);

  const withdrawalFeature = {
    isWithdrawalBlocked,
    demandsAdditionalPaymentForWithdrawal,
    demandsTaxOrVerificationBeforeWithdrawal,
    hasRepeatedEscalation,
    provenance: isWithdrawalBlocked || demandsAdditionalPaymentForWithdrawal ? createProvenance(semanticEvidence ? 'SEMANTIC_AI' : 'SEMANTIC_EXTRACTOR', text) : [],
  };

  // 8. IMPERSONATION
  const impersonatesRegulator =
    /\b(sebi official|rbi officer|sec agent|sebi team|सेबी)\b/i.test(lower) ||
    Boolean(semanticEvidence?.claims.some((c) => c.type === 'AUTHORITY_CLAIM'));
  const impersonatesBank = /\b(sbi manager|hdfc fraud department|icici manager|बैंक प्रबंधक)\b/i.test(lower);
  const impersonatesBrokerOrExchange = /\b(zerodha support|groww team|binance agent|angel one admin)\b/i.test(lower);
  const impersonatesGovernmentOrPolice =
    /\b(cyber crime police|cbi officer|income tax officer|साइबर पुलिस)\b/i.test(lower) ||
    Boolean(semanticEvidence?.socialEngineering.some((s) => s.tactic === 'AUTHORITY_IMPERSONATION'));
  const impersonatesKnownPerson = /\b(friend in trouble|relative emergency|boss request)\b/i.test(lower);

  const impersonationFeature = {
    impersonatesRegulator,
    impersonatesBank,
    impersonatesBrokerOrExchange,
    impersonatesGovernmentOrPolice,
    impersonatesKnownPerson,
    provenance: impersonatesRegulator || impersonatesBank || impersonatesGovernmentOrPolice ? createProvenance(semanticEvidence ? 'SEMANTIC_AI' : 'SEMANTIC_EXTRACTOR', text) : [],
  };

  // 9. TECHNICAL / URL SIGNALS
  const hasSuspiciousUrl = claims.urls.some((u) => !u.includes('sebi.gov.in') && !u.includes('rbi.org.in') && !u.includes('sangyan.in'));
  const hasLookalikeDomain = claims.urls.some((u) => /sebi|rbi|zerodha|groww|binance|nifty/i.test(u) && !u.endsWith('.gov.in') && !u.endsWith('.org.in'));
  const hasPunycodeDomain = claims.urls.some((u) => u.includes('xn--'));
  const hasShortenedUrl = claims.urls.some((u) => /bit\.ly|tinyurl|t\.co|cutt\.ly|shorturl/i.test(u));
  const hasCredentialCollectionForm = /\b(login page|enter credentials|bank login|verify account online)\b/i.test(lower);
  const hasSuspiciousQrUrl = /\b(upi:\/\/pay|qr code scan|scan to receive|scan to deposit)\b/i.test(lower);

  const technicalUrlsFeature = {
    hasSuspiciousUrl,
    hasLookalikeDomain,
    hasPunycodeDomain,
    hasShortenedUrl,
    hasCredentialCollectionForm,
    hasSuspiciousQrUrl,
    provenance: claims.urls.length > 0 ? createProvenance('URL_INTELLIGENCE', text) : [],
  };

  // 10. RECOVERY SCAMS
  const isRecoveryServiceClaim =
    /\b(funds recovery|recover lost money|cyber lawyer|hacker recover|धन वापसी|பணம் மீட்டெடுத்தல்)\b/i.test(lower) ||
    Boolean(semanticEvidence?.behavioralMechanisms.some((b) => b.type === 'RECOVERY_SCAM'));
  const promisesFundsRecovery = isRecoveryServiceClaim || /\b(100% guaranteed recovery|get your scammed money back)\b/i.test(lower);
  const targetsPreviousVictim = /\b(were you scammed|lost money to|victim of scam)\b/i.test(lower);
  const demandsRecoveryFee = isRecoveryServiceClaim && isAdvancePayment;

  const recoveryFeature = {
    isRecoveryServiceClaim,
    promisesFundsRecovery,
    targetsPreviousVictim,
    demandsRecoveryFee,
    provenance: isRecoveryServiceClaim ? createProvenance(semanticEvidence ? 'SEMANTIC_AI' : 'SEMANTIC_EXTRACTOR', text) : [],
  };

  // 11. JOB / TASK PATTERNS
  const isTaskCompletionScheme = isTaskOrJobInvestment;
  const requiresDepositToUnlockTasks = /\b(deposit to unlock|recharge balance to get tasks|task deposit|टास्क रिचार्ज)\b/i.test(lower);
  const requiresCommissionWithdrawalDeposit = /\b(pay commission|deposit to withdraw salary)\b/i.test(lower);
  const hasEscalatingTaskDeposits = /\b(next task 5000|vip task 20000|level 3 task)\b/i.test(lower);

  const jobTasksFeature = {
    isTaskCompletionScheme,
    requiresDepositToUnlockTasks,
    requiresCommissionWithdrawalDeposit,
    hasEscalatingTaskDeposits,
    provenance: isTaskCompletionScheme ? createProvenance(semanticEvidence ? 'SEMANTIC_AI' : 'SEMANTIC_EXTRACTOR', text) : [],
  };

  // 12. UNKNOWN / OTHER NOVEL SUSPICIOUS BEHAVIOR
  const hasNovelBehavior =
    Boolean(semanticEvidence?.behavioralMechanisms.some((b) => b.type === 'NOVEL_OR_UNKNOWN_SUSPICIOUS')) ||
    (!promisesFeature.hasPromise &&
      !paymentFeature.hasPaymentRequest &&
      (socialPressureFeature.invitesVipGroup || deviceAccessFeature.asksRemoteSoftware || withdrawalFeature.isWithdrawalBlocked));

  const unknownOtherFeature = {
    hasNovelSuspiciousBehavior: hasNovelBehavior,
    behaviorDescription: hasNovelBehavior ? 'Suspicious financial channel invite or device access request without explicit numerical return claim' : undefined,
    provenance: hasNovelBehavior ? createProvenance(semanticEvidence ? 'SEMANTIC_AI' : 'SEMANTIC_EXTRACTOR', text) : [],
  };

  // Calculate overall feature suspicion score
  let suspiciousFeatureCount = 0;
  if (promisesFeature.isGuaranteedOrFixed) suspiciousFeatureCount += 2;
  if (promisesFeature.isUnrealisticReturn) suspiciousFeatureCount += 2;
  if (paymentFeature.requiresPaymentBeforeAccessOrWithdrawal) suspiciousFeatureCount += 3;
  if (credentialsFeature.asksOtp || credentialsFeature.asksBankingDetailsOrCard) suspiciousFeatureCount += 3;
  if (deviceAccessFeature.asksRemoteSoftware) suspiciousFeatureCount += 3;
  if (socialPressureFeature.invitesVipGroup) suspiciousFeatureCount += 1;
  if (socialPressureFeature.hasAuthorityPressure) suspiciousFeatureCount += 2;
  if (mechanismsFeature.isCopyTrading || mechanismsFeature.isTaskOrJobInvestment) suspiciousFeatureCount += 2;
  if (withdrawalFeature.isWithdrawalBlocked) suspiciousFeatureCount += 3;
  if (recoveryFeature.isRecoveryServiceClaim) suspiciousFeatureCount += 2;
  if (jobTasksFeature.isTaskCompletionScheme) suspiciousFeatureCount += 2;

  const score = Math.min(1.0, suspiciousFeatureCount / 5.0);

  return {
    promises: promisesFeature,
    payment: paymentFeature,
    credentials: credentialsFeature,
    deviceAccess: deviceAccessFeature,
    socialPressure: socialPressureFeature,
    mechanisms: mechanismsFeature,
    withdrawal: withdrawalFeature,
    impersonation: impersonationFeature,
    technicalUrls: technicalUrlsFeature,
    recovery: recoveryFeature,
    jobTasks: jobTasksFeature,
    unknownOther: unknownOtherFeature,
    overallSuspicionScore: score,
    detectedFeatureCount: suspiciousFeatureCount,
  };
}
