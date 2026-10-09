/**
 * FinanceX - Authoritative Tamil Educational Content Dictionary
 * Production-Quality Translations for Courses, Topics, Lessons, Lesson Content, Resources, Quizzes, and Exams
 */

export interface TamilCourseTranslation {
  course_title: string;
  description: string;
}

export interface TamilTopicTranslation {
  topic_name: string;
  description: string;
}

export interface TamilLessonTranslation {
  title: string;
  description?: string;
}

export interface TamilLessonContentTranslation {
  raw_body: string;
  key_takeaways: string[];
}

export interface TamilQuestionTranslation {
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  explanation: string;
}

export const TAMIL_COURSES: Record<number, TamilCourseTranslation> = {
  1: {
    course_title: 'NISM Series VIII: ஈக்விட்டி டெரிவேடிவ்ஸ் சான்றிதழ் முதன்மை வகுப்பு (Equity Derivatives Masterclass)',
    description: 'SEBI ஆல் அங்கீகரிக்கப்பட்ட NISM-Series-VIII: ஈக்விட்டி டெரிவேடிவ்ஸ் சான்றிதழ் தேர்வுக்கான முழுமையான பயிற்சிப் பாடம்.'
  },
  2: {
    course_title: 'நிலையான வருவாய் & கடன் பத்திரங்கள் பகுப்பாய்வு (Fixed Income & Debt Securities)',
    description: 'அரசுப் பத்திர மகசூல் வளைவுகள் (Yield Curves), கார்ப்பரேட் பத்திரங்கள், கால அளவு ஆபத்து (Duration Risk) மற்றும் வட்டி விகித உணர்திறன் ஆகியவற்றைக் கற்கலாம்.'
  },
  3: {
    course_title: 'NISM Series XV: ஆராய்ச்சி பகுப்பாய்வாளர் சான்றிதழ் (Research Analyst Certification)',
    description: 'துல்லியமான மதிப்பீட்டு முறைகள் மற்றும் ஒழுங்குமுறை விதிகளுடன் நிறுவன பங்கு ஆராய்ச்சியை வெளியிடத் தயாராகுங்கள்.'
  },
  4: {
    course_title: 'நிதி அடிப்படை தத்துவங்கள்: பணத்தின் பரிணாமம் & சந்தைகள் (Evolution of Money & Markets)',
    description: 'பண்டமாற்று முறை முதல் நவீன மத்திய வங்கி, டிஜிட்டல் நாணயம் மற்றும் பரவலாக்கப்பட்ட நிதி (DeFi) வரையிலான வரலாற்றுப் பயணம்.'
  }
};

export const TAMIL_TOPICS: Record<number, TamilTopicTranslation> = {
  1: {
    topic_name: 'பத்திரச் சந்தைகளுக்கான அறிமுகம் (Securities Markets)',
    description: 'முதன்மையான மற்றும் இரண்டாம் நிலை சந்தைகள், பங்குச் சந்தைகள், டெபாசிட்டரிகள் மற்றும் SEBI இன் பங்கு.'
  },
  2: {
    topic_name: 'ஈக்விட்டி டெரிவேடிவ்ஸ் & ஃபியூச்சர்ஸ் விலை நிர்ணயம் (Equity Derivatives & Futures)',
    description: 'ஃபார்வர்டு ஒப்பந்தங்கள், கேஷ்-அண்ட்-கேரி ஆர்பிட்ரேஜ் (Cash-and-Carry Arbitrage), பேசிஸ் மற்றும் ஓபன் இன்ட்ரஸ்ட்.'
  },
  3: {
    topic_name: 'ஆப்ஷன் உத்திகள் & கிரீக்ஸ் (Options Strategies & The Greeks)',
    description: 'டெல்டா (Delta), காமா (Gamma), தீட்டா (Theta), வேகா (Vega), ரோ (Rho), புல் கால் ஸ்ப்ரெட் மற்றும் அயர்ன் கான்டோர்.'
  },
  4: {
    topic_name: 'நிலையான வருவாய், கடன் பத்திரங்கள் & கால அளவு (Fixed Income & Duration)',
    description: 'பத்திர விலை நிர்ணயம், YTM, மேகவ்லே கால அளவு (Macaulay Duration), மாற்றியமைக்கப்பட்ட கால அளவு மற்றும் குவளை (Convexity).'
  },
  5: {
    topic_name: 'SEBI விதிகள் & நடத்தை விதிகள் (SEBI Regulations)',
    description: 'உள்நபர் வர்த்தகத் தடைச் சட்டங்கள் (Insider Trading), டேக்ஓவர் கோட், PFUTP விதிகள் மற்றும் வெளிப்படுத்துதல்கள்.'
  },
  6: {
    topic_name: 'அடிப்படை மதிப்பீடு & நிதி விகிதங்கள் (Fundamental Valuation & Ratios)',
    description: 'DCF மாதிரிகள், WACC, P/E, EV/EBITDA, டுபாண்ட் பகுப்பாய்வு (DuPont Analysis) மற்றும் ROE பகுப்பாய்வு.'
  }
};

