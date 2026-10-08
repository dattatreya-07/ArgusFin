import { Lang } from '../types';

export interface SourceRef {
  id: string;
  title: string;
  publisher: string;
  url: string;
  verifiedAt: string;
}

export type LessonLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export interface LessonSection {
  title: string;
  content: string;
  codeOrFormula?: string;
  example?: string;
  warning?: string;
}

export interface Lesson {
  id: string;
  trackId: string;
  slug: string;
  title: Record<Lang, string>;
  description: Record<Lang, string>;
  level: LessonLevel;
  estimatedMinutes: number;
  objectives: Record<Lang, string[]>;
  sections: Record<Lang, LessonSection[]>;
  keyTakeaways: Record<Lang, string[]>;
  quizId: string;
  sourceIds: string[];
  sources: SourceRef[];
  locale?: Lang;
}

export interface Track {
  id: string;
  slug: string;
  title: Record<Lang, string>;
  description: Record<Lang, string>;
  icon: string;
  orderIndex: number;
  lessonCount: number;
}

export const VERIFIED_SOURCES: Record<string, SourceRef> = {
  sebi_investor_ed: {
    id: 'sebi_investor_ed',
    title: 'SEBI Investor Education Portal (Saa₹thi)',
    publisher: 'Securities and Exchange Board of India (SEBI)',
    url: 'https://investor.sebi.gov.in',
    verifiedAt: '2026-01-15',
  },
  rbi_financial_ed: {
    id: 'rbi_financial_ed',
    title: 'RBI Financial Education & Consumer Protection',
    publisher: 'Reserve Bank of India (RBI)',
    url: 'https://rbi.org.in/scripts/FinancialEducation.aspx',
    verifiedAt: '2026-01-15',
  },
  nsdl_investor: {
    id: 'nsdl_investor',
    title: 'NSDL Investor Awareness & Depository Services',
    publisher: 'National Securities Depository Limited (NSDL)',
    url: 'https://nsdl.co.in',
    verifiedAt: '2026-01-15',
  },
  nism_cert: {
    id: 'nism_cert',
    title: 'National Institute of Securities Markets (NISM)',
    publisher: 'NISM / SEBI',
    url: 'https://www.nism.ac.in',
    verifiedAt: '2026-01-15',
  },
  cyber_crime_portal: {
    id: 'cyber_crime_portal',
    title: 'National Cyber Crime Reporting Portal (1930)',
    publisher: 'Ministry of Home Affairs, Govt of India',
    url: 'https://cybercrime.gov.in',
    verifiedAt: '2026-01-15',
  },
};

export const TRACKS: Track[] = [
  {
    id: 'track_foundations',
    slug: 'financial-foundations',
    title: {
      en: 'Track 1: Financial Foundations',
      ta: 'தடம் 1: நிதி அடித்தளங்கள்',
      hi: 'ट्रैक 1: वित्तीय आधार',
    },
    description: {
      en: 'Master money management, income vs expenses, saving vs investing, inflation, simple/compound interest, and emergency funds.',
      ta: 'பண மேலாண்மை, சேமிப்பு, பணவீக்கம் மற்றும் அவசர நிதியை புரிந்து கொள்ளுங்கள்.',
      hi: 'पैसा प्रबंधन, बचत, मुद्रास्फीति और आपातकालीन फंड को समझें।',
    },
    icon: '💡',
    orderIndex: 1,
    lessonCount: 6,
  },
  {
    id: 'track_investing_basics',
    slug: 'investing-basics',
    title: {
      en: 'Track 2: Investing Basics',
      ta: 'தடம் 2: முதலீட்டு அடிப்படை',
      hi: 'ट्रैक 2: निवेश की मूल बातें',
    },
    description: {
      en: 'Understand fixed deposits, bonds, mutual funds, equities, SIP compounding, and IPO allotments.',
      ta: 'நிலையான வைப்புத்தொகை, பத்திரங்கள், பரஸ்பர நிதிகள் மற்றும் பங்குகளின் அடிப்படை.',
      hi: 'फिक्स्ड डिपॉजिट, बांड, म्यूचुअल फंड, इक्विटी और एसआईपी को समझें।',
    },
    icon: '📈',
    orderIndex: 2,
    lessonCount: 6,
  },
  {
    id: 'track_resilience',
    slug: 'investor-resilience',
    title: {
      en: 'Track 3: Investor Resilience',
      ta: 'தடம் 3: முதலீட்டாளர் பாதுகாப்பு',
      hi: 'ट्रैक 3: निवेशक सुरक्षा',
    },
    description: {
      en: 'Recognize guaranteed-return scams, advance fees, fake trading apps, copy trading, and credential theft traps.',
      ta: 'உத்தரவாத வருமான மோசடிகள், போலி ஆப்ஸ்கள் மற்றும் OTP திருட்டுகளைக் கண்டறியவும்.',
      hi: 'गारंटीकृत रिटर्न घोटालों, फर्जी ऐप्स और ओटीपी चोरी को पहचानें।',
    },
    icon: '🛡️',
    orderIndex: 3,
    lessonCount: 8,
  },
  {
    id: 'track_web3_safety',
    slug: 'digital-web3-safety',
    title: {
      en: 'Track 4: Digital Finance & Web3 Safety',
      ta: 'தடம் 4: டிஜிட்டல் நிதி & Web3 பாதுகாப்பு',
      hi: 'ट्रैक 4: डिजिटल वित्त और Web3 सुरक्षा',
    },
    description: {
      en: 'Learn non-custodial wallet basics, private seed phrase protection, smart contract risk, and fake airdrop prevention.',
      ta: 'வாலட் அடிப்படை, ரகசிய சாவி பாதுகாப்பு மற்றும் போலி ஏர்டிராப் தடுப்பு.',
      hi: 'वॉलेट मूल बातें, गुप्त कुंजी सुरक्षा और नकली एयरड्रॉप से बचाव।',
    },
    icon: '🔐',
    orderIndex: 4,
    lessonCount: 6,
  },
];

