import { Archetype, ExtractedClaims, Lang, RiskBand, Signal } from '@/lib/types';
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
  contextualObservations?: string;
  candidateIndicators?: Array<{ indicator: string; rationale: string; confidence: 'LOW' | 'MEDIUM' | 'HIGH' }>;
  hybridStatus?: string;
}

interface SignalLocaleStrings {
  label: string;
  evidenceFallback: string;
  explanation: string;
}

const SIGNAL_TRANSLATIONS: Record<Lang, Record<string, SignalLocaleStrings>> = {
  en: {
    UNREALISTIC_RETURNS: {
      label: 'Unrealistic Return Promise',
      evidenceFallback: 'Unrealistic return claim observed in message',
      explanation: 'Promises unusually high or guaranteed investment yields that exceed regulated market benchmarks.',
    },
    CREDENTIAL_REQUEST: {
      label: 'OTP / Credential Harvesting Request',
      evidenceFallback: 'Direct request for one-time password (OTP) or banking credentials',
      explanation: 'Legitimate financial institutions and regulators never request OTPs, passwords, or PINs over chat or SMS.',
    },
    REMOTE_ACCESS: {
      label: 'Remote Access / External APK Directive',
      evidenceFallback: 'Instruction to install third-party APK or screen-sharing application',
      explanation: 'Attempts to gain remote control of your mobile device to intercept 2FA codes and access banking apps.',
    },
    RECOVERY_SCAM: {
      label: 'Secondary Recovery Scam Trap',
      evidenceFallback: 'Offer to recover previously lost funds in exchange for upfront fee',
      explanation: 'Secondary scammers target previous fraud victims with false promises of fund recovery for an advance charge.',
    },
    INVESTMENT_SOLICITATION: {
      label: 'Unregulated Investment Channel Solicitation',
      evidenceFallback: 'Call to join private WhatsApp/Telegram trading channel or VIP group',
      explanation: 'Funneling users into private, unmonitored channels prevents public oversight and peer scrutiny.',
    },
    URGENCY_THREAT: {
      label: 'Urgency & High-Pressure Persuasion',
      evidenceFallback: 'Urgent countdown or account suspension threat',
      explanation: 'Manufactures artificial panic to force quick financial transfers before careful verification.',
    },
    ADVANCE_FEE: {
      label: 'Advance Fee / Lottery Prize Release Charge',
      evidenceFallback: 'Directive to pay upfront fee to unlock prize, loan, or investment payout',
      explanation: 'Demands upfront payment before promised winnings or funds can allegedly be released.',
    },
    SUSPICIOUS_URL: {
      label: 'Suspicious / Unverified URL Link',
      evidenceFallback: 'Direct unverified link to external domain',
      explanation: 'Obfuscates actual destination domain to conceal unauthorized phishing or fake trading portals.',
    },
  },
  hi: {
    UNREALISTIC_RETURNS: {
      label: 'अवास्तविक रिटर्न का वादा',
      evidenceFallback: 'संदेश में असामान्य रूप से उच्च या गारंटीकृत रिटर्न का दावा देखा गया',
      explanation: 'असामान्य रूप से उच्च या गारंटीकृत लाभ का वादा करता है जो भारतीय वित्तीय विनियामक (SEBI/RBI) मानकों से परे है।',
    },
    CREDENTIAL_REQUEST: {
      label: 'OTP / पासवर्ड चुराने का प्रयास',
      evidenceFallback: 'ओटीपी (OTP) या बैंक नेटबैंकिंग क्रेडेंशियल्स की सीधी मांग',
      explanation: 'वैध बैंक या वित्तीय संस्थान कभी भी चैट या एसएमएस पर ओटीपी, पासवर्ड या यूपीआई पिन नहीं मांगते हैं।',
    },
    REMOTE_ACCESS: {
      label: 'रिमोट एक्सेस / बाहरी APK डाउनलोड निर्देश',
      evidenceFallback: 'थर्ड-पार्टी APK या स्क्रीन-शेयरिंग ऐप (AnyDesk / TeamViewer) इंस्टॉल करने का निर्देश',
      explanation: 'आपके फोन पर रिमोट कंट्रोल हासिल करके 2FA ओटीपी कोड और बैंकिंग डेटा चुराने का प्रयास करता है।',
    },
    RECOVERY_SCAM: {
      label: 'द्वितीयक रिकवरी धोखाधड़ी का जाल',
      evidenceFallback: 'अग्रिम शुल्क के बदले पहले डूबे हुए पैसे वापस दिलाने का झूठा प्रस्ताव',
      explanation: 'धोखेबाज पहले से पीड़ित लोगों को उनके पैसे वापस दिलाने का लालच देकर और अधिक पैसे ऐंठते हैं।',
    },
    INVESTMENT_SOLICITATION: {
      label: 'अनियमित निवेश समूह / VIP चैनल आमंत्रण',
      evidenceFallback: 'निजी व्हाट्सएप/टेलीग्राम वीआईपी ट्रेडिंग ग्रुप में शामिल होने का बुलावा',
      explanation: 'सार्वजनिक कानूनी जांच से बचने के लिए निवेशकों को अनियंत्रित निजी चैट चैनलों में ले जाया जाता है।',
    },
    URGENCY_THREAT: {
      label: 'जल्दबाजी और दबाव बनाने की रणनीति',
      evidenceFallback: 'बिजली कटने, खाता ब्लॉक होने या कानूनी गिरफ्तारी की तात्कालिक धमकी',
      explanation: 'जांच-परख करने से पहले घबराहट में तुरंत पैसे ट्रांसफर करवाने के लिए कृत्रिम आतंक पैदा किया जाता है।',
    },
    ADVANCE_FEE: {
      label: 'अग्रिम शुल्क / लॉटरी रिलीज चार्ज मांग',
      evidenceFallback: 'पुरस्कार, लॉटरी या लोन की राशि जारी करने के लिए अग्रिम प्रोसेसिंग शुल्क की मांग',
      explanation: 'कथित इनाम या राशि जारी करने के नाम पर पीड़ित से पहले पैसे मांगे जाते हैं, जो पूरी तरह धोखाधड़ी है।',
    },
    SUSPICIOUS_URL: {
      label: 'संदिग्ध / असत्यापित वेब लिंक',
      evidenceFallback: 'शॉर्टनर या अनधिकृत डोमेन का सीधा लिंक',
      explanation: 'असली फ़िशिंग या फर्जी ट्रेडिंग वेबसाइट को छिपाने के लिए अनधिकृत या शॉर्ट लिंक का उपयोग किया गया है।',
    },
  },
  ta: {
    UNREALISTIC_RETURNS: {
      label: 'சாத்தியமற்ற வருமான வாக்குறுதி',
      evidenceFallback: 'செய்தியில் மிகைப்படுத்தப்பட்ட அல்லது சாத்தியமில்லாத வருமான உறுதிமொழி காணப்பட்டது',
      explanation: 'ஒழுங்குபடுத்தப்பட்ட இந்திய நிதிச் சந்தை அளவுகோல்களை விட மிக அதிகமான அல்லது உத்தரவாதமான வருமானத்தை உறுதியளிக்கிறது.',
    },
    CREDENTIAL_REQUEST: {
      label: 'OTP / கடவுச்சொல் பறிப்பு கோரிக்கை',
      evidenceFallback: 'ஒருமுறை கடவுச்சொல் (OTP) அல்லது வங்கி கணக்கு விவரங்களுக்கான நேரடி கோரிக்கை',
      explanation: 'சட்டப்பூர்வ வங்கிகளோ அல்லது நிதி நிறுவனங்களோ ஒருபோதும் வாட்ஸ்அப் அல்லது எஸ்எம்எஸ் மூலம் கடவுச்சொல் அல்லது OTP கேட்க மாட்டார்கள்.',
    },
    REMOTE_ACCESS: {
      label: 'தொலைநிலை அணுகல் / வெளி APK செயலி உத்தரவு',
      evidenceFallback: 'மூன்றாம் தரப்பு APK அல்லது திரை பகிர்வு செயலியை (AnyDesk/TeamViewer) நிறுவ அறிவுறுத்தல்',
      explanation: 'உங்கள் மொபைலை தொலைவிலிருந்து கட்டுப்படுத்தவும், வங்கி பரிவர்த்தனை OTP-களை படிக்கவும் முயல்கிறது.',
    },
    RECOVERY_SCAM: {
      label: 'இரண்டாம் நிலை மீட்பு மோசடிப் பொறி',
      evidenceFallback: 'முன்பணக் கட்டணத்திற்கு பதிலாக முன்பு இழந்த பணத்தை மீட்டுத் தருவதாக போலி வாக்குறுதி',
      explanation: 'ஏற்கனவே ஏமாந்த நபர்களை குறிவைத்து, இழந்த பணத்தை மீட்டுத் தருவதாகக் கூறி மீண்டும் பணம் பறிக்கும் தந்திரம்.',
    },
    INVESTMENT_SOLICITATION: {
      label: 'ஒழுங்குபடுத்தப்படாத முதலீட்டு குழு அழைப்பு',
      evidenceFallback: 'தனிப்பட்ட வாட்ஸ்அப்/டெலிகிராம் VIP வர்த்தகக் குழுவில் சேருவதற்கான அழைப்பு',
      explanation: 'பொதுமக்களின் மற்றும் அதிகாரிகளின் கண்காணிப்பைத் தவிர்க்க பயனர்களை தனிப்பட்ட ரகசியக் குழுக்களுக்கு மாற்ற முயல்கிறது.',
    },
    URGENCY_THREAT: {
      label: 'அவசரப்படுத்துதல் மற்றும் அச்சுறுத்தும் தந்திரம்',
      evidenceFallback: 'மின்சாரம் துண்டிப்பு, வங்கி முடக்கம் அல்லது கைது நடவடிக்கை பற்றிய உடனடி எச்சரிக்கை',
      explanation: 'சரிபார்க்கும் முன் பதற்றத்தில் உடனடியாக பணத்தை அனுப்ப வைப்பதற்காக போலியான பீதியை உருவாக்குகிறது.',
    },
    ADVANCE_FEE: {
      label: 'முன்பணக் கட்டணம் / பரிசு விடுவிப்புக் கட்டணம்',
      evidenceFallback: 'பரிசு அல்லது தொகையை விடுவிக்க முன்பணமாக செயலாக்கக் கட்டணம் செலுத்துமாறு கோரிக்கை',
      explanation: 'வாக்குறுதியளிக்கப்பட்ட பரிசு அல்லது கடனை விடுவிக்க முன்கூட்டியே பணம் செலுத்துமாறு கோருவது உறுதியான மோசடி அடையாளமாகும்.',
    },
    SUSPICIOUS_URL: {
      label: 'சந்தேகத்திற்கிடமான / சரிபார்க்கப்படாத இணைய இணைப்பு',
      evidenceFallback: 'சுருக்கப்பட்ட அல்லது சரிபார்க்கப்படாத வெளி டொமைன் இணைப்பு',
      explanation: 'போலி முதலீட்டு அல்லது ஃபிஷிங் வலைத்தளங்களை மறைப்பதற்காக சரிபார்க்கப்படாத இணைப்புகளைப் பயன்படுத்துகிறது.',
    },
  },
};