export const TAMIL_LESSONS: Record<number, TamilLessonTranslation> = {
  1: { title: 'ஃபியூச்சர்ஸ் ஒப்பந்தங்களின் அடிப்படைகள் (Fundamentals of Futures Contracts)' },
  2: { title: 'ஆப்ஷன் விலை நிர்ணய மெக்கானிக்ஸ் & பிளாக்-ஷோல்ஸ் மாதிரி (Option Pricing & Black-Scholes Model)' },
  3: { title: 'ஆப்ஷன் கிரீக்ஸ்: டெல்டா, காமா, தீட்டா, வேகா & ரோ (Option Greeks: Delta, Gamma, Theta, Vega & Rho)' },
  4: { title: 'புல் கால் ஸ்ப்ரெட்ஸ் & பேர் புட் ஸ்ப்ரெட்ஸ் (Bull Call Spreads & Bear Put Spreads)' },
  5: { title: 'பத்திர விலை நிர்ணயம், YTM & தள்ளுபடி (Bond Pricing, YTM & Discounting)' },
  6: { title: 'மேகவ்லே கால அளவு, மாற்றியமைக்கப்பட்ட கால அளவு & குவளை (Macaulay & Modified Duration)' },
  7: { title: 'மதிப்பீட்டு முறைகள்: தள்ளுபடி செய்யப்பட்ட பணப்புழக்கம் (DCF) & WACC' },
  8: { title: 'ஒப்பீட்டு மதிப்பீடு: P/E, EV/EBITDA & டுபாண்ட் பகுப்பாய்வு (DuPont Analysis)' },
  9: { title: 'SEBI உள்நபர் வர்த்தகம் & PFUTP விதிகள் (SEBI Insider Trading & PFUTP Rules)' },
  10: { title: 'சரக்கு ஃபியூச்சர்ஸ் & மார்ஜின் கட்டமைப்பு (Commodity Futures & SPAN Margin)' },
  11: { title: 'நாணய டெரிவேடிவ்ஸ் & வட்டி விகித ஸ்வாப்கள் (Currency Derivatives & IRS)' },
  12: { title: 'போர்ட்ஃபோலியோ இடர் மேலாண்மை & ஆபத்தில் உள்ள மதிப்பு (VaR)' },
  13: { title: 'நிதிநிலை அறிக்கை பகுப்பாய்வு & பணப்புழக்கம் (FCFF & FCFE Cash Flows)' }
};

