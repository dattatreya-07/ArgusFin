'use client';

import React, { useState } from 'react';
import {
  getAllScenarios,
  initSimulation,
  advanceStep,
  stopSimulation,
  PAYMENT_SIMULATOR_DISCLAIMER,
} from '@/lib/payment';
import { SimulationState } from '@/lib/payment/types';

export function PaymentEscalationSimulator() {
  const scenarios = getAllScenarios();
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(scenarios[0].id);
  const [simState, setSimState] = useState<SimulationState>(() =>
    initSimulation(scenarios[0].id)
  );

  const currentScenario = scenarios.find((s) => s.id === selectedScenarioId) || scenarios[0];
  const currentStep = currentScenario.steps[simState.currentStepIndex];

  const handleSelectScenario = (id: string) => {
    setSelectedScenarioId(id);
    setSimState(initSimulation(id));
  };

  const handlePayStep = () => {
    const nextState = { ...simState };
    advanceStep(nextState);
    setSimState(nextState);
  };

  const handleStop = () => {
    const nextState = { ...simState };
    stopSimulation(nextState);
    setSimState(nextState);
  };

  const handleReset = () => {
    setSimState(initSimulation(selectedScenarioId));
  };

  const initialAmount = currentScenario.steps[0]?.demandAmount || 1;
  const multiplier = (simState.cumulativeAmountPaid / initialAmount).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Educational Notice Banner */}
      <div className="p-4 rounded-xl bg-risk-medium-bg border border-risk-medium-border text-risk-medium-ink text-xs space-y-1">
        <span className="font-bold flex items-center gap-1.5">
          <span>🛡️</span> {PAYMENT_SIMULATOR_DISCLAIMER}
        </span>
      </div>

      {/* Scenario Selector */}
      <div className="bg-surface border border-border rounded-2xl p-6 shadow-soft space-y-4">
        <label className="block text-xs font-bold text-ink-muted uppercase tracking-wider">
          Select Deceptive Escalation Scenario
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {scenarios.map((scen) => {
            const isSelected = selectedScenarioId === scen.id;
            return (
              <button
                key={scen.id}
                type="button"
                onClick={() => handleSelectScenario(scen.id)}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                  isSelected
                    ? 'bg-accent-soft border-accent text-ink ring-2 ring-accent'
                    : 'bg-surface-sunken border-border text-ink hover:border-accent/60'
                }`}
              >
                <div>
                  <span className="text-xs font-semibold text-accent block mb-1 uppercase font-mono">
                    {scen.category.replace(/_/g, ' ')}
                  </span>
                  <span className="text-sm font-bold text-ink">{scen.title}</span>
                  <p className="text-xs text-ink-muted mt-1 line-clamp-2">{scen.description}</p>
                </div>
                <span className="text-[11px] text-accent font-mono mt-2 block font-semibold">
                  Initial bait: {scen.initialPromisedReturn}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Simulation Card */}
      <div className="bg-surface border border-border rounded-2xl p-6 shadow-soft space-y-6">
        {/* Cumulative Exposure Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-surface-sunken rounded-xl border border-border">
          <div>
            <span className="text-[11px] text-ink-muted block font-mono">Total Demanded:</span>
            <span className="text-lg font-extrabold text-risk-high-ink font-mono">
              ₹{simState.cumulativeAmountPaid.toLocaleString('en-IN')}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-ink-muted block font-mono">Escalation Multiplier:</span>
            <span className="text-lg font-extrabold text-accent font-mono">{multiplier}x initial request</span>
          </div>
          <div>
            <span className="text-[11px] text-ink-muted block font-mono">Simulation Status:</span>
            <span
              className={`text-sm font-bold font-mono ${
                simState.isStopped
                  ? 'text-emerald-700'
                  : simState.isCompleted
                  ? 'text-risk-high-ink'
                  : 'text-accent'
              }`}
            >
              {simState.isStopped
                ? '✅ Stopped Early (Saved Funds)'
                : simState.isCompleted
                ? '🚨 Max Trap Reached'
                : `Step ${simState.currentStepIndex + 1} of ${currentScenario.steps.length}`}
            </span>
          </div>
        </div>

        {/* Current Step Display or Conclusion */}
        {!simState.isCompleted && !simState.isStopped && currentStep && (
          <div className="space-y-4 p-5 rounded-xl bg-surface-sunken border border-border">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-risk-high-ink uppercase tracking-wider font-mono">
                Step {currentStep.stepNumber}: {currentStep.title}
              </span>
              <span className="text-sm font-bold text-risk-high-ink bg-risk-high-bg px-3 py-1 rounded-md border border-risk-high-border font-mono">
                Demanding: ₹{currentStep.demandAmount.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="space-y-2 text-xs text-ink leading-relaxed">
              <p className="bg-surface p-3 rounded-lg border border-border">
                <strong className="text-ink block mb-1">Pretext Used by Scammer:</strong>
                {currentStep.pretext}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-lg bg-risk-medium-bg border border-risk-medium-border text-risk-medium-ink">
                  <strong className="block text-[11px] uppercase tracking-wider mb-1 font-mono">
                    Psychological Pressure:
                  </strong>
                  {currentStep.psychologicalTrigger}
                </div>
                <div className="p-3 rounded-lg bg-surface border border-border text-ink">
                  <strong className="block text-[11px] uppercase tracking-wider mb-1 font-mono text-accent">
                    What You Should Check:
                  </strong>
                  {currentStep.whatToCheck}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-3">
              <button
                type="button"
                onClick={handlePayStep}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-xs bg-risk-high-bg border border-risk-high-border text-risk-high-ink hover:bg-risk-high-border/20 transition-all cursor-pointer"
              >
                Simulate Paying ₹{currentStep.demandAmount.toLocaleString('en-IN')} (See Escalation) →
              </button>
              <button
                type="button"
                onClick={handleStop}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-xs bg-accent text-accent-ink hover:opacity-90 transition-all shadow-soft cursor-pointer"
              >
                🛑 Stop Here & Refuse Payment (Best Action)
              </button>
            </div>
          </div>
        )}

        {/* Conclusion / Outcome Screen */}
        {(simState.isCompleted || simState.isStopped) && (
          <div
            className={`p-6 rounded-xl border space-y-4 ${
              simState.isStopped
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : 'bg-risk-high-bg border-risk-high-border text-risk-high-ink'
            }`}
          >
            <h3 className="text-base font-bold flex items-center gap-2">
              <span>{simState.isStopped ? '🛡️' : '🚨'}</span>
              <span>{simState.isStopped ? 'Simulation Stopped Safely' : 'Deceptive Escalation Complete'}</span>
            </h3>

            <p className="text-xs leading-relaxed">
              {simState.isStopped
                ? 'You stopped the simulation before further compounding demands. In genuine investments, fees are transparently disclosed upfront and never requested via repeated ad-hoc transfers to release frozen balances.'
                : currentScenario.educationalTakeaway}
            </p>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-surface border border-border text-ink hover:bg-surface-sunken transition-all cursor-pointer"
              >
                ↺ Restart Scenario
              </button>
            </div>
          </div>
        )}

        {/* Transaction History Log */}
        {simState.history.length > 0 && (
          <div className="space-y-2 pt-4 border-t border-border">
            <h4 className="text-xs font-bold text-ink-muted uppercase tracking-wider font-mono">
              Simulated Escalation Trail ({simState.history.length} steps)
            </h4>
            <div className="space-y-1.5 font-mono text-xs">
              {simState.history.map((h, idx) => (
                <div
                  key={idx}
                  className="p-2.5 bg-surface-sunken rounded-lg border border-border flex justify-between items-center text-ink"
                >
                  <span>
                    Step {h.stepNumber}: {h.title}
                  </span>
                  <span className="text-risk-high-ink font-bold">
                    +₹{h.amountPaid.toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
