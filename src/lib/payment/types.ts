export type PretextType =
  | 'INITIAL_DEPOSIT'
  | 'VIP_UPGRADE'
  | 'WITHDRAWAL_TAX'
  | 'FROZEN_ACCOUNT_UNLOCK'
  | 'TDS_DEPOSIT'
  | 'SECURITY_MARGIN';

export interface PaymentStep {
  id: string;
  stepNumber: number;
  title: string;
  demandAmount: number;
  pretext: string;
  pretextType: PretextType;
  psychologicalTrigger: string;
  whatToCheck: string;
  stopRecommendation: string;
}

export interface PaymentScenario {
  id: string;
  title: string;
  category: string;
  description: string;
  initialPromisedReturn: string;
  steps: PaymentStep[];
  educationalTakeaway: string;
}

export interface SimulationState {
  scenarioId: string;
  currentStepIndex: number;
  cumulativeAmountPaid: number;
  isStopped: boolean;
  isCompleted: boolean;
  history: Array<{
    stepNumber: number;
    title: string;
    amountPaid: number;
    pretext: string;
    timestamp: string;
  }>;
}

export interface SimulatedPaymentResult {
  nextStep?: PaymentStep;
  isCompleted: boolean;
  isStopped: boolean;
  cumulativePaid: number;
  escalationMultiplier: number;
  educationalSummary: string;
}