export const LESSONS: Lesson[] = [
  // --- TRACK 1: FINANCIAL FOUNDATIONS (Lessons 1-6) ---
  {
    id: 'les_money_income_expenses',
    trackId: 'track_foundations',
    slug: 'money-income-expenses',
    title: {
      en: '1. Money, Income, and Expenses',
      ta: '1. பணம், வருமானம் மற்றும் செலவுகள்',
      hi: '1. पैसा, आय और व्यय',
    },
    description: {
      en: 'Understand cash inflow, fixed vs variable expenses, and the foundational 50/30/20 budgeting framework.',
      ta: 'வருமானம், நிலையான செலவுகள் மற்றும் 50/30/20 வரவு செலவு திட்டம்.',
      hi: 'आय, निश्चित व्यय और 50/30/20 बजट नियम।',
    },
    level: 'BEGINNER',
    estimatedMinutes: 4,
    objectives: {
      en: ['Differentiate income from wealth', 'Categorize fixed vs variable expenses', 'Apply basic cashflow budgeting'],
      ta: ['வருமானம் மற்றும் செல்வத்திற்கு இடையிலான வேறுபாடு', 'செலவுகளை வகைப்படுத்துதல்'],
      hi: ['आय और संपत्ति में अंतर', 'निश्चित और परिवर्तनशील खर्चों को अलग करना'],
    },
    sections: {
      en: [
        {
          title: 'Understanding Cashflow',
          content: 'Income is the cash flowing into your account (salary, business revenue). Expenses are the money going out. Wealth is what remains after expenses are controlled.',
          example: 'Earning ₹50,000/month but spending ₹48,000 leaves only ₹2,000 wealth creation capacity.',
        },
        {
          title: 'The 50/30/20 Framework',
          content: 'Allocate 50% for Needs (rent, groceries, bills), 30% for Wants (entertainment, dining), and minimum 20% for Savings & Debt repayment.',
        },
      ],
      ta: [
        {
          title: 'ப பணப்புழக்கத்தைப் புரிந்துகொள்வது',
          content: 'வருமானம் என்பது உங்கள் கணக்கிற்கு வரும் பணம். செலவு என்பது வெளியேறும் பணம்.',
        },
      ],
      hi: [
        {
          title: 'कैशफ्लो को समझना',
          content: 'आय वह नकद है जो आपके खाते में आता है। व्यय बाहर जाने वाला पैसा है।',
        },
      ],
    },
    keyTakeaways: {
      en: ['Saving requires intentional budgeting', 'Wealth is accumulated, not spent'],
      ta: ['சேமிப்பிற்கு திட்டமிட்ட வரவுசெலவு அவசியம்'],
      hi: ['बचत के लिए योजनाबद्ध बजट आवश्यक है'],
    },
    quizId: 'quiz_money_income_expenses',
    sourceIds: ['rbi_financial_ed'],
    sources: [VERIFIED_SOURCES.rbi_financial_ed],
  },
  {
    id: 'les_saving_vs_investing',
    trackId: 'track_foundations',
    slug: 'saving-vs-investing',
    title: {
      en: '2. Saving vs. Investing',
      ta: '2. சேமிப்பு vs முதலீடு',
      hi: '2. बचत बनाम निवेश',
    },
    description: {
      en: 'Why holding cash in a savings account preserves liquidity but risks losing purchasing power to inflation.',
      ta: 'சேமிப்பு கணக்கில் பணத்தை வைப்பதன் நன்மைகள் மற்றும் வரம்புகள்.',
      hi: 'बचत खाते में पैसा रखने के फायदे और सीमाएं।',
    },
    level: 'BEGINNER',
    estimatedMinutes: 5,
    objectives: {
      en: ['Compare capital preservation vs capital growth', 'Understand liquid reserves'],
      ta: ['மூலதன பாதுகாப்பு மற்றும் வளர்ச்சி ஒப்பீடு'],
      hi: ['पूंजी संरक्षण और वृद्धि की तुलना'],
    },
    sections: {
      en: [
        {
          title: 'Saving for Liquidity',
          content: 'Savings accounts and short-term liquid funds prioritize emergency access and capital safety over high growth.',
        },
        {
          title: 'Investing for Growth',
          content: 'Investing deploys capital into productive economic assets (equities, bonds, real estate) to beat inflation over multi-year horizons.',
        },
      ],
      ta: [{ title: 'சேமிப்பு', content: 'அவசரத் தேவைகளுக்கு பணத்தை உடனடியாகப் பயன்படுத்த சேமிப்பு உதவுகிறது.' }],
      hi: [{ title: 'बचत', content: 'आपातकालीन जरूरतों के लिए नकद रखना बचत है।' }],
    },
    keyTakeaways: {
      en: ['Savings provide safety and liquidity', 'Investments build long-term real wealth'],
      ta: ['சேமிப்பு பாதுகாப்பை அளிக்கிறது', 'முதலீடு வளர்ச்சியை அளிக்கிறது'],
      hi: ['बचत सुरक्षा देती है', 'निवेश वृद्धि देता है'],
    },
    quizId: 'quiz_saving_vs_investing',
    sourceIds: ['rbi_financial_ed', 'sebi_investor_ed'],
    sources: [VERIFIED_SOURCES.rbi_financial_ed, VERIFIED_SOURCES.sebi_investor_ed],
  },
  {
    id: 'les_inflation',
    trackId: 'track_foundations',
    slug: 'understanding-inflation',
    title: {
      en: '3. Understanding Inflation',
      ta: '3. பணவீக்கத்தைப் புரிந்துகொள்வது',
      hi: '3. मुद्रास्फीति को समझना',
    },
    description: {
      en: 'How the erosion of money purchasing power over time impacts long-term financial goals.',
      ta: 'காலப்போக்கில் பணத்தின் வாங்கும் திறன் எவ்வாறு குறைகிறது.',
      hi: 'समय के साथ पैसे की क्रय शक्ति कैसे कम होती है।',
    },
    level: 'BEGINNER',
    estimatedMinutes: 5,
    objectives: {
      en: ['Define Consumer Price Index (CPI) inflation', 'Calculate real rate of return (Nominal - Inflation)'],
      ta: ['பணவீக்கத்தின் தாக்கத்தைக் கணக்கிடுதல்'],
      hi: ['वास्तविक रिटर्न दर की गणना करना'],
    },
    sections: {
      en: [
        {
          title: 'The Silent Loss of Purchasing Power',
          content: 'If annual inflation is 6%, an item costing ₹100 today will cost ₹106 next year. Money earning only 3% in savings is effectively losing 3% real value annually.',
          codeOrFormula: 'Real Return = Nominal Rate - Inflation Rate',
        },
      ],
      ta: [{ title: 'பணவீக்கம்', content: 'பணவீக்கம் 6% ஆக இருந்தால், ரூ.100 மதிப்புள்ள பொருள் அடுத்த ஆண்டு ரூ.106 ஆகும்.' }],
      hi: [{ title: 'मुद्रास्फीति', content: 'यदि मुद्रास्फीति 6% है, तो आज 100 रुपये की चीज अगले साल 106 रुपये की होगी।' }],
    },
    keyTakeaways: {
      en: ['Nominal returns must exceed inflation for real wealth creation'],
      ta: ['உண்மையான வளர்ச்சிக்கு பணவீக்கத்தை விட அதிக வருமானம் தேவை'],
      hi: ['वास्तविक वृद्धि के लिए रिटर्न मुद्रास्फीति से अधिक होना चाहिए'],
    },
    quizId: 'quiz_inflation',
    sourceIds: ['rbi_financial_ed'],
    sources: [VERIFIED_SOURCES.rbi_financial_ed],
  },
  {
    id: 'les_simple_compound_interest',
    trackId: 'track_foundations',
    slug: 'simple-vs-compound-interest',
    title: {
      en: '4. Simple vs. Compound Interest',
      ta: '4. தனி வட்டி vs கூட்டு வட்டி',
      hi: '4. साधारण बनाम चक्रवृद्धि ब्याज',
    },
    description: {
      en: 'The mathematical exponential engine where accumulated interest earns interest.',
      ta: 'வட்டிக்கு வட்டி கிடைக்கும் கணிதக் கோட்பாடு.',
      hi: 'ब्याज पर ब्याज अर्जित करने का गणितीय सिद्धांत।',
    },
    level: 'BEGINNER',
    estimatedMinutes: 5,
    objectives: {
      en: ['Master compounding formula A = P(1 + r/n)^(nt)', 'Understand the impact of investment duration'],
      ta: ['கூட்டு வட்டி வாய்ப்பாட்டைப் புரிந்துகொள்ளுதல்'],
      hi: ['चक्रवृद्धि ब्याज सूत्र को समझना'],
    },
    sections: {
      en: [
        {
          title: 'Simple Interest',
          content: 'Simple interest pays returns strictly on original principal (I = P * r * t).',
        },
        {
          title: 'Compound Interest (The 8th Wonder)',
          content: 'Compound interest adds earned interest back into principal for subsequent periods. Over 20+ years, exponential growth dominates total value.',
          codeOrFormula: 'A = P * (1 + r/n)^(n*t)',
        },
      ],
      ta: [{ title: 'கூட்டு வட்டி', content: 'கூட்டு வட்டி மூலம் நீண்ட காலத்தில் முதலீடு வேகமாகக் கூடும்.' }],
      hi: [{ title: 'चक्रवृद्धि ब्याज', content: 'चक्रवृद्धि ब्याज लंबी अवधि में तेजी से बढ़ता है।' }],
    },
    keyTakeaways: {
      en: ['Time horizon matters more than timing the market', 'Compounding requires patience'],
      ta: ['கால அளவு மிகப்பெரிய பங்கு வகிக்கிறது'],
      hi: ['समय अवधि बहुत महत्वपूर्ण है'],
    },
    quizId: 'quiz_compounding',
    sourceIds: ['sebi_investor_ed', 'nism_cert'],
    sources: [VERIFIED_SOURCES.sebi_investor_ed, VERIFIED_SOURCES.nism_cert],
  },
  {
    id: 'les_emergency_funds',
    trackId: 'track_foundations',
    slug: 'emergency-funds-first-step',
    title: {
      en: '5. Emergency Funds: Your First Shield',
      ta: '5. அவசர கால நிதி: முதல் பாதுகாப்பு',
      hi: '5. आपातकालीन फंड: आपकी पहली सुरक्षा',
    },
    description: {
      en: 'Building 3 to 6 months of essential living expenses before entering market volatility.',
      ta: 'சந்தை அபாயங்களில் இறங்கும் முன் 3-6 மாத செலவுகளுக்கு அவசர நிதி உருவாக்குதல்.',
      hi: 'बाजार के जोखिम में उतरने से पहले 3-6 महीने का आपातकालीन फंड बनाएं।',
    },
    level: 'BEGINNER',
    estimatedMinutes: 4,
    objectives: {
      en: ['Calculate required emergency fund size', 'Choose appropriate liquid instruments'],
      ta: ['தேவையான அவசர நிதியை கணக்கிடுதல்'],
      hi: ['आवश्यक आपातकालीन फंड का आकार तय करना'],
    },
    sections: {
      en: [
        {
          title: 'Why Emergency Funds Prevail',
          content: 'Without an emergency reserve in savings or liquid FDs, unexpected medical or job shocks force liquidation of investments at market troughs.',
        },
      ],
      ta: [{ title: 'அவசர நிதி', content: 'எதிர்பாராத மருத்துவ செலவுகளுக்கு அவசர நிதி பாதுகாப்பளிக்கிறது.' }],
      hi: [{ title: 'आपातकालीन फंड', content: 'अचानक हुए खर्चों के लिए आपातकालीन फंड सुरक्षा प्रदान करता है।' }],
    },
    keyTakeaways: {
      en: ['Keep 3-6 months expenses liquid', 'Emergency funds are for safety, not high yield'],
      ta: ['3-6 மாத செலவுகளுக்கு திரவ நிதி வைக்கவும்'],
      hi: ['3-6 महीने का खर्च नकद या तरल रखें'],
    },
    quizId: 'quiz_emergency_funds',
    sourceIds: ['rbi_financial_ed'],
    sources: [VERIFIED_SOURCES.rbi_financial_ed],
  },
  {
    id: 'les_risk_and_return',
    trackId: 'track_foundations',
    slug: 'risk-and-return-relationship',
    title: {
      en: '6. The Risk and Return Relationship',
      ta: '6. அபாயம் மற்றும் வருவாய் தொடர்பு',
      hi: '6. जोखिम और रिटर्न का संबंध',
    },
    description: {
      en: 'Why higher potential returns fundamentally demand accepting higher capital variance or risk of loss.',
      ta: 'அதிக வருவாய் பெற அதிக அபாயம் ஏற்க வேண்டும் என்ற நிதி விதி.',
      hi: 'अधिक रिटर्न के लिए अधिक जोखिम उठाना पड़ता है।',
    },
    level: 'BEGINNER',
    estimatedMinutes: 5,
    objectives: {
      en: ['Understand risk-return spectrum', 'Identify why zero-risk high-return offers are mathematically false'],
      ta: ['அபாயம்-வருவாய் தொடர்பை அறிதல்'],
      hi: ['जोखिम-रिटर्न संबंध को समझना'],
    },
    sections: {
      en: [
        {
          title: 'The Core Financial Axiom',
          content: 'Risk is the uncertainty of expected returns or potential loss of principal. Government bonds offer lower yields because default risk is near zero; equities offer higher long-term potential because company earnings fluctuate.',
          warning: 'Any claim promising high returns with ZERO risk breaks fundamental economic principles.',
        },
      ],
      ta: [{ title: 'அபாயம் vs வருமானம்', content: 'பூஜ்ஜிய அபாயத்தில் அதிக வருமானம் தருவதாகக் கூறும் எந்த சலுகையும் பொய்யானது.' }],
      hi: [{ title: 'जोखिम बनाम रिटर्न', content: 'शून्य जोखिम पर उच्च रिटर्न देने वाला कोई भी दावा झूठा है।' }],
    },
    keyTakeaways: {
      en: ['Zero risk + high return does not exist in legal finance'],
      ta: ['அபாயமில்லாத அதிக வருமானம் சாத்தியமில்லை'],
      hi: ['बिना जोखिम के उच्च रिटर्न संभव नहीं है'],
    },
    quizId: 'quiz_risk_return',
    sourceIds: ['sebi_investor_ed', 'nism_cert'],
    sources: [VERIFIED_SOURCES.sebi_investor_ed, VERIFIED_SOURCES.nism_cert],
  },

  // --- TRACK 2: INVESTING BASICS (Lessons 7-12) ---
  {
    id: 'les_fixed_deposits',
    trackId: 'track_investing_basics',
    slug: 'fixed-deposits-banking',
    title: {
      en: '7. Fixed Deposits & Banking Safety',
      ta: '7. நிலையான வைப்புத்தொகை (FD) & வங்கி பாதுகாப்பு',
      hi: '7. फिक्स्ड डिपॉजिट और बैंकिंग सुरक्षा',
    },
    description: {
      en: 'How bank FDs work, interest payout options, DICGC insurance coverage limits up to ₹5 Lakhs.',
      ta: 'வங்கி FD செயல்முறை மற்றும் ₹5 லட்சம் வரை DICGC காப்பீட்டு பாதுகாப்பு.',
      hi: 'बैंक एफडी कैसे काम करता है और ₹5 लाख तक का डीआईसीजीसी बीमा।',
    },
    level: 'BEGINNER',
    estimatedMinutes: 5,
    objectives: {
      en: ['Understand Bank FD tenure & compounding', 'Know DICGC deposit insurance limit'],
      ta: ['DICGC வங்கி காப்பீட்டு வரம்பை அறிதல்'],
      hi: ['DICGC जमा बीमा सीमा को जानना'],
    },
    sections: {
      en: [
        {
          title: 'Bank Fixed Deposits',
          content: 'FDs lock capital for a specified tenure (7 days to 10 years) at a guaranteed interest rate set by RBI-regulated scheduled banks.',
        },
        {
          title: 'DICGC Protection Limit',
          content: 'Deposits in scheduled commercial banks are insured by DICGC (RBI subsidiary) up to ₹5,00,000 per depositor per bank (principal + interest).',
        },
      ],
      ta: [{ title: 'DICGC காப்பீடு', content: 'அட்டவணைப்படுத்தப்பட்ட வங்கிகளில் உங்கள் வைப்புத்தொகைக்கு ₹5 லட்சம் வரை அரசு பாதுகாப்பு உள்ளது.' }],
      hi: [{ title: 'DICGC बीमा', content: 'अनुसूचित बैंकों में जमा राशि ₹5 लाख तक बीमाकृत है।' }],
    },
    keyTakeaways: {
      en: ['FDs provide guaranteed return backed by bank capital and DICGC insurance up to ₹5 Lakhs'],
      ta: ['வங்கி FD பாதுகாப்பானது'],
      hi: ['बैंक एफडी सुरक्षित निवेश है'],
    },
    quizId: 'quiz_fixed_deposits',
    sourceIds: ['rbi_financial_ed'],
    sources: [VERIFIED_SOURCES.rbi_financial_ed],
  },
  {
    id: 'les_bonds',
    trackId: 'track_investing_basics',
    slug: 'bonds-debt-instruments',
    title: {
      en: '8. Bonds & Government Securities (G-Secs)',
      ta: '8. பத்திரங்கள் & அரசு பத்திரங்கள் (G-Secs)',
      hi: '8. बॉन्ड और सरकारी प्रतिभूतियां (G-Secs)',
    },
    description: {
      en: 'Understanding debt instruments, coupon payments, credit ratings, and sovereign backing.',
      ta: 'அரசு மற்றும் கார்ப்பரேட் பத்திரங்களின் செயல்பாடு.',
      hi: 'सरकारी और कॉरपोरेट बॉन्ड कैसे काम करते हैं।',
    },
    level: 'INTERMEDIATE',
    estimatedMinutes: 6,
    objectives: {
      en: ['Differentiate Sovereign G-Secs from Corporate Bonds', 'Understand credit rating grades (AAA to D)'],
      ta: ['பத்திரங்களின் கடன் தரவரிசை புரிதல்'],
      hi: ['बॉन्ड क्रेडिट रेटिंग को समझना'],
    },
    sections: {
      en: [
        {
          title: 'What is a Bond?',
          content: 'A bond is a loan made by an investor to a borrower (government or corporation). The issuer pays periodic coupon interest and returns face value at maturity.',
        },
      ],
      ta: [{ title: 'பத்திரங்கள்', content: 'பத்திரங்கள் என்பது அரசு அல்லது நிறுவனங்களுக்கு வழங்கப்படும் கடனாகும்.' }],
      hi: [{ title: 'बॉन्ड', content: 'बॉन्ड सरकार या कंपनियों को दिया जाने वाला ऋण है।' }],
    },
    keyTakeaways: {
      en: ['Sovereign G-Secs carry zero credit risk', 'Corporate bonds depend on issuer rating'],
      ta: ['அரசு பத்திரங்களில் கடன் அபாயமில்லை'],
      hi: ['सरकारी बॉन्ड में क्रेडिट जोखिम नहीं होता'],
    },
    quizId: 'quiz_bonds',
    sourceIds: ['rbi_financial_ed', 'sebi_investor_ed'],
    sources: [VERIFIED_SOURCES.rbi_financial_ed, VERIFIED_SOURCES.sebi_investor_ed],
  },
  {
    id: 'les_mutual_funds',
    trackId: 'track_investing_basics',
    slug: 'mutual-funds-structure',
    title: {
      en: '9. Mutual Funds & Asset Management',
      ta: '9. பரஸ்பர நிதிகள் (Mutual Funds)',
      hi: '9. म्यूचुअल फंड संरचना',
    },
    description: {
      en: 'Pooled investing managed by licensed AMCs regulated by SEBI under Net Asset Value (NAV).',
      ta: 'SEBI ஒழுங்குபடுத்தப்பட்ட பரஸ்பர நிதிகளின் கட்டமைப்பு.',
      hi: 'SEBI द्वारा विनियमित म्यूचुअल फंड की संरचना।',
    },
    level: 'BEGINNER',
    estimatedMinutes: 6,
    objectives: {
      en: ['Understand NAV and Fund Managers', 'Compare Equity vs Debt vs Hybrid funds'],
      ta: ['NAV மற்றும் நிதி வகைகளைப் புரிந்துகொள்ளுதல்'],
      hi: ['NAV और फंड प्रकारों को समझना'],
    },
    sections: {
      en: [
        {
          title: 'How Mutual Funds Work',
          content: 'Mutual funds collect money from multiple investors and invest in a diversified portfolio of stocks, bonds, or money market instruments managed by professional fund managers.',
        },
      ],
      ta: [{ title: 'பரஸ்பர நிதி', content: 'பல முதலீட்டாளர்களின் பணத்தைச் சேர்த்து தொழில்முறை மேலாளர்கள் முதலீடு செய்கின்றனர்.' }],
      hi: [{ title: 'म्यूचुअल फंड', content: 'अनेक निवेशकों के पैसे को मिलाकर पेशेवर मैनेजर निवेश करते हैं।' }],
    },
    keyTakeaways: {
      en: ['SEBI regulates all mutual funds', 'NAV reflects market value of underlying assets daily'],
      ta: ['SEBI அனைத்து பரஸ்பர நிதிகளையும் கண்காணிக்கிறது'],
      hi: ['SEBI सभी म्यूचुअल फंड का नियमन करता है'],
    },
    quizId: 'quiz_mutual_funds',
    sourceIds: ['sebi_investor_ed', 'nism_cert'],
    sources: [VERIFIED_SOURCES.sebi_investor_ed, VERIFIED_SOURCES.nism_cert],
  },
  {
    id: 'les_equity_shares',
    trackId: 'track_investing_basics',
    slug: 'equity-and-shares',
    title: {
      en: '10. Equity & Shares: Owning Companies',
      ta: '10. பங்குகளின் அறிமுகம் (Shares)',
      hi: '10. इक्विटी और शेयर: कंपनियों के मालिक बनना',
    },
    description: {
      en: 'What equity ownership means, stock exchanges (NSE/BSE), market capitalization, and long-term earnings growth.',
      ta: 'நிறுவன பங்குகள், பங்குச்சந்தைகள் (NSE/BSE) மற்றும் சந்தை அபாயங்கள்.',
      hi: 'कंपनी के शेयर, शेयर बाजार (NSE/BSE) और बाजार जोखिम।',
    },
    level: 'INTERMEDIATE',
    estimatedMinutes: 6,
    objectives: {
      en: ['Define equity ownership', 'Understand NSE/BSE stock exchanges and SEBI oversight'],
      ta: ['பங்குச்சந்தையின் செயல்பாட்டை அறிதல்'],
      hi: ['शेयर बाजार के कामकाज को समझना'],
    },
    sections: {
      en: [
        {
          title: 'Fractional Ownership',
          content: 'Buying a share makes you a fractional owner of the company, entitled to a share in future corporate profits (dividends and capital appreciation).',
        },
      ],
      ta: [{ title: 'பங்குகள்', content: 'பங்கு வாங்குவது நிறுவனத்தின் பகுதி உரிமையாளராக ஆக்குகிறது.' }],
      hi: [{ title: 'शेयर', content: 'शेयर खरीदना कंपनी में आंशिक मालिकाना हक देता है।' }],
    },
    keyTakeaways: {
      en: ['Equities carry price volatility in the short term', 'Long-term returns track corporate business growth'],
      ta: ['பங்குகளில் குறுகிய காலத்தில் விலை ஏற்ற இறக்கம் இருக்கும்'],
      hi: ['शेयरों में अल्पकालिक उतार-चढ़ाव होता है'],
    },
    quizId: 'quiz_equity_shares',
    sourceIds: ['sebi_investor_ed', 'nsdl_investor'],
    sources: [VERIFIED_SOURCES.sebi_investor_ed, VERIFIED_SOURCES.nsdl_investor],
  },
  {
    id: 'les_sips',
    trackId: 'track_investing_basics',
    slug: 'sips-systematic-investing',
    title: {
      en: '11. Systematic Investment Plans (SIPs)',
      ta: '11. முறையான முதலீட்டு திட்டம் (SIP)',
      hi: '11. सिस्टमैटिक इन्वेस्टमेंट प्लान (SIP)',
    },
    description: {
      en: 'Disciplined monthly automated investing, rupee cost averaging, and long-term compounding.',
      ta: 'மாதாந்திர சீரான முதலீடு மற்றும் ரூபாயின் சராசரி விலை நன்மை.',
      hi: 'नियमित मासिक निवेश और रुपया लागत औसत का लाभ।',
    },
    level: 'BEGINNER',
    estimatedMinutes: 5,
    objectives: {
      en: ['Explain Rupee Cost Averaging', 'Calculate illustrative SIP growth'],
      ta: ['SIP முதலீட்டின் நன்மைகளைப் புரிந்துகொள்ளுதல்'],
      hi: ['SIP निवेश के फायदों को समझना'],
    },
    sections: {
      en: [
        {
          title: 'Rupee Cost Averaging',
          content: 'SIP buys more units when markets drop and fewer units when markets rise, removing the emotional trap of market timing.',
        },
      ],
      ta: [{ title: 'SIP நன்மை', content: 'சந்தை வீழ்ச்சியடையும் போது அதிக யூனிட்களை வாங்க SIP உதவுகிறது.' }],
      hi: [{ title: 'SIP लाभ', content: 'बाजार गिरने पर अधिक यूनिट्स खरीदने में SIP मदद करता है।' }],
    },
    keyTakeaways: {
      en: ['Consistency is key in SIPs', 'Rupee cost averaging mitigates market volatility'],
      ta: ['SIP-ல் தொடர்ச்சி மிக முக்கியம்'],
      hi: ['SIP में निरंतरता सबसे महत्वपूर्ण है'],
    },
    quizId: 'quiz_sips',
    sourceIds: ['sebi_investor_ed'],
    sources: [VERIFIED_SOURCES.sebi_investor_ed],
  },
  {
    id: 'les_ipos_allotment',
    trackId: 'track_investing_basics',
    slug: 'ipos-and-allotment',
    title: {
      en: '12. Initial Public Offerings (IPOs) & ASBA',
      ta: '12. புதிய பங்கு வெளியீடு (IPO) & ASBA',
      hi: '12. प्रारंभिक सार्वजनिक पेशकश (IPO) और ASBA',
    },
    description: {
      en: 'How primary market IPOs function, ASBA bank blocking, allotment process, and SEBI registered intermediaries.',
      ta: 'IPO வெளியீடு, ASBA வங்கி வசதி மற்றும் SEBI பதிவு பெற்ற இடைத்தரகர்கள்.',
      hi: 'IPO आवंटन प्रक्रिया, ASBA सुविधा और SEBI पंजीकृत मध्यस्थ।',
    },
    level: 'INTERMEDIATE',
    estimatedMinutes: 6,
    objectives: {
      en: ['Understand ASBA (Application Supported by Blocked Amount)', 'Identify fake guaranteed allotment scams'],
      ta: ['ASBA முறையில் பணம் பாதுகாப்பாக தடுக்கப்படுவதை அறிதல்'],
      hi: ['ASBA प्रणाली से पैसे की सुरक्षा को समझना'],
    },
    sections: {
      en: [
        {
          title: 'Safe IPO Application via ASBA',
          content: 'In official IPO applications via bank ASBA or UPI, your funds stay blocked inside YOUR OWN bank account until allotment occurs. Money is NEVER transferred to a personal UPI ID or private Telegram group.',
          warning: 'Any group claiming "Guaranteed 100% IPO Allotment" in exchange for sending funds to a private UPI account is a fraud.',
        },
      ],
      ta: [{ title: 'ASBA பாதுகாப்பு', content: 'IPO விண்ணப்பத்தின் போது உங்கள் பணம் உங்கள் சொந்த வங்கிக் கணக்கிலேயே இருக்கும்.' }],
      hi: [{ title: 'ASBA सुरक्षा', content: 'IPO के लिए पैसा आपके अपने बैंक खाते में ही ब्लॉक रहता है।' }],
    },
    keyTakeaways: {
      en: ['ASBA keeps money in your bank until allotment', 'No entity can guarantee 100% IPO allotment outside official lottery mechanisms'],
      ta: ['ASBA மூலம் மட்டுமே IPO விண்ணப்பிக்க வேண்டும்'],
      hi: ['केवल ASBA के माध्यम से ही IPO आवेदन करें'],
    },
    quizId: 'quiz_ipos_allotment',
    sourceIds: ['sebi_investor_ed', 'nsdl_investor'],
    sources: [VERIFIED_SOURCES.sebi_investor_ed, VERIFIED_SOURCES.nsdl_investor],
  },

  // --- TRACK 3: INVESTOR RESILIENCE (Lessons 13-20) ---
  {
    id: 'les_guaranteed_return_claims',
    trackId: 'track_resilience',
    slug: 'guaranteed-return-claims',
    title: {
      en: '13. Guaranteed-Return Claims & Doubling Scams',
      ta: '13. உத்தரவாத வருமான வாக்குறுதிகள் & பொன்சி மோசடிகள்',
      hi: '13. गारंटीकृत रिटर्न के दावे और पोंजी घोटाले',
    },
    description: {
      en: 'Why promises of 1% daily, 10% monthly, or doubling money in 30 days are mathematically impossible in legal markets.',
      ta: 'தினசரி 1-2% வட்டி அல்லது 30 நாளில் இரட்டிப்பு என்ற வாக்குறுதிகள் ஏன் கணிதப்படி சாத்தியமில்லை.',
      hi: 'दैनिक 1-2% ब्याज या 30 दिनों में पैसा दोगुना करने का दावा गणितीय रूप से असंभव क्यों है।',
    },
    level: 'BEGINNER',
    estimatedMinutes: 5,
    objectives: {
      en: ['Calculate annualised rates of return (CAGR) on claims', 'Identify Ponzi collapse dynamics'],
      ta: ['வாக்குறுதிகளின் வருடாந்திர சதவீதத்தைக் கணக்கிடுதல்'],
      hi: ['वादों की वार्षिक प्रतिशत दर की गणना करना'],
    },
    sections: {
      en: [
        {
          title: 'The Mathematics of Doubling Schemes',
          content: 'A promise of "2% daily interest" equals an annualised return of over 137,000%! No business, stock market, or asset on earth can generate such returns legally. New deposits pay old members until the scheme collapses.',
          warning: 'SEBI and RBI guidelines strictly prohibit unregistered entities from promising fixed returns on equity or trading.',
        },
      ],
      ta: [{ title: 'பொன்சி ஆபத்து', content: 'தினசரி 2% வட்டி என்பது ஆண்டுக்கு 137,000% க்கும் அதிகமான கணித சாத்தியமற்ற வருமானமாகும்.' }],
      hi: [{ title: 'पोंजी खतरा', content: 'दैनिक 2% ब्याज सालाना 137,000% से अधिक होता है जो कि पूरी तरह असंभव है।' }],
    },
    keyTakeaways: {
      en: ['Promises exceeding 15-20% annualised returns require extreme scrutiny', 'Daily fixed payout promises are 100% Ponzi indicators'],
      ta: ['நிலையான தினசரி வருமான வாக்குறுதிகள் மோசடியின் வெளிப்பாடு'],
      hi: ['निश्चित दैनिक रिटर्न का वादा घोटाले का संकेत है'],
    },
    quizId: 'quiz_guaranteed_returns',
    sourceIds: ['sebi_investor_ed', 'rbi_financial_ed'],
    sources: [VERIFIED_SOURCES.sebi_investor_ed, VERIFIED_SOURCES.rbi_financial_ed],
  },
  {
    id: 'les_advance_fee_scams',
    trackId: 'track_resilience',
    slug: 'advance-fee-scams',
    title: {
      en: '14. Advance-Fee & Pre-Approved Loan Scams',
      ta: '14. முன்பணக் கட்டண மோசடிகள் & போலி கடன் சலுகைகள்',
      hi: '14. अग्रिम शुल्क घोटाले और पूर्व-स्वीकृत ऋण घोटाले',
    },
    description: {
      en: 'Demanding upfront "processing fees", "GST", or "verification deposits" before disbursing prizes, loans, or profits.',
      ta: 'பரிசு அல்லது கடன் தொகையை வழங்கும் முன் "முன்பணம்" அல்லது "வரிகட்டணம்" கேட்கும் மோசடிகள்.',
      hi: 'ऋण या इनाम देने से पहले "प्रोसेसिंग फीस" या "टैक्स" मांगने वाले घोटाले।',
    },
    level: 'BEGINNER',
    estimatedMinutes: 5,
    objectives: {
      en: ['Recognize advance-fee fraud mechanics', 'Understand legitimate lender fee deduction procedures'],
      ta: ['முன்பண மோசடியின் தந்திரங்களை அறிதல்'],
      hi: ['अग्रिम शुल्क घोटालों की पहचान करना'],
    },
    sections: {
      en: [
        {
          title: 'The Advance-Fee Pattern',
          content: 'Scammers claim you have won a lottery, pre-approved loan, or trading profit, but demand ₹2,000 to ₹50,000 upfront as "GST", "transfer tax", or "file clearance fee". Once paid, they disappear.',
          warning: 'Legitimate RBI-registered banks deduct processing fees FROM the loan disbursement, never asking for upfront UPI transfers to private accounts.',
        },
      ],
      ta: [{ title: 'முன்பண ஆபத்து', content: 'அங்கீகரிக்கப்பட்ட வங்கிகள் முன்பணமாக தனிநபர் UPI-க்கு கட்டணம் கேட்காது.' }],
      hi: [{ title: 'अग्रिम शुल्क', content: 'वैध बैंक कभी भी निजी यूपीआई पर अग्रिम शुल्क नहीं मांगते।' }],
    },
    keyTakeaways: {
      en: ['Never pay money to receive promised money', 'Real banks deduct fees from disbursal'],
      ta: ['பணத்தைப் பெற எப்போதும் முன்பணம் செலுத்த வேண்டாம்'],
      hi: ['पैसा पाने के लिए कभी भी पहले पैसा न दें'],
    },
    quizId: 'quiz_advance_fees',
    sourceIds: ['rbi_financial_ed', 'cyber_crime_portal'],
    sources: [VERIFIED_SOURCES.rbi_financial_ed, VERIFIED_SOURCES.cyber_crime_portal],
  },
  {
    id: 'les_fake_investment_apps',
    trackId: 'track_resilience',
    slug: 'fake-investment-apps',
    title: {
      en: '15. Fake Investment Portals & APK Scams',
      ta: '15. போலி முதலீட்டு செயலிகள் & APK மோசடிகள்',
      hi: '15. फर्जी निवेश ऐप और एपीके घोटाले',
    },
    description: {
      en: 'Sideloaded APKs and fake trading dashboards showing manipulated profits that cannot be withdrawn.',
      ta: 'வாட்ஸ்அப் மூலம் அனுப்பப்படும் போலி APK செயலிகள் மற்றும் போலியாகக் காட்டப்படும் இலாபங்கள்.',
      hi: 'व्हाट्सएप के जरिए भेजे गए नकली एपीके ऐप और फर्जी मुनाफा डैशबोर्ड।',
    },
    level: 'INTERMEDIATE',
    estimatedMinutes: 6,
    objectives: {
      en: ['Identify sideloaded APK risks', 'Verify SEBI broker registration before installing apps'],
      ta: ['அதிகாரப்பூர்வமற்ற APK செயலிகளின் ஆபத்தை அறிதல்'],
      hi: ['अनधिकृत एपीके ऐप्स के खतरों को पहचानना'],
    },
    sections: {
      en: [
        {
          title: 'Manipulated Virtual Dashboards',
          content: 'Scammers send APK download links over WhatsApp/Telegram. The app displays fake profits going up every hour. However, when you try to withdraw, the app blocks your account or demands more "verification tax".',
          warning: 'Only download financial apps from Google Play Store or Apple App Store after checking SEBI Registration Numbers.',
        },
      ],
      ta: [{ title: 'போலி செயலிகள்', content: 'அதிகாரப்பூர்வமற்ற APK செயலிகளை ஒருபோதும் பதிவிறக்கம் செய்ய வேண்டாம்.' }],
      hi: [{ title: 'फर्जी ऐप्स', content: 'अनधिकृत एपीके फाइलों को कभी भी डाउनलोड न करें।' }],
    },
    keyTakeaways: {
      en: ['Never install APK files sent on messaging apps', 'Check SEBI registered broker status on sebi.gov.in'],
      ta: ['செய்தி செயலிகளில் அனுப்பப்படும் APK-க்களை நிறுவ வேண்டாம்'],
      hi: ['मैसेंजर ऐप पर भेजी गई एपीके इंस्टॉल न करें'],
    },
    quizId: 'quiz_fake_apps',
    sourceIds: ['sebi_investor_ed', 'cyber_crime_portal'],
    sources: [VERIFIED_SOURCES.sebi_investor_ed, VERIFIED_SOURCES.cyber_crime_portal],
  },
  {
    id: 'les_copy_trading',
    trackId: 'track_resilience',
    slug: 'copy-trading-pressure',
    title: {
      en: '16. Copy-Trading & VIP Signal Group Pressure',
      ta: '16. போலி நகல் வர்த்தகம் & டெலிகிராம் குரூப் மோசடிகள்',
      hi: '16. कॉपी-ट्रेडिंग और वीआईपी सिग्नल ग्रुप का दबाव',
    },
    description: {
      en: 'Social engineering in VIP Telegram groups using fake profit screenshots and finfluencer pressure.',
      ta: 'டெலிகிராம் குழுக்களில் போலி இலாப ஸ்கிரீன்ஷாட்களைக் காட்டி ஏமாற்றும் தந்திரங்கள்.',
      hi: 'टेलीग्राम ग्रुप में नकली स्क्रीनशॉट दिखाकर धोखाधड़ी करने के तरीके।',
    },
    level: 'INTERMEDIATE',
    estimatedMinutes: 5,
    objectives: {
      en: ['Recognize finfluencer pump-and-dump tactics', 'Understand SEBI regulations regarding investment advisors'],
      ta: ['SEBI அனுமதி பெறாத நிதி ஆலோசகர்களை அடையாளம் காணுதல்'],
      hi: ['SEBI अपंजीकृत सलाहकारों को पहचानना'],
    },
    sections: {
      en: [
        {
          title: 'The Anatomy of Signal Groups',
          content: 'Unregistered Telegram "VIP Trading" groups post fabricated profit screenshots and urge members to copy trades on illegal offshore brokers. Group admins profit from referral kickbacks while users lose capital.',
        },
      ],
      ta: [{ title: 'டெலிகிராம் ஆபத்து', content: 'டெலிகிராமில் பகிரப்படும் போலி லாப ஸ்கிரீன்ஷாட்களை நம்ப வேண்டாம்.' }],
      hi: [{ title: 'टेलीग्राम खतरा', content: 'टेलीग्राम पर शेयर किए गए फर्जी स्क्रीनशॉट पर भरोसा न करें।' }],
    },
    keyTakeaways: {
      en: ['Only follow SEBI-registered Investment Advisors (RIA) or Research Analysts (RA)', 'Profit screenshots on messaging apps are easily doctored'],
      ta: ['SEBI பதிவு பெற்ற ஆலோசகர்களை மட்டுமே பின்பற்றுங்கள்'],
      hi: ['केवल SEBI पंजीकृत सलाहकारों का ही पालन करें'],
    },
    quizId: 'quiz_copy_trading',
    sourceIds: ['sebi_investor_ed'],
    sources: [VERIFIED_SOURCES.sebi_investor_ed],
  },
  {
    id: 'les_otp_credential_theft',
    trackId: 'track_resilience',
    slug: 'otp-credential-safety',
    title: {
      en: '17. OTP & Banking Credential Safety',
      ta: '17. OTP & வங்கி நற்சான்றிதழ் பாதுகாப்பு',
      hi: '17. ओटीपी और बैंकिंग क्रेडेंशियल सुरक्षा',
    },
    description: {
      en: 'Preventing bank account takeover via social engineering, phishing links, and OTP sharing.',
      ta: 'வங்கி கணக்குகள் மற்றும் OTP-யை பிறருடன் பகிர்வதால் ஏற்படும் ஆபத்துகள்.',
      hi: 'बैंक खाते और ओटीपी किसी के साथ साझा करने के खतरे।',
    },
    level: 'BEGINNER',
    estimatedMinutes: 4,
    objectives: {
      en: ['Identify SMS / WhatsApp OTP traps', 'Never disclose 6-digit OTPs or UPI PINs to callers'],
      ta: ['OTP மற்றும் UPI PIN பாதுகாப்பை உறுதி செய்தல்'],
      hi: ['ओटीपी और यूपीआई पिन की सुरक्षा सुनिश्चित करना'],
    },
    sections: {
      en: [
        {
          title: 'The Golden Rule of Banking Credentials',
          content: 'No official bank, SEBI official, police officer, or customer support agent will EVER ask for your 6-digit Banking OTP, Net Banking Password, or UPI PIN over the phone or message.',
          warning: 'Entering your UPI PIN on GPay/PhonePe ALWAYS DEBITS money from your account. You NEVER enter a PIN to receive money.',
        },
      ],
      ta: [{ title: 'OTP ரகசியம்', content: 'வங்கி ஊழியர்கள் யாரும் உங்களிடம் OTP அல்லது UPI PIN கேட்க மாட்டார்கள்.' }],
      hi: [{ title: 'ओटीपी गोपनीयता', content: 'कोई भी बैंक कर्मचारी कभी भी ओटीपी या यूपीआई पिन नहीं मांगता।' }],
    },
    keyTakeaways: {
      en: ['UPI PIN is strictly for DEBITING funds', 'Never share OTPs with anyone under any pretext'],
      ta: ['பணம் பெற UPI PIN தேவையில்லை'],
      hi: ['पैसा प्राप्त करने के लिए यूपीआई पिन की आवश्यकता नहीं है'],
    },
    quizId: 'quiz_otp_safety',
    sourceIds: ['rbi_financial_ed', 'cyber_crime_portal'],
    sources: [VERIFIED_SOURCES.rbi_financial_ed, VERIFIED_SOURCES.cyber_crime_portal],
  },
  {
    id: 'les_remote_access_scams',
    trackId: 'track_resilience',
    slug: 'remote-access-scams',
    title: {
      en: '18. Remote-Access App Threats (AnyDesk, TeamViewer)',
      ta: '18. ரிமோட் அணுகல் செயலி அபாயங்கள்',
      hi: '18. रिमोट-एक्सेस ऐप के खतरे',
    },
    description: {
      en: 'How fraudsters trick victims into installing screen-sharing software to drain bank accounts.',
      ta: 'ரிமோட் ஆப்ஸ்கள் (AnyDesk) மூலம் உங்கள் கைபேசியை கட்டுப்படுத்தி பணத்தைத் திருடும் ஆபத்து.',
      hi: 'रिमोट ऐप्स (AnyDesk) के जरिए आपके फोन को नियंत्रित कर पैसे चुराने का खतरा।',
    },
    level: 'INTERMEDIATE',
    estimatedMinutes: 5,
    objectives: {
      en: ['Identify remote screen-sharing software requests', 'Refuse installation of AnyDesk/TeamViewer/QuickSupport for support calls'],
      ta: ['ரிமோட் திரை பகிர்வு ஆப்ஸ்களை நிறுவுவதைத் தவிர்த்தல்'],
      hi: ['रिमोट स्क्रीन शेयरिंग ऐप इंस्टॉल करने से बचना'],
    },
    sections: {
      en: [
        {
          title: 'Screen Capture & Control Traps',
          content: 'Scammers posing as customer support ask you to download AnyDesk, TeamViewer, or QuickSupport to "fix a payment issue". Once installed, they read your banking passwords and OTPs directly off your screen.',
        },
      ],
      ta: [{ title: 'திரை பகிர்வு ஆபத்து', content: 'வங்கி உதவி என்று கூறி ரிமோட் ஆப்ஸ்களை நிறுவச் சொன்னால் உடனடியாக இணைப்பைத் துண்டிக்கவும்.' }],
      hi: [{ title: 'स्क्रीन शेयरिंग खतरा', content: 'कस्टमर सपोर्ट के नाम पर रिमोट ऐप इंस्टॉल करने को कहे तो तुरंत कॉल काटें।' }],
    },
    keyTakeaways: {
      en: ['Never install screen sharing apps at the request of an incoming caller'],
      ta: ['அறியாத நபர்களின் அழைப்பில் ரிமோட் செயலிகளை நிறுவ வேண்டாம்'],
      hi: ['अपरिचित कॉल पर कभी भी रिमोट ऐप इंस्टॉल न करें'],
    },
    quizId: 'quiz_remote_access',
    sourceIds: ['rbi_financial_ed', 'cyber_crime_portal'],
    sources: [VERIFIED_SOURCES.rbi_financial_ed, VERIFIED_SOURCES.cyber_crime_portal],
  },
  {
    id: 'les_withdrawal_fee_scams',
    trackId: 'track_resilience',
    slug: 'withdrawal-fee-scams',
    title: {
      en: '19. Withdrawal-Fee Traps & Account Locking',
      ta: '19. திரும்பப் பெறும் கட்டண ஆபத்துகள்',
      hi: '19. निकासी शुल्क के जाल और खाता लॉक होना',
    },
    description: {
      en: 'Demanding additional deposits to "unlock" fake frozen balances on fraud portals.',
      ta: 'போலி கணக்குகளில் உள்ள பணத்தை எடுக்க கூடுதல் கட்டணம் கேட்கும் ஏமாற்று வேலைகள்.',
      hi: 'नकली खातों में जमा राशि निकालने के लिए अतिरिक्त शुल्क मांगने का धोखा।',
    },
    level: 'INTERMEDIATE',
    estimatedMinutes: 5,
    objectives: {
      en: ['Recognize sunk-cost investment traps', 'Stop transferring further money when withdrawals are blocked'],
      ta: ['பணத்தை இழப்பதைத் தடுக்க மேலும் பணம் அனுப்புவதை நிறுத்துதல்'],
      hi: ['और अधिक पैसे भेजने से बचना'],
    },
    sections: {
      en: [
        {
          title: 'The Sunk-Cost Trap',
          content: 'When you request a withdrawal of ₹2 Lakhs in fake profits, the platform claims your account is frozen due to "tax compliance" and demands ₹30,000 more. Paying this ONLY results in further fee demands.',
        },
      ],
      ta: [{ title: 'பணத் தடுப்பு மோசடி', content: 'பணத்தை எடுக்க மேலும் கட்டணம் கேட்டால் அது 100% மோசடி.' }],
      hi: [{ title: 'निकासी शुल्क घोटाला', content: 'पैसे निकालने के लिए अतिरिक्त शुल्क मांगना 100% घोटाला है।' }],
    },
    keyTakeaways: {
      en: ['Legitimate platforms deduct tax at source (TDS), never requiring separate fresh deposits to release funds'],
      ta: ['பணத்தை வெளியிட கூடுதல் பணம் கேட்கும் தளம் மோசடியானது'],
      hi: ['राशि जारी करने के लिए अलग से पैसे मांगने वाला प्लेटफॉर्म फर्जी है'],
    },
    quizId: 'quiz_withdrawal_fees',
    sourceIds: ['sebi_investor_ed', 'cyber_crime_portal'],
    sources: [VERIFIED_SOURCES.sebi_investor_ed, VERIFIED_SOURCES.cyber_crime_portal],
  },
  {
    id: 'les_recovery_scams',
    trackId: 'track_resilience',
    slug: 'recovery-scams',
    title: {
      en: '20. Recovery Scams: Double Targeting Victims',
      ta: '20. மீட்பு மோசடிகள்: மீண்டும் ஏமாற்றும் தந்திரங்கள்',
      hi: '20. रिकवरी घोटाले: पीड़ितों को दोबारा निशाना बनाना',
    },
    description: {
      en: 'Fake "hackers", "lawyers", or "cyber experts" claiming they can recover lost funds for an upfront fee.',
      ta: 'இழந்த பணத்தை மீட்டுத் தருவதாகக் கூறி மீண்டும் கட்டணம் வாங்கும் ஏமாற்று வேலைகள்.',
      hi: 'गंवाए गए पैसे वापस दिलाने का दावा करके फिर से ठगी करना।',
    },
    level: 'INTERMEDIATE',
    estimatedMinutes: 5,
    objectives: {
      en: ['Identify secondary recovery fraud', 'Report strictly to official 1930 Helpline or cybercrime.gov.in'],
      ta: ['1930 அதிகாரப்பூர்வ ஹெல்ப்லைனில் மட்டுமே புகார் அளித்தல்'],
      hi: ['केवल 1930 आधिकारिक हेल्पलाइन पर शिकायत दर्ज करना'],
    },
    sections: {
      en: [
        {
          title: 'Beware of "Fund Recovery Experts"',
          content: 'After losing money in a scam, victims are targeted on Instagram, Telegram, or Quora by agents claiming they can "hack the scammer" or "retrieve lost crypto" for a 10% fee. These are secondary scams targeting vulnerable victims.',
        },
      ],
      ta: [{ title: 'மீட்பு ஏமாற்று', content: '1930 அரசாங்க உதவி எண் தவிர வேறு யாரும் இழந்த பணத்தை மீட்க முடியாது.' }],
      hi: [{ title: 'रिकवरी धोखा', content: '1930 सरकारी हेल्पलाइन के अलावा कोई भी आपका खोया पैसा वापस नहीं ला सकता।' }],
    },
    keyTakeaways: {
      en: ['Only official law enforcement and cybercrime authorities (1930) can freeze illicit funds'],
      ta: ['அரசு 1930 எண்ணில் மட்டுமே அதிகாரப்பூர்வ புகார் அளிக்க முடியும்'],
      hi: ['केवल 1930 नंबर पर ही आधिकारिक शिकायत दर्ज करें'],
    },
    quizId: 'quiz_recovery_scams',
    sourceIds: ['cyber_crime_portal'],
    sources: [VERIFIED_SOURCES.cyber_crime_portal],
  },

  // --- TRACK 4: DIGITAL FINANCE & WEB3 SAFETY (Lessons 21-26) ---
  {
    id: 'les_wallet_basics',
    trackId: 'track_web3_safety',
    slug: 'wallet-basics-custody',
    title: {
      en: '21. Digital Wallets & Custody Basics',
      ta: '21. டிஜிட்டல் வாலட் & பாதுகாப்பின் அடிப்படை',
      hi: '21. डिजिटल वॉलेट और कस्टडी की मूल बातें',
    },
    description: {
      en: 'Custodial (Exchanges) vs Non-Custodial (Self-Hosted) wallets, public addresses vs private keys.',
      ta: 'எக்ஸ்சேஞ்ச் வாலட் மற்றும் சுயமாக நிர்வகிக்கும் வாலட்களின் வேறுபாடு.',
      hi: 'एक्सचेंज वॉलेट और स्व-प्रबंधित वॉलेट के बीच अंतर।',
    },
    level: 'BEGINNER',
    estimatedMinutes: 5,
    objectives: {
      en: ['Differentiate custodial vs self-hosted wallets', 'Understand public wallet address sharing safety'],
      ta: ['பொது முகவரி மற்றும் ரகசிய சாவியின் வேறுபாடு'],
      hi: ['सार्वजनिक पते और निजी कुंजी के बीच अंतर'],
    },
    sections: {
      en: [
        {
          title: 'Public Address vs Private Key',
          content: 'Your Public Wallet Address is like your bank account number (safe to share to receive funds). Your Private Key / Seed Phrase is your master signature (NEVER SHARE WITH ANYONE).',
        },
      ],
      ta: [{ title: 'வாலட் பாதுகாப்பு', content: 'பொது முகவரியைப் பகிரலாம், ஆனால் ரகசிய சாவியை யாரிடமும் பகிரக் கூடாது.' }],
      hi: [{ title: 'वॉलेट सुरक्षा', content: 'सार्वजनिक पता साझा किया जा सकता है, लेकिन निजी कुंजी कभी नहीं।' }],
    },
    keyTakeaways: {
      en: ['Public address = safe to receive funds', 'Private key = absolute control over funds'],
      ta: ['பொது முகவரி = பணம் பெறலாம்'],
      hi: ['सार्वजनिक पता = पैसा प्राप्त कर सकते हैं'],
    },
    quizId: 'quiz_wallet_basics',
    sourceIds: ['sebi_investor_ed', 'rbi_financial_ed'],
    sources: [VERIFIED_SOURCES.sebi_investor_ed, VERIFIED_SOURCES.rbi_financial_ed],
  },
  {
    id: 'les_private_keys_seed_phrases',
    trackId: 'track_web3_safety',
    slug: 'private-keys-seed-phrases',
    title: {
      en: '22. Seed Phrase Security: Not Your Keys, Not Your Coins',
      ta: '22. சீட் ஃபிரேஸ் (Seed Phrase) பாதுகாப்பு',
      hi: '22. सीड फ्रेज सुरक्षा: आपकी कुंजी नहीं, आपका सिक्का नहीं',
    },
    description: {
      en: 'Protecting the 12/24-word recovery phrase against digital compromise and phishing.',
      ta: '12 சொற்கள் கொண்ட மீட்டெடுப்பு வார்த்தைகளை பத்திரமாக பாதுகாத்தல்.',
      hi: '12 शब्दों के रिकवरी फ़्रेज़ को डिजिटल चोरी से बचाना।',
    },
    level: 'INTERMEDIATE',
    estimatedMinutes: 5,
    objectives: {
      en: ['Store seed phrases offline on paper/hardware', 'Refuse entering seed phrases on websites or forms'],
      ta: ['சீட் ஃபிரேஸை ஆன்லைனில் சேமிக்காமல் தாளில் எழுதி வைத்தல்'],
      hi: ['सीड फ्रेज को कागज पर ऑफ़लाइन लिखकर रखना'],
    },
    sections: {
      en: [
        {
          title: 'The Master Key',
          content: 'Anyone who obtains your 12 or 24-word seed phrase gains immediate, irreversible control of all assets on that wallet address across all blockchain networks.',
          warning: 'No genuine support agent, wallet provider, or web dApp will EVER ask you to type your seed phrase into a website form.',
        },
      ],
      ta: [{ title: 'சீட் ஃபிரேஸ் ரகசியம்', content: 'உங்கள் 12 வார்த்தை சாவி கிடைத்தால் உங்கள் அனைத்து டிஜிட்டல் சொத்துக்களும் களவாடப்படும்.' }],
      hi: [{ title: 'सीड फ्रेज गोपनीयता', content: 'आपका 12 शब्दों का सीड फ्रेज मिलते ही सभी डिजिटल संपत्ति चोरी हो सकती है।' }],
    },
    keyTakeaways: {
      en: ['Never store seed phrases in cloud notes, screenshots, or email', 'Never type seed phrases into websites'],
      ta: ['சீட் ஃபிரேஸை ஸ்கிரீன்ஷாட் எடுக்க வேண்டாம்'],
      hi: ['सीड फ्रेज का स्क्रीनशॉट न लें'],
    },
    quizId: 'quiz_seed_phrases',
    sourceIds: ['cyber_crime_portal'],
    sources: [VERIFIED_SOURCES.cyber_crime_portal],
  },
  {
    id: 'les_token_contract_risk',
    trackId: 'track_web3_safety',
    slug: 'token-and-contract-risk',
    title: {
      en: '23. Token & Smart Contract Risks',
      ta: '23. ஸ்மார்ட் கான்ட்ராக்ட் & டோக்கன் அபாயங்கள்',
      hi: '23. टोकन और स्मार्ट कॉन्ट्रैक्ट जोखिम',
    },
    description: {
      en: 'Honeypots, minting backdoors, unlimited token allowance approvals, and liquidity locks.',
      ta: 'ஹனிபாட் டோக்கன்கள் மற்றும் கட்டுப்பாடற்ற அனுமதி அபாயங்கள்.',
      hi: 'हनीपॉट टोकन और असीमित अनुमति के खतरे।',
    },
    level: 'ADVANCED',
    estimatedMinutes: 6,
    objectives: {
      en: ['Understand ERC-20 / BEP-20 token allowance approvals', 'Identify honeypots that allow buying but block selling'],
      ta: ['டோக்கன் அனுமதி மற்றும் விற்பனை தடையை அறிதல்'],
      hi: ['टोकन अनुमति और बिक्री ब्लॉक को समझना'],
    },
    sections: {
      en: [
        {
          title: 'Unlimited Allowance Approvals',
          content: 'When connecting a Web3 wallet to unknown Decentralized Apps (dApps), signing an "Unlimited Allowance" permission allows the contract to transfer all tokens out of your wallet without secondary confirmation.',
        },
      ],
      ta: [{ title: 'கான்ட்ராக்ட் ஆபத்து', content: 'தெரியாத இணையதளங்களில் வரம்பற்ற வாலட் அனுமதிகளை வழங்க வேண்டாம்.' }],
      hi: [{ title: 'कॉन्ट्रैक्ट खतरा', content: 'अपरिचित साइटों पर असीमित वॉलेट अनुमति न दें।' }],
    },
    keyTakeaways: {
      en: ['Revoke active token allowances regularly on block explorers', 'Never sign unverified smart contract transactions'],
      ta: ['வாலட் அனுமதிகளை அவ்வப்போது ரத்து செய்யுங்கள்'],
      hi: ['समय-समय पर वॉलेट अनुमतियां रद्द करें'],
    },
    quizId: 'quiz_contract_risk',
    sourceIds: ['cyber_crime_portal'],
    sources: [VERIFIED_SOURCES.cyber_crime_portal],
  },
  {
    id: 'les_crypto_investment_scams',
    trackId: 'track_web3_safety',
    slug: 'crypto-investment-scams',
    title: {
      en: '24. Crypto Staking & Cloud Mining Scams',
      ta: '24. போலி கிரிப்டோ ஸ்டேக்கிங் & கிளவுட் மைனிங் மோசடிகள்',
      hi: '24. फर्जी क्रिप्टो स्टेकिंग और क्लाउड माइनिंग घोटाले',
    },
    description: {
      en: 'Fake cloud mining portals promising guaranteed daily USDT returns.',
      ta: 'தினசரி USDT வருமானம் தருவதாகக் கூறும் போலி கிளவுட் மைனிங் தளங்கள்.',
      hi: 'दैनिक यूएसडीटी रिटर्न का वादा करने वाले फर्जी क्लाउड माइनिंग साइट्स।',
    },
    level: 'INTERMEDIATE',
    estimatedMinutes: 5,
    objectives: {
      en: ['Recognize fake USDT yield farming schemes', 'Verify FIU-IND compliance for Indian crypto exchanges'],
      ta: ['அரசுFIU அங்கீகாரம் பெற்ற முகமைகளை மட்டும் பயன்படுத்துதல்'],
      hi: ['FIU-IND पंजीकृत संस्थाओं का उपयोग करना'],
    },
    sections: {
      en: [
        {
          title: 'USDT Staking Fraud',
          content: 'Fraudsters invite users to deposit USDT/crypto into unapproved web portals promising 3% daily yield. In reality, Indian VDA (Virtual Digital Asset) service providers must comply with FIU-IND reporting guidelines.',
        },
      ],
      ta: [{ title: 'கிரிப்டோ மோசடி', content: 'FIU-IND பதிவு பெறாத சர்வதேச தளம் மூலம் கிரிப்டோ முதலீடு செய்வது மிகவும் ஆபத்தானது.' }],
      hi: [{ title: 'क्रिप्टो घोटाला', content: 'FIU-IND अपंजीकृत साइटों पर क्रिप्टो निवेश बहुत जोखिम भरा है।' }],
    },
    keyTakeaways: {
      en: ['Only use FIU-IND registered VDA entities in India', 'Guaranteed crypto yield is a major red flag'],
      ta: ['அரசு பதிவு பெற்ற VDA முகமைகளை மட்டும் தேர்வு செய்யவும்'],
      hi: ['केवल FIU-IND पंजीकृत निकायों का चयन करें'],
    },
    quizId: 'quiz_crypto_scams',
    sourceIds: ['rbi_financial_ed', 'cyber_crime_portal'],
    sources: [VERIFIED_SOURCES.rbi_financial_ed, VERIFIED_SOURCES.cyber_crime_portal],
  },
  {
    id: 'les_fake_airdrops',
    trackId: 'track_web3_safety',
    slug: 'fake-airdrops-drainers',
    title: {
      en: '25. Fake Airdrops & Wallet Drainers',
      ta: '25. போலி ஏர்டிராப் (Airdrop) & வாலட் ட்ரைனர் மோசடிகள்',
      hi: '25. फर्जी एयरड्रॉप और वॉलेट ड्रेनर घोटाले',
    },
    description: {
      en: 'Malicious links promising "Claim $5,000 Free Tokens" that drain wallet balances upon approval.',
      ta: 'இலவச டோக்கன்கள் தருவதாகக் கூறி வாலட் பணத்தை காலி செய்யும் போலி லிங்க்குகள்.',
      hi: 'मुफ्त टोकन का लालच देकर वॉलेट खाली करने वाले खतरनाक लिंक।',
    },
    level: 'INTERMEDIATE',
    estimatedMinutes: 5,
    objectives: {
      en: ['Identify phishing airdrop domains', 'Recognize "permit" or "setApprovalForAll" drainer transactions'],
      ta: ['இலவச டோக்கன் ஆசைக் காட்டும் போலி தளங்களை அறிதல்'],
      hi: ['मुफ्त टोकन देने वाले फर्जी लिंक को पहचानना'],
    },
    sections: {
      en: [
        {
          title: 'The Free Token Trap',
          content: 'Victims receive messages: "Congratulations! You won 10,000 AIRDROP tokens. Click here to claim." Connecting your wallet triggers a malicious approval transaction that drains all valuable ETH, MATIC, or USDT tokens.',
        },
      ],
      ta: [{ title: 'ஏர்டிராப் ஆபத்து', content: 'இலவசமாக கிடைக்கும் எந்த டோக்கனுக்காகவும் அறியாத இணைப்புகளை கிளிக் செய்ய வேண்டாம்.' }],
      hi: [{ title: 'एयरड्रॉप खतरा', content: 'मुफ्त टोकन के लालच में अनजान लिंक पर क्लिक न करें।' }],
    },
    keyTakeaways: {
      en: ['Never connect your main wallet to unverified airdrop websites', 'Free token claims are 99% phishing attempts'],
      ta: ['முக்கிய வாலட்டை புதிய தளங்களில் இணைக்க வேண்டாம்'],
      hi: ['मुख्य वॉलेट को अज्ञात साइटों से न जोड़ें'],
    },
    quizId: 'quiz_fake_airdrops',
    sourceIds: ['cyber_crime_portal'],
    sources: [VERIFIED_SOURCES.cyber_crime_portal],
  },
  {
    id: 'les_phishing_drainers',
    trackId: 'track_web3_safety',
    slug: 'phishing-and-wallet-drainers',
    title: {
      en: '26. Web3 Phishing & Domain Typosquatting',
      ta: '26. Web3 ஃபிஷிங் & போலி இணையதளப் பெயர்கள்',
      hi: '26. Web3 फ़िशिंग और जाली वेबसाइट नाम',
    },
    description: {
      en: 'Spoofed URLs (e.g. opensea-airdrop.net instead of opensea.io) and malicious search ads.',
      ta: 'உண்மையான இணையதளம் போல போலியாக உருவாக்கப்படும் ஃபிஷிங் தளங்கள்.',
      hi: 'असली वेबसाइट की तरह दिखने वाली फर्जी फ़िशिंग साइट्स।',
    },
    level: 'ADVANCED',
    estimatedMinutes: 5,
    objectives: {
      en: ['Spot domain typosquatting tricks', 'Use bookmarks for critical Web3 applications'],
      ta: ['இணையதள முகவரி எழுத்துப் பிழைகளைக் கண்டறிதல்'],
      hi: ['वेबसाइट के स्पेलिंग के अंतर को पहचानना'],
    },
    sections: {
      en: [
        {
          title: 'Typosquatting & Ad Injection',
          content: 'Scammers purchase Google Search Ads for popular platforms using lookalike domains (e.g., binance-verify-app.com). Victims land on a mirrored site that captures credentials or wallet connections.',
        },
      ],
      ta: [{ title: 'ஃபிஷிங் டொமைன்', content: 'இணையதள முகவரியின் எழுத்துக்களை எப்போதும் உன்னிப்பாக கவனியுங்கள்.' }],
      hi: [{ title: 'फ़िशिंग डोमेन', content: 'वेबसाइट का स्पेलिंग हमेशा ध्यान से जांचें।' }],
    },
    keyTakeaways: {
      en: ['Always bookmark official dApp links', 'Never click sponsored search ad links for financial platforms'],
      ta: ['முக்கிய நிதி தளங்களை பிரவுசரில் புக்மார்க் செய்து வைத்துக் கொள்ளவும்'],
      hi: ['महत्वपूर्ण वित्तीय साइटों को बुकमार्क करके रखें'],
    },
    quizId: 'quiz_phishing_drainers',
    sourceIds: ['cyber_crime_portal'],
    sources: [VERIFIED_SOURCES.cyber_crime_portal],
  },
];

