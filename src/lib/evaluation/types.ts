import { Archetype, Lang, RiskBand } from '@/lib/types';
import { CanonicalSource } from '@/lib/scam/types';

export type EvaluationCategory =
  | 'scam_promise'
  | 'benign_education'
  | 'adversarial_prompt_injection'
  | 'ocr_corrupted'
  | 'return_math'
  | 'copy_trading'
  | 'crypto'
  | 'payment_escalation'
  | 'credential_request'
  | 'url_phishing'
  | 'mixed_language';

export type CaseProvenance =
  | 'HUMAN_AUTHORED'
  | 'PUBLIC_SOURCE_DERIVED'
  | 'SYNTHETIC'
  | 'ADVERSARIAL_SYNTHETIC'
  | 'OCR_DERIVED'
  | 'TRANSLATION_DERIVED';

export type CaseDifficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'ADVERSARIAL';

export interface EvaluationCase {
  id: string;
  language: Lang;
  source: CanonicalSource;
  input: string;
  normalizedInput?: string;
  category: EvaluationCategory;
  expectedArchetype: Archetype;
  expectedRiskBand: RiskBand;
  expectedSignals?: string[];
  expectedClaims?: Record<string, any>;
  expectedDuration?: number | null;
  expectedReturn?: number | null;
  expectedPaymentRequest?: boolean;
  expectedCredentialRequest?: boolean;
  expectedURLSignals?: string[];
  expectedOutcome?: 'DECISION_AVAILABLE' | 'DECISION_DEGRADED' | 'DECISION_UNAVAILABLE';
  provenance: CaseProvenance;
  difficulty: CaseDifficulty;
  tags: string[];
  notes?: string;
}

export interface CaseEvalResult {
  id: string;
  language: Lang;
  category: EvaluationCategory;
  difficulty: CaseDifficulty;
  expectedArchetype: Archetype;
  actualArchetype: Archetype;
  archetypeMatch: boolean;
  expectedRiskBand: RiskBand;
  actualRiskBand: RiskBand;
  riskMatch: boolean;
  passed: boolean;
  failureCategory?: string;
  failureReason?: string;
  executionTimeMs: number;
}

export interface AggregateMetrics {
  totalCases: number;
  overallAccuracyPct: number;
  highRiskRecallPct: number;
  benignFalseAlarmPct: number;
  perLanguage: Record<Lang, { total: number; accuracyPct: number; recallPct: number; falseAlarmPct: number }>;
  perArchetype: Record<Archetype, { total: number; correct: number; precisionPct: number }>;
  perCategory: Record<string, { total: number; passed: number; passRatePct: number }>;
  perChannel: Record<string, { total: number; passed: number; passRatePct: number }>;
}
