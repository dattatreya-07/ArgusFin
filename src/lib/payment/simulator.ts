import {
  PaymentScenario,
  SimulationState,
  SimulatedPaymentResult,
} from './types';
import { EDUCATIONAL_PAYMENT_SCENARIOS } from './scenarios';

export const PAYMENT_SIMULATOR_DISCLAIMER =
  'EDUCATIONAL SIMULATION ONLY: This simulator demonstrates deceptive advance-fee escalation patterns. No real transactions, payment gateways, or banking systems are connected. Never enter real passwords, card numbers, or OTPs.';

export function getAllScenarios(): PaymentScenario[] {
  return EDUCATIONAL_PAYMENT_SCENARIOS;
}

export function getScenario(id: string): PaymentScenario | undefined {
  return EDUCATIONAL_PAYMENT_SCENARIOS.find((s) => s.id === id);
}

export function initSimulation(scenarioId: string): SimulationState {
  return {
    scenarioId,
    currentStepIndex: 0,
    cumulativeAmountPaid: 0,
    isStopped: false,
    isCompleted: false,
    history: [],
  };
}

export function advanceStep(state: SimulationState): SimulatedPaymentResult {
  const scenario = getScenario(state.scenarioId);
  if (!scenario) {
    return {
      isCompleted: true,
      isStopped: true,
      cumulativePaid: state.cumulativeAmountPaid,
      escalationMultiplier: 1,
      educationalSummary: 'Scenario not found.',
    };
  }

  const currentStep = scenario.steps[state.currentStepIndex];
  if (!currentStep) {
    return {
      isCompleted: true,
      isStopped: state.isStopped,
      cumulativePaid: state.cumulativeAmountPaid,
      escalationMultiplier:
        scenario.steps[0] ? state.cumulativeAmountPaid / scenario.steps[0].demandAmount : 1,
      educationalSummary: scenario.educationalTakeaway,
    };
  }

  // Record fictional payment
  state.cumulativeAmountPaid += currentStep.demandAmount;
  state.history.push({
    stepNumber: currentStep.stepNumber,
    title: currentStep.title,
    amountPaid: currentStep.demandAmount,
    pretext: currentStep.pretext,
    timestamp: new Date().toISOString(),
  });

  const nextIndex = state.currentStepIndex + 1;
  state.currentStepIndex = nextIndex;

  const nextStep = scenario.steps[nextIndex];
  const isCompleted = !nextStep;
  state.isCompleted = isCompleted;

  const initialAmount = scenario.steps[0]?.demandAmount || 1;
  const escalationMultiplier = state.cumulativeAmountPaid / initialAmount;

  return {
    nextStep,
    isCompleted,
    isStopped: false,
    cumulativePaid: state.cumulativeAmountPaid,
    escalationMultiplier,
    educationalSummary: isCompleted
      ? `Simulated loss reached ₹${state.cumulativeAmountPaid.toLocaleString('en-IN')} (${escalationMultiplier.toFixed(1)}x initial request). In real schemes, withdrawals are never unlocked regardless of how many fees are paid.`
      : currentStep.stopRecommendation,
  };
}

export function stopSimulation(state: SimulationState): SimulatedPaymentResult {
  const scenario = getScenario(state.scenarioId);
  state.isStopped = true;

  const initialAmount = scenario?.steps[0]?.demandAmount || 1;
  const escalationMultiplier =
    state.cumulativeAmountPaid > 0 ? state.cumulativeAmountPaid / initialAmount : 0;

  return {
    nextStep: undefined,
    isCompleted: false,
    isStopped: true,
    cumulativePaid: state.cumulativeAmountPaid,
    escalationMultiplier,
    educationalSummary:
      'Safe decision made. By stopping immediately and refusing further demands, you prevent compounding financial loss and preserve evidence for formal reporting.',
  };
}