export class CurriculumService {
  public getTracks(lang: Lang = 'en'): Track[] {
    return TRACKS;
  }

  public getTrackBySlug(slug: string): Track | undefined {
    return TRACKS.find((t) => t.slug === slug || t.id === slug);
  }

  public getLessons(lang: Lang = 'en', trackSlug?: string): Lesson[] {
    if (!trackSlug) return LESSONS;
    const track = this.getTrackBySlug(trackSlug);
    if (!track) return LESSONS;
    return LESSONS.filter((l) => l.trackId === track.id);
  }

  public getLessonBySlug(slug: string): Lesson | undefined {
    return LESSONS.find((l) => l.slug === slug || l.id === slug);
  }

  public getModules(lang: Lang = 'en') {
    return this.getLessons(lang);
  }

  public getInitialProgress(userId: string) {
    return LESSONS.map((l) => ({
      userId,
      moduleId: l.id,
      status: 'NOT_STARTED',
      completionPercentage: 0,
    }));
  }

  public getNextLesson(currentSlug: string): Lesson | undefined {
    const idx = LESSONS.findIndex((l) => l.slug === currentSlug || l.id === currentSlug);
    if (idx !== -1 && idx < LESSONS.length - 1) {
      return LESSONS[idx + 1];
    }
    return undefined;
  }
}

export const curriculumService = new CurriculumService();
export const financeXAcademy = curriculumService;
