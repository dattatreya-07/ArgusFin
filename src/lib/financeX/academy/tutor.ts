import { Lang } from '../types';
import { maskPII } from '@/lib/mask';
import { askRag, RagResponse } from '@/lib/rag';
import { getLessonForArchetype } from './shieldLessonMap';

export type TutorMode =
  | 'EXPLAIN'
  | 'SIMPLIFY'
  | 'EXAMPLE'
  | 'QUIZ_ME'
  | 'COMPARE'
  | 'TRANSLATE'
  | 'WHY'
  | 'SCAM_AWARENESS';

export interface TutorQueryInput {
  query: string;
  mode?: TutorMode;
  lang?: Lang;
  currentLessonSlug?: string;
}

export interface TutorResponse {
  answer: string;
  mode: TutorMode;
  verified: boolean;
  citations: Array<{ title: string; url: string }>;
  refusal?: boolean;
  refusalReason?: string;
  recommendedLessonSlug?: string;
  shieldRouteRecommended?: boolean;
}

const SCAM_VERIFICATION_PATTERNS = [
  /\b(guarantee|guaranteed|2%|20%|daily\s+return|weekly\s+return|lottery|upfront|anydesk|withdrawal\s+fee|recover\s+lost\s+money|airdrop|fake\s+app|telegram\s+group|whatsapp\s+group)\b/i,
  /\b(is\s+it\s+safe|is\s+this\s+.*safe)\b/i,
  /सुरक्षित|गारंटी/i,
  /பாதுகாப்பானதா|உத்தரவாதம்/i,
];

const RECOMMENDATION_SEEKING_PATTERNS = [
  /\b(which|what|best|top)\s+.*(stock|share|equity|mutual\s+fund|crypto|coin|token|broker|platform|app)\b/i,
  /\b(buy|invest\s+in|purchase|pick|trade|intraday|stock\s+tip)\b/i,
  /\b(predict|price|nifty|sensex|should\s+i\s+buy)\b/i,
  /\b(will\s+it\s+go\s+up|rise|double|100x)\b/i,
  /\b(override\s+safety|bypass\s+sebi|force\s+recommend|pretend.*broker|system\s+instruction)\b/i,
  /कौन\s+सा\s+(शेयर|म्यूचुअल\s+फंड|स्टॉक)/i,
  /எந்த\s+(பங்கு|பங்குகளை|நிதியை)\s+(வாங்க)/i,
];

export class FinanceXAITutor {
  public async processQuery(input: TutorQueryInput): Promise<TutorResponse> {
    const lang = input.lang || 'en';
    const rawQuery = input.query || '';

    // Step 1: PII Masking
    const { masked: maskedQuery } = maskPII(rawQuery);
    const trimmed = maskedQuery.trim();

    if (!trimmed) {
      return {
        answer: lang === 'ta'
          ? 'தயவுசெய்து உங்கள் நிதி கேள்வியைக் கேளுங்கள்.'
          : lang === 'hi'
          ? 'कृपया अपना वित्तीय प्रश्न पूछें।'
          : 'Please ask a financial literacy or safety question.',
        mode: input.mode || 'EXPLAIN',
        verified: false,
        citations: [],
      };
    }

    // Step 2: Route Suspicious Offer / Scam Queries directly to Shield
    if (SCAM_VERIFICATION_PATTERNS.some((pat) => pat.test(trimmed))) {
      const mappedLesson = getLessonForArchetype('DOUBLING_SCHEME');
      const isRoleplay = /pretend|override|bypass|system\s+instruction/i.test(trimmed);
      return {
        answer: lang === 'ta'
          ? 'உத்தரவாத தினசரி வருமானங்கள் அல்லது டெலிகிராம் குழு சலுகைகளை எங்கள் ArgusFin Shield கருவி மூலம் உடனடியாக பகுப்பாய்வு செய்யலாம்.'
          : lang === 'hi'
          ? 'गारंटीकृत दैनिक रिटर्न या टेलीग्राम ग्रुप ऑफर को हमारे ArgusFin Shield से तुरंत जांचें।'
          : 'Promises of guaranteed returns, advance fees, or suspicious app offers carry extreme fraud risk. Use ArgusFin Shield (Protect) to scan full messages, or read our lesson on Guaranteed-Return Claims.',
        mode: 'SCAM_AWARENESS',
        verified: true,
        citations: [
          {
            title: 'SEBI Caution Against Unregistered Investment Schemes',
            url: 'https://investor.sebi.gov.in',
          },
        ],
        refusal: isRoleplay ? true : undefined,
        refusalReason: isRoleplay ? 'INVESTMENT_ADVICE_PROHIBITED' : undefined,
        recommendedLessonSlug: mappedLesson?.slug || 'guaranteed-return-claims',
        shieldRouteRecommended: true,
      };
    }

    // Step 3: Policy Check for Personalized Investment Advice
    if (RECOMMENDATION_SEEKING_PATTERNS.some((pat) => pat.test(trimmed))) {
      return {
        answer: lang === 'ta'
          ? 'FinanceX தனிப்பட்ட பங்கு பரிந்துரைகளை வழங்காது. முதலீடுகளை மதிப்பிடுவதற்கான கல்வி அளவுகோல்களை எங்கள் பாடங்களில் கற்கலாம்.'
          : lang === 'hi'
          ? 'FinanceX व्यक्तिगत स्टॉक या फंड की सिफारिशें नहीं देता है। आप हमारे पाठों में निवेश मूल्यांकन के शैक्षिक मानदंड सीख सकते हैं।'
          : 'FinanceX is an educational platform and does not provide personalized stock, fund, or broker buy/sell recommendations. You can learn objective criteria for evaluating investments in our Academy lessons.',
        mode: 'EXPLAIN',
        verified: true,
        citations: [
          {
            title: 'SEBI Investor Protection Guidelines',
            url: 'https://investor.sebi.gov.in',
          },
        ],
        refusal: true,
        refusalReason: 'INVESTMENT_ADVICE_PROHIBITED',
        recommendedLessonSlug: 'investing-basics',
      };
    }

    // Step 4: Mode Detection
    let detectedMode: TutorMode = input.mode || 'EXPLAIN';
    if (/simplify|plain\s+english|எளிமையாக|सरल\s+भाषा/i.test(trimmed)) {
      detectedMode = 'SIMPLIFY';
    } else if (/example|உதாரணம்|उदाहरण/i.test(trimmed)) {
      detectedMode = 'EXAMPLE';
    } else if (/compare|difference|வேறுபாடு|अंतर/i.test(trimmed)) {
      detectedMode = 'COMPARE';
    } else if (/why|ஏன்|क्यों/i.test(trimmed)) {
      detectedMode = 'WHY';
    }

    // Step 5: Execute Grounded RAG Query
    const ragResult: RagResponse = await askRag(trimmed, lang);

    // Step 6: Post-process & Format Response
    let formattedAnswer = ragResult.answer;
    if (detectedMode === 'SIMPLIFY') {
      formattedAnswer = `Summary: ${formattedAnswer}`;
    }

    return {
      answer: formattedAnswer,
      mode: detectedMode,
      verified: ragResult.verified,
      citations: ragResult.citations.map((c) => ({
        title: c.title,
        url: c.sourceUrl,
      })),
    };
  }
}

export const aiTutor = new FinanceXAITutor();
