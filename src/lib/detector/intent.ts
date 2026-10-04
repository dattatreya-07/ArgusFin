export type QueryIntent =
  | 'EDUCATIONAL_QA'
  | 'CONTENT_ANALYSIS'
  | 'CALCULATOR_NUMERIC'
  | 'REPORTING'
  | 'UNKNOWN';

export interface ClassifiedIntent {
  intent: QueryIntent;
  confidence: number;
  reasoning: string;
}

/**
 * Classifies incoming user query intent to route appropriately across Educational Q&A, Content Analysis, Calculator, or Reporting.
 */
export function classifyQueryIntent(query: string): ClassifiedIntent {
  const lower = query.toLowerCase().trim();

  // 1. REPORTING Intent
  if (
    /\b(report|file complaint|incident|cybercrime|1930|lost money|scammed|pre-filing|victim report|शिकायत|அறிக்கை)\b/i.test(lower) &&
    /\b(how to|help me|prepare|file|submit|process|portal)\b/i.test(lower)
  ) {
    return {
      intent: 'REPORTING',
      confidence: 0.9,
      reasoning: 'User is asking for incident reporting guidance or complaint preparation.',
    };
  }

  // 2. CALCULATOR_NUMERIC Intent
  if (
    /\b(calculate|cagr|annualised|yield|compounding|calculator|what is the return|math|10000 to|5% daily|कैलकुलेटर|கணக்கீடு)\b/i.test(
      lower
    ) &&
    !/\b(is this a scam|suspicious|check this|is it safe|got this message|should i pay)\b/i.test(lower)
  ) {
    return {
      intent: 'CALCULATOR_NUMERIC',
      confidence: 0.88,
      reasoning: 'User is asking for mathematical yield calculation or compound return computation.',
    };
  }

  // 3. EDUCATIONAL_QA Intent (High Priority for Definition & Educational Queries)
  const isExplicitEducationalQuestion =
    /\b(what is|what are|why do|how does|how can|can a|could a|is copy trading|meaning of|definition of|explain|literacy class|backed by|set by banks|sovereign guarantee|g-sec|fixed deposit|fd|mutual fund|sip|sebi|rbi|nsdl|demat|kyc|staking|phishing techniques)\b/i.test(
      lower
    ) &&
    !/\b(is this message|is this link|check this|got this|should i pay|my mentor|download apk|anydesk|telegram group link)\b/i.test(lower);

  if (isExplicitEducationalQuestion) {
    return {
      intent: 'EDUCATIONAL_QA',
      confidence: 0.95,
      reasoning: 'User is asking an educational financial question or conceptual definition.',
    };
  }

  // 4. CONTENT_ANALYSIS Intent (User supplies suspicious message, transcript, link, or claim for evaluation)
  if (
    /\b(check|verify|is this a scam|is this fake|is it real|suspicious|legit|invest \d|pay \d|join vip|telegram group|whatsapp group|got this message|should i pay|download apk|anydesk|remote desktop|claim my profit|withdrawal tax)\b/i.test(
      lower
    ) ||
    /https?:\/\/|\.top|\.xyz|\.app|@upi|@okhdfcbank/i.test(lower) ||
    (!lower.endsWith('?') && lower.length > 40 && /\b(invest|profit|return|money|transfer|upi|pay|earn|deposit|recharge)\b/i.test(lower))
  ) {
    return {
      intent: 'CONTENT_ANALYSIS',
      confidence: 0.92,
      reasoning: 'User has provided suspicious message text, link, or claim for scam evaluation.',
    };
  }

  // 5. Default Question Check
  if (lower.endsWith('?')) {
    return {
      intent: 'EDUCATIONAL_QA',
      confidence: 0.85,
      reasoning: 'General inquiry ending with question mark defaulted to Educational Q&A.',
    };
  }

  // 6. Default Fallback
  return {
    intent: 'UNKNOWN',
    confidence: 0.6,
    reasoning: 'Input intent ambiguous or insufficient evidence.',
  };
}