/**
 * Deterministically constructs itemized signal contributions and score breakdown
 * fully localized in English, Hindi, or Tamil according to the user's active session.
 */
export function buildStructuredExplanation(options: {
  band: RiskBand;
  confidence: number;
  archetype: Archetype;
  flags: RuleResult[];
  signals: Signal[];
  claims: ExtractedClaims;
  rawText?: string;
  lang?: Lang;
  contextualObservations?: string;
  candidateIndicators?: Array<{ indicator: string; rationale: string; confidence: 'LOW' | 'MEDIUM' | 'HIGH' }>;
  hybridStatus?: string;
}): RiskAnalysisExplanation {
  const {
    band,
    confidence,
    archetype,
    flags,
    signals,
    claims,
    rawText = '',
    lang = 'en',
    contextualObservations,
    candidateIndicators,
    hybridStatus,
  } = options;
  const currentLang: Lang = (['en', 'hi', 'ta'].includes(lang) ? lang : 'en') as Lang;
  const lowerText = rawText.toLowerCase();

  const detectedSignals: DetectedSignalContribution[] = [];
  const contributions: number[] = [];
  const translations = SIGNAL_TRANSLATIONS[currentLang] || SIGNAL_TRANSLATIONS.en;

  // Check if text is benign/educational context
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
      const t = translations.UNREALISTIC_RETURNS;
      const returnDetail = claims.promisedReturns[0];
      const evidenceText = returnDetail
        ? `${returnDetail.multiple ? `${returnDetail.multiple}x` : 'unrealistic'} return claim`
        : t.evidenceFallback;
      detectedSignals.push({
        type: 'UNREALISTIC_RETURNS',
        label: t.label,
        evidence: evidenceText,
        explanation: t.explanation,
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
      const t = translations.CREDENTIAL_REQUEST;
      detectedSignals.push({
        type: 'CREDENTIAL_REQUEST',
        label: t.label,
        evidence: t.evidenceFallback,
        explanation: t.explanation,
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
      const t = translations.REMOTE_ACCESS;
      detectedSignals.push({
        type: 'REMOTE_ACCESS',
        label: t.label,
        evidence: t.evidenceFallback,
        explanation: t.explanation,
        contribution: 25,
      });
      contributions.push(25);
    }

    // 4. Recovery Scam (+25)
    if (
      /\b(lost money|retrieve.*funds|lost.*crypto|recovery agent|recovery team|stolen funds)\b/i.test(lowerText)
    ) {
      const t = translations.RECOVERY_SCAM;
      detectedSignals.push({
        type: 'RECOVERY_SCAM',
        label: t.label,
        evidence: t.evidenceFallback,
        explanation: t.explanation,
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
      const t = translations.INVESTMENT_SOLICITATION;
      detectedSignals.push({
        type: 'INVESTMENT_SOLICITATION',
        label: t.label,
        evidence: t.evidenceFallback,
        explanation: t.explanation,
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
      const t = translations.URGENCY_THREAT;
      detectedSignals.push({
        type: 'URGENCY_THREAT',
        label: t.label,
        evidence: claims.urgencyPhrases[0] || t.evidenceFallback,
        explanation: t.explanation,
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
      const t = translations.ADVANCE_FEE;
      detectedSignals.push({
        type: 'ADVANCE_FEE',
        label: t.label,
        evidence: t.evidenceFallback,
        explanation: t.explanation,
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
      const t = translations.SUSPICIOUS_URL;
      detectedSignals.push({
        type: 'SUSPICIOUS_URL',
        label: t.label,
        evidence: claims.urls[0] || t.evidenceFallback,
        explanation: t.explanation,
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
      rawTotal = Math.max(75, rawTotal + 30);
    }
  } else if (band === 'MEDIUM') {
    if (rawTotal < 35) {
      rawTotal = 45;
    } else if (rawTotal >= 70) {
      rawTotal = 65;
    }
  } else {
    rawTotal = Math.min(20, rawTotal);
  }

  const finalScore = Math.min(100, Math.max(0, rawTotal));

  // Determine localized explainable summary
  let summary = '';
  if (currentLang === 'ta') {
    if (band === 'HIGH') {
      summary =
        detectedSignals.length > 0
          ? `கண்டறியப்பட்ட அதிக ஆபத்து எச்சரிக்கை அறிகுறிகள்: ${detectedSignals
              .map((s) => s.label)
              .slice(0, 3)
              .join(', ')}.`
          : 'பல தீவிர அச்சுறுத்தல் வடிவங்களின் அடிப்படையில் அதிக ஆபத்து கண்டறியப்பட்டது.';
    } else if (band === 'MEDIUM') {
      summary =
        detectedSignals.length > 0
          ? `மிதமான எச்சரிக்கை அறிகுறிகள் (${detectedSignals.map((s) => s.label).join(', ')}). எச்சரிக்கையுடன் தொடரவும்.`
          : 'விழிப்புடன் இருக்க வேண்டிய மிதமான ஆபத்து அறிகுறிகள் கண்டறியப்பட்டன.';
    } else if (band === 'LOW_SIGNALS') {
      summary = 'சரிபார்க்கப்பட்ட குறிகாட்டிகளில் தெளிவான மோசடி அறிகுறிகள் எதுவும் கண்டறியப்படவில்லை. (இது முழுமையான பாதுகாப்பிற்கான உத்தரவாதம் அல்ல).';
    } else {
      summary = 'கிடைக்கக்கூடிய தரவிலிருந்து உள்ளடக்கத்தின் நம்பகத்தன்மையை சரிபார்க்க முடியவில்லை.';
    }
  } else if (currentLang === 'hi') {
    if (band === 'HIGH') {
      summary =
        detectedSignals.length > 0
          ? `पहचाने गए गंभीर धोखाधड़ी संकेत: ${detectedSignals
              .map((s) => s.label)
              .slice(0, 3)
              .join(', ')}.`
          : 'कई गंभीर धोखाधड़ी पैटर्न के आधार पर उच्च जोखिम की पहचान की गई है।';
    } else if (band === 'MEDIUM') {
      summary =
        detectedSignals.length > 0
          ? `मध्यम जोखिम के संकेत मिले (${detectedSignals.map((s) => s.label).join(', ')}). कृपया सावधानी बरतें।`
          : 'स्वतंत्र नियामक सत्यापन की आवश्यकता वाले मध्यम जोखिम संकेत देखे गए।';
    } else if (band === 'LOW_SIGNALS') {
      summary = 'जांचे गए संकेतकों में कोई गंभीर धोखाधड़ी पैटर्न नहीं पाया गया। (यह पूर्ण सुरक्षा की गारंटी नहीं है)।';
    } else {
      summary = 'उपलब्ध संदर्भ से संदेश की वैधता की पुष्टि नहीं की जा सकती।';
    }
  } else {
    // English default
    if (band === 'HIGH') {
      summary =
        detectedSignals.length > 0
          ? `Identified high-risk indicators: ${detectedSignals
              .map((s) => s.label.toLowerCase())
              .slice(0, 3)
              .join(', ')}.`
          : 'High risk indicators detected based on multiple combined threat patterns.';
    } else if (band === 'MEDIUM') {
      summary =
        detectedSignals.length > 0
          ? `Identified moderate risk signals (${detectedSignals.map((s) => s.label).join(', ')}). Proceed with caution.`
          : 'Moderate risk signals observed requiring independent regulatory verification.';
    } else if (band === 'LOW_SIGNALS') {
      summary = 'No strong scam signals detected based on checked indicators. (This is not a guarantee of safety).';
    } else {
      summary = 'Cannot verify content validity from available source context.';
    }
  }

  // Localized Action Steps
  let actionSteps: string[] = [];
  if (currentLang === 'ta') {
    actionSteps = [
      'தெரியாத நபர்களுக்கு பணம், OTP அல்லது கடவுச்சொல்லை ஒருபோதும் அனுப்ப வேண்டாம்.',
      'சரிபார்க்கப்படாத வலைதள இணைப்புகளை கிளிக் செய்யாதீர்கள் அல்லது APK திரை பகிர்வு செயலிகளை நிறுவ வேண்டாம்.',
      'SEBI SCORES அல்லது RBI சசேத் (Sachet) இணையதளத்தில் நிறுவனத்தின் பதிவை நேரடியாக சரிபார்க்கவும்.',
      'பணம் இழந்திருந்தால் தேசிய சைபர் உதவி எண் 1930 அல்லது cybercrime.gov.in மூலம் உடனடியாக புகாரளிக்கவும்.',
    ];
  } else if (currentLang === 'hi') {
    actionSteps = [
      'अज्ञात संपर्कों को कभी भी पैसे, ओटीपी (OTP) या पासवर्ड न भेजें।',
      'अज्ञात लिंक पर क्लिक न करें और न ही बाहरी APK या स्क्रीन-शेयरिंग ऐप इंस्टॉल करें।',
      'SEBI SCORES या RBI Sachet पोर्टल पर किसी भी निवेश संस्था का आधिकारिक पंजीकरण जांचें।',
      'यदि धोखाधड़ी में पैसे कटे हैं तो राष्ट्रीय साइबर हेल्पलाइन 1930 या cybercrime.gov.in पर तुरंत रिपोर्ट दर्ज करें।',
    ];
  } else {
    actionSteps = [
      'Do not send money, OTPs, or passwords to unverified contacts.',
      'Do not click unverified links or install external APK screen-sharing tools.',
      'Verify any investment entity directly on official SEBI SCORES or RBI Sachet portals.',
      'Prepare an official incident record if money was transferred.',
    ];
  }

  // Localized Limitations
  let limitations: string[] = [];
  if (currentLang === 'ta') {
    limitations = [
      'இந்த மதிப்பீடு கண்டறியப்பட்ட வடிவங்களை மட்டுமே பிரதிபலிக்கிறது; இது அதிகாரப்பூர்வ ஒழுங்குமுறை சரிபார்ப்புக்கு மாற்றாகாது.',
      'குறைந்த அபாயம் என்பது அறியப்பட்ட மோசடி வடிவங்கள் இல்லாததைக் குறிக்கிறது, முழுமையான உத்தரவாதமல்ல.',
    ];
  } else if (currentLang === 'hi') {
    limitations = [
      'यह स्कोर पहचाने गए पैटर्न को दर्शाता है और आधिकारिक नियामक जांच का विकल्प नहीं है।',
      'कम जोखिम ज्ञात पैटर्न की अनुपस्थिति को दर्शाता है, यह पूर्ण सुरक्षा की गारंटी नहीं है।',
    ];
  } else {
    limitations = [
      'Scoring reflects detected pattern signals and does not replace official regulatory background checks.',
      'Low risk indicates absence of known patterns in checked text, not an absolute guarantee.',
    ];
  }

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
    contextualObservations,
    candidateIndicators,
    hybridStatus,
  };
}
