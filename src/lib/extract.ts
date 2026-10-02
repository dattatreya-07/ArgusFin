import { ExtractedClaims, Lang } from './types';
import * as enLex from './lexicon/en';
import * as hiLex from './lexicon/hi';
import * as taLex from './lexicon/ta';

const ALL_GUARANTEED = [...enLex.EN_GUARANTEED, ...hiLex.HI_GUARANTEED, ...taLex.TA_GUARANTEED];
const ALL_URGENCY = [...enLex.EN_URGENCY, ...hiLex.HI_URGENCY, ...taLex.TA_URGENCY];
const ALL_OTP = [...enLex.EN_REQUESTS_OTP, ...hiLex.HI_REQUESTS_OTP, ...taLex.TA_REQUESTS_OTP];
const ALL_APP_INSTALL = [
  ...enLex.EN_REQUESTS_APP_INSTALL,
  ...hiLex.HI_REQUESTS_APP_INSTALL,
  ...taLex.TA_REQUESTS_APP_INSTALL,
];
const ALL_GROUP_JOIN = [
  ...enLex.EN_REQUESTS_GROUP_JOIN,
  ...hiLex.HI_REQUESTS_GROUP_JOIN,
  ...taLex.TA_REQUESTS_GROUP_JOIN,
];
const ALL_PAYMENT = [
  ...enLex.EN_REQUESTS_PAYMENT,
  ...hiLex.HI_REQUESTS_PAYMENT,
  ...taLex.TA_REQUESTS_PAYMENT,
];
const ALL_REG_CLAIMS = [
  ...enLex.EN_REGISTRATION_CLAIMS,
  ...hiLex.HI_REGISTRATION_CLAIMS,
  ...taLex.TA_REGISTRATION_CLAIMS,
];

// Helper to clean commas from numeric string
function parseAmount(numStr: string): number {
  const clean = numStr.replace(/,/g, '').trim();
  return parseFloat(clean);
}

/**
 * Extracts structured claims deterministically from masked text.
 */
