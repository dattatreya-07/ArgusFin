export interface Lesson {
  id: string;
  slug: string;
  title: Record<string, string>; // en, hi, ta
  category: 'FOUNDATION' | 'METRICS' | 'MARKETS' | 'SCAMS';
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  estimatedMinutes: number;
  summary: Record<string, string>;
  explanation: Record<string, string>;
  example: Record<string, string>;
  questionToAsk: Record<string, string>;
  misconception: Record<string, string>;
  sourceTitle: string;
  sourceUrl: string;
  publisher: string;
  asOf: string;
  relatedLessons?: string[];
  relatedGlossaryTerms?: string[];
  relatedCheckPatterns?: string[];
  simulatorLink?: string;
  simulatorAction?: string;
}

export interface FinancialInstrument {
  id: string;
  slug: string;
  name: Record<string, string>;
  category: 'DEBT_SAVINGS' | 'EQUITY' | 'HYBRID_DERIVATIVES' | 'COMMODITIES';
  regulator: string;
  depositoryOrExchange?: string;
  typicalReturnsBenchmark: string;
  riskProfile: Record<string, string>;
  whatIsIt: Record<string, string>;
  howItWorks: Record<string, string>;
  howValueChanges: Record<string, string>;
  commonRisks: Record<string, string>;
  liquidity: Record<string, string>;
  costs: Record<string, string>;
  beginnerQuestion: Record<string, string>;
  sourceTitle: string;
  sourceUrl: string;
  asOf: string;
}

export interface GlossaryTerm {
  term: string;
  slug: string;
  category: string;
  definition: Record<string, string>;
  example: Record<string, string>;
  sourceTitle?: string;
  sourceUrl?: string;
}

export interface RegulatorEntry {
  id: string;
  slug: string;
  name: string;
  fullName: Record<string, string>;
  role: string;
  whatTheyDo: Record<string, string>;
  whatTheyDoNotDo: Record<string, string>;
  officialSourceUrl: string;
}

export interface ScamModule {
  id: string;
  slug: string;
  title: Record<string, string>;
  archetype: string;
  summary: Record<string, string>;
  howItOperates: Record<string, string>;
  warningSigns: Record<string, string>[];
  socraticQuestions: Record<string, string>[];
  sourceTitle: string;
  sourceUrl: string;
  asOf: string;
}