export const TAMIL_LESSON_CONTENTS: Record<number, TamilLessonContentTranslation> = {
  1: {
    raw_body: `### ஃபியூச்சர்ஸ் ஒப்பந்தங்களின் அடிப்படைகள் (Fundamentals of Futures Contracts)

ஃபியூச்சர்ஸ் ஒப்பந்தம் (Futures Contract) என்பது எதிர்காலத்தில் ஒரு குறிப்பிட்ட தேதியில், முன்னரே தீர்மானிக்கப்பட்ட விலையில் ஒரு நிதிச் சொத்தை (Financial Asset) வாங்க அல்லது விற்க இரு தரப்பினரிடையே ஏற்படும் சட்டப்பூர்வ ஒப்பந்தமாகும்.

#### முக்கிய விலை நிர்ணய சூத்திரம் (Cost of Carry Model)
ஃபியூச்சர்ஸ் நியாயமான விலை (Fair Futures Price) கணக்கிடும் சூத்திரம்:

$$F = S \\cdot e^{(r - q)T}$$

இங்கு:
- $F$ = ஃபியூச்சர்ஸ் விலை (Futures Price)
- $S$ = ஸ்பாட் விலை (Spot Price)
- $r$ = அபாயமற்ற வட்டி விகிதம் (Risk-free Rate)
- $q$ = ஈவுத்தொகை மகசூல் (Dividend Yield)
- $T$ = முதிர்வு காலம் (Time to Maturity in Years)

#### ஆர்பிட்ரேஜ் & பேசிஸ் (Arbitrage & Basis)
ஸ்பாட் விலைக்கும் ஃபியூச்சர்ஸ் விலைக்கும் இடையே உள்ள வேறுபாடு **Basis (அடிப்படை)** என அழைக்கப்படுகிறது:

$$\\text{Basis} = \\text{Spot Price} - \\text{Futures Price}$$`,
    key_takeaways: [
      'ஃபியூச்சர்ஸ் ஒப்பந்தங்கள் தரப்படுத்தப்பட்டவை (Standardized) மற்றும் பங்குச் சந்தை மூலம் வர்த்தகம் செய்யப்படுபவை.',
      'Cost of Carry மாதிரி ஸ்பாட் விலை, வட்டி விகிதம் மற்றும் ஈவுத்தொகையை அடிப்படையாகக் கொண்டது.',
      'தினசரி சந்தை மதிப்பு சரிசெய்தல் (Mark-to-Market / MTM) மூலம் வர்த்தகரின் கணக்கு சரிபார்க்கப்படுகிறது.'
    ]
  },
  2: {
    raw_body: `### ஆப்ஷன் விலை நிர்ணய மெக்கானிக்ஸ் & பிளாக்-ஷோல்ஸ் மாதிரி (Black-Scholes Model)

பிளாக்-ஷோல்ஸ் மாதிரி (Black-Scholes Model) என்பது யூரோப்பியன் வகை ஆப்ஷன்களின் நியாயமான பிரீமியத்தைக் கணக்கிடப் பயன்படும் உலகளவில் ஏற்றுக்கொள்ளப்பட்ட கணித மாதிரியாகும்.

#### பிளாக்-ஷோல்ஸ் சூத்திரம் (Call Option Premium)
$$C = S N(d_1) - K e^{-rT} N(d_2)$$

இங்கு:
$$d_1 = \\frac{\\ln(S/K) + (r + \\sigma^2/2)T}{\\sigma \\sqrt{T}}$$
$$d_2 = d_1 - \\sigma \\sqrt{T}$$`,
    key_takeaways: [
      'பிளாக்-ஷோல்ஸ் மாதிரி 5 முக்கிய மாறிகளைப் பயன்படுத்துகிறது: S, K, r, T, மற்றும் Volatility (\\sigma).',
      'அபாயமற்ற வட்டி விகிதம் மற்றும் நிலையற்ற தன்மை (Volatility) அதிகரிக்கும் போது Call Option விலை உயரும்.'
    ]
  },
  3: {
    raw_body: `### ஆப்ஷன் கிரீக்ஸ்: டெல்டா, காமா, தீட்டா, வேகா & ரோ (The Options Greeks)

ஆப்ஷன் கிரீக்ஸ் (Option Greeks) என்பது சந்தை மாறிகள் மாற்றமடைம்போது ஆப்ஷனின் பிரீமியம் எவ்வாறு மாறுகிறது என்பதைக் கணிக்கும் உணர்திறன் அளவீடுகளாகும் (Sensitivity Measures).

#### முக்கிய கிரீக்ஸ் வரைவிலக்கணம்
- **Delta (\\Delta)**: அடிப்படை பங்கு விலை ₹1 மாறும்போது பிரீமியம் எவ்வளவு மாறும் என்பதைக் குறிக்கிறது.
- **Gamma (\\Gamma)**: அடிப்படை பங்கு விலை மாறும்போது டெல்டா எவ்வாறு மாறுகிறது என்பதை அளவிடுகிறது.
- **Theta (\\Theta)**: நேர தேய்மானத்தை (Time Decay) குறிக்கிறது. நாட்கள் செல்லச் செல்ல பிரீமியம் குறையும்.
- **Vega (\\nu)**: சந்தை நிலையற்ற தன்மை (Implied Volatility / IV) 1% மாறும்போது பிரீமியம் மாறும் அளவு.`,
    key_takeaways: [
      'ATM Call Option இன் Delta மதிப்பு தோராயமாக 0.50 ஆக இருக்கும்.',
      'Theta எப்போதும் ஆப்ஷன் வாங்குபவர்களுக்கு (Buyers) எதிராகவும், ஆப்ஷன் விற்பனையாளர்களுக்கு (Sellers) சாதகமாகவும் செயல்படும்.'
    ]
  }
};