export function extractClaims(maskedText: string, _lang: Lang = 'en'): ExtractedClaims {
  const text = maskedText || '';
  const lower = text.toLowerCase();

  // 1. Guaranteed check
  const hasGuaranteed = ALL_GUARANTEED.some((phrase) => lower.includes(phrase.toLowerCase()));

  // 2. Extract Durations in Days
  let detectedDays = 30; // default period if duration not explicitly mentioned
  let foundDuration = false;

  // e.g. "30 days", "30 दिन", "30 நாட்கள்", "24 hours", "2 weeks", "1 month"
  const daysMatch = lower.match(/(\d+)\s*(?:days?|दिन|நாட்கள்)/i);
  const weeksMatch = lower.match(/(\d+)\s*(?:weeks?|हफ्ते|हफ्तों|வாரங்கள்)/i);
  const monthsMatch = lower.match(/(\d+)\s*(?:months?|महीने|महीनों|மாதங்கள்)/i);
  const hoursMatch = lower.match(/(\d+)\s*(?:hours?|घंटे|மணி)/i);

  if (daysMatch) {
    detectedDays = parseInt(daysMatch[1], 10);
    foundDuration = true;
  } else if (weeksMatch) {
    detectedDays = parseInt(weeksMatch[1], 10) * 7;
    foundDuration = true;
  } else if (monthsMatch) {
    detectedDays = parseInt(monthsMatch[1], 10) * 30;
    foundDuration = true;
  } else if (hoursMatch) {
    detectedDays = Math.max(0.04, parseInt(hoursMatch[1], 10) / 24);
    foundDuration = true;
  }

  // 3. Extract Promised Returns
  const promisedReturns: ExtractedClaims['promisedReturns'] = [];

  // A. Multiples (e.g. 2x, 3x, double, दोगुना, இரட்டிப்பு)
  let multiple: number | undefined;
  if (
    /\b(2x|2 x|double|दोगुना|दो गुना|डबल|இரட்டிப்பு|2 மடங்கு)\b/i.test(lower) ||
    lower.includes('दोगुना') ||
    lower.includes('இரட்டிப்பு')
  ) {
    multiple = 2;
  } else if (/\b(3x|3 x|triple|तीन गुना|3 गुना|3 மடங்கு)\b/i.test(lower)) {
    multiple = 3;
  } else if (/\b(4x|4 x|quadruple|4 गुना|4 மடங்கு)\b/i.test(lower)) {
    multiple = 4;
  } else if (/\b(5x|5 x|5 गुना|5 மடங்கு)\b/i.test(lower)) {
    multiple = 5;
  } else if (/\b(10x|10 x|10 गुना|10 மடங்கு)\b/i.test(lower)) {
    multiple = 10;
  } else if (/\b(100x|100 x|100 गुना|100 மடங்கு)\b/i.test(lower)) {
    multiple = 100;
  }

  // B. Amount-to-amount pairs: "10,000 -> 20,000" / "invest 10000 get 20000" / "10000 to 20000"
  const amountPairMatch = text.match(
    /(?:invest|deposit|pay|முதலீடு)?\s*₹?\s*(\d+(?:,\d+)*)\s*(?:->|=>|-|to|get|मे|में|ஆக|return|gives|gives back|pays|yields)\s*₹?\s*(\d+(?:,\d+)*)/i
  );

  if (amountPairMatch) {
    const p = parseAmount(amountPairMatch[1]);
    const a = parseAmount(amountPairMatch[2]);
    if (p > 0 && a > p) {
      multiple = a / p;
    }
  }

  // C. Percentage returns (e.g. 20% daily, 50% per week, 100% per month)
  const is100Certainty = /100\s*%\s*(?:guaranteed|sure|safe|allotment|accuracy|सुरक्षित|निश्चित|गारंटी|पक्का|உத்தரவாதம்|நிச்சய|ஒதுக்கீடு|லாபம்)/i.test(lower);
  const percentMatch = text.match(/(\d+(?:\.\d+)?)\s*%\s*(?:daily|per day|प्रतिदिन|रोजाना|दैनिक|தினமும்|தினசரி|weekly|per week|monthly|per month|returns?|profit|मुनाफा|लाभ|வருமானம்)?/i);
  
  if (percentMatch && !is100Certainty && (!multiple || multiple === 1)) {
    const pct = parseFloat(percentMatch[1]);
    if (pct > 0) {
      multiple = 1 + pct / 100;
      if (!foundDuration) {
        if (/daily|per day|प्रतिदिन|रोजाना|दैनिक|हर दिन|தினமும்|தினசரி|நாளுக்கு/i.test(lower)) detectedDays = 1;
        else if (/weekly|per week|प्रति सप्ताह|साप्ताहिक|வாரந்தோறும்|வாரம்/i.test(lower)) detectedDays = 7;
        else if (/monthly|per month|प्रति माह|मासिक|महीने|மாதம்|மாதந்தோறும்/i.test(lower)) detectedDays = 30;
      }
    }
  }

  if (multiple && multiple > 1) {
    promisedReturns.push({
      multiple,
      durationDays: detectedDays,
      guaranteed: hasGuaranteed,
    });
  } else if (hasGuaranteed) {
    promisedReturns.push({
      guaranteed: true,
      durationDays: detectedDays,
    });
  }

  // 4. Extract Urgency Phrases
  const urgencyPhrases = ALL_URGENCY.filter((phrase) => lower.includes(phrase.toLowerCase()));

  // 5. Extract Requests
  const requests: ExtractedClaims['requests'] = [];

  if (ALL_OTP.some((p) => lower.includes(p.toLowerCase())) || /\[OTP\]/i.test(text)) {
    requests.push('OTP');
  }

  if (
    ALL_APP_INSTALL.some((p) => lower.includes(p.toLowerCase())) ||
    /\b(apk|anydesk|teamviewer|rustdesk)\b/i.test(lower)
  ) {
    requests.push('APP_INSTALL');
  }

  if (
    ALL_GROUP_JOIN.some((p) => lower.includes(p.toLowerCase())) ||
    /\b(t\.me|chat\.whatsapp\.com|vip group|vip channel|telegram group|telegram channel|whatsapp group)\b/i.test(lower) ||
    (lower.includes('vip') && (lower.includes('group') || lower.includes('channel') || lower.includes('telegram'))) ||
    lower.includes('वीआईपी ग्रुप') ||
    lower.includes('குழுவில்')
  ) {
    requests.push('GROUP_JOIN');
  }

  if (
    ALL_PAYMENT.some((p) => lower.includes(p.toLowerCase())) ||
    /\b(pay|deposit|transfer|fee|charges)\b/i.test(lower)
  ) {
    requests.push('PAYMENT');
  }

  // Personal account request: payment verbs near [UPI], [ACCOUNT_OR_ID], [PHONE] or personal account
  if (
    /(\[UPI\]|\[ACCOUNT_OR_ID\]|\[PHONE\])/i.test(text) &&
    (requests.includes('PAYMENT') || /\b(send|pay|transfer|deposit|account|upi)\b/i.test(lower))
  ) {
    requests.push('PERSONAL_ACCOUNT');
  }

  // Deduplicate requests
  const uniqueRequests = Array.from(new Set(requests));

  // 6. Registration claims
  const registrationClaims = ALL_REG_CLAIMS.filter((claim) =>
    lower.includes(claim.toLowerCase())
  );
  if (/\bsebi\b/i.test(lower) && /\b(reg|registered|approved|certified|licen[sc]e)\b/i.test(lower)) {
    if (!registrationClaims.includes('sebi registered')) {
      registrationClaims.push('sebi registered');
    }
  }

  // 7. Extract URLs
  const urlMatches = text.match(/(?:https?:\/\/|www\.)[^\s<>"'{}|\\^`]+[^\s<>"'{}|\\^`.,;:?!]/gi) || [];
  const urls = Array.from(new Set(urlMatches));

  // 8. Extract Handles
  const handleMatches = text.match(/@[A-Za-z0-9_]{3,}/g) || [];
  const handles = Array.from(new Set(handleMatches));

  return {
    promisedReturns,
    urgencyPhrases,
    requests: uniqueRequests,
    registrationClaims,
    urls,
    handles,
  };
}