export const TAMIL_QUESTIONS: Record<number, TamilQuestionTranslation> = {
  1: {
    question_text: 'ஸ்பாட் விலை ₹1,500, அபாயமற்ற வட்டி விகிதம் 6%, மற்றும் 3 மாத ஃபியூச்சர்ஸ் ஒப்பந்தத்தின் நியாயமான விலை என்ன (Cost of Carry மாதிரி மூலம்)?',
    option_a: '₹1,522.60',
    option_b: '₹1,500.00',
    option_c: '₹1,545.00',
    option_d: '₹1,477.50',
    explanation: 'சூத்திரம்: F = S * e^(r*T) = 1500 * e^(0.06 * 0.25) = 1500 * e^(0.015) ≈ ₹1,522.60.'
  },
  2: {
    question_text: 'ஒரு ஆப்ஷனின் Delta 0.65 ஆக உள்ளது. அடிப்படை பங்கு விலை ₹10 உயரும் போது, ஆப்ஷன் பிரீமியம் எவ்வளவு உயரும்?',
    option_a: '₹6.50',
    option_b: '₹10.00',
    option_c: '₹0.65',
    option_d: '₹13.00',
    explanation: 'பிரீமியம் மாற்றம் = Delta * பங்கு விலை மாற்றம் = 0.65 * ₹10 = ₹6.50.'
  },
  3: {
    question_text: 'ஆப்ஷன் காலாவதியாகும் நாள் நெருங்கும் போது, நேர தேய்மானம் (Time Decay / Theta) எவ்வாறு செயல்படும்?',
    option_a: 'நேர தேய்மான வேகம் அதிகரிக்கும் (Theta Acceleration)',
    option_b: 'நேர தேய்மானம் பூஜ்ஜியமாகும்',
    option_c: 'நேர தேய்மானம் மெதுவாகும்',
    option_d: 'எந்த மாற்றமும் இருக்காது',
    explanation: 'ஆப்ஷன் காலாவதி தேதி நெருங்க நெருங்க Theta பாதிப்பு அதிகரித்து, பிரீமியம் வேகமாகக் குறையும்.'
  },
  4: {
    question_text: 'ஒரு பத்திரத்தின் Macaulay Duration 4.5 ஆண்டுகள் மற்றும் YTM 8% எனில், அதன் Modified Duration என்ன?',
    option_a: '4.17 ஆண்டுகள்',
    option_b: '4.50 ஆண்டுகள்',
    option_c: '4.86 ஆண்டுகள்',
    option_d: '3.90 ஆண்டுகள்',
    explanation: 'Modified Duration = Macaulay Duration / (1 + YTM) = 4.5 / (1 + 0.08) = 4.167 ≈ 4.17 ஆண்டுகள்.'
  }
};
