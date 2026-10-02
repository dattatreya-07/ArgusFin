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
      <div className="p-4 rounded-xl bg-amber-950/60 border border-amber-800 text-amber-200 text-xs space-y-1">
        <span className="font-bold flex items-center gap-1.5">
          <span>🛡️</span> {PAYMENT_SIMULATOR_DISCLAIMER}
        </span>
      </div>

      {/* Scenario Selector */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider">
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
                    ? 'bg-rose-950/70 border-rose-500 text-white ring-1 ring-rose-500'
                    : 'bg-zinc-950/60 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                }`}
              >
                <div>
                  <span className="text-xs font-semibold text-rose-400 block mb-1">
                    {scen.category.replace(/_/g, ' ')}
                  </span>
                  <span className="text-sm font-bold text-white">{scen.title}</span>
                  <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{scen.description}</p>
                </div>
                <span className="text-[11px] text-emerald-400 font-mono mt-2 block">
                  Initial bait: {scen.initialPromisedReturn}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Simulation Card */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6">
        {/* Cumulative Exposure Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-zinc-950 rounded-xl border border-zinc-800">
          <div>
            <span className="text-[11px] text-zinc-500 block">Total Fictional Demanded:</span>
            <span className="text-lg font-extrabold text-rose-400">
              ₹{simState.cumulativeAmountPaid.toLocaleString('en-IN')}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-zinc-500 block">Escalation Multiplier:</span>
            <span className="text-lg font-extrabold text-amber-400">{multiplier}x initial request</span>
          </div>
          <div>
            <span className="text-[11px] text-zinc-500 block">Simulation Status:</span>
            <span
              className={`text-sm font-bold ${
                simState.isStopped
                  ? 'text-emerald-400'
                  : simState.isCompleted
                  ? 'text-rose-500'
                  : 'text-amber-400'
              }`}
            >
              {simState.isStopped
                ? '✅ Stopped Early (Saved Funds)'
                : simState.isCompleted
                ? '🚨 Max Escalation Trap Reached'
                : `Step ${simState.currentStepIndex + 1} of ${currentScenario.steps.length}`}
            </span>
          </div>
        </div>

        {/* Current Step Display or Conclusion */}
        {!simState.isCompleted && !simState.isStopped && currentStep && (
          <div className="space-y-4 p-5 rounded-xl bg-zinc-950/80 border border-zinc-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                Step {currentStep.stepNumber}: {currentStep.title}
              </span>
              <span className="text-sm font-bold text-white bg-rose-950 px-3 py-1 rounded-md border border-rose-800">
                Demanding: ₹{currentStep.demandAmount.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="space-y-2 text-xs text-zinc-300 leading-relaxed">
              <p className="bg-zinc-900 p-3 rounded-lg border border-zinc-800">
                <strong className="text-zinc-200 block mb-1">Pretext Used by Scammer:</strong>
                {currentStep.pretext}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-900/60 text-amber-200">
                  <strong className="block text-[11px] uppercase tracking-wider mb-1">
                    Psychological Pressure:
                  </strong>
                  {currentStep.psychologicalTrigger}
                </div>
                <div className="p-3 rounded-lg bg-blue-950/30 border border-blue-900/60 text-blue-200">
                  <strong className="block text-[11px] uppercase tracking-wider mb-1">
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
                className="flex-1 py-3 px-4 rounded-xl font-bold text-xs bg-rose-900/60 border border-rose-700 text-rose-200 hover:bg-rose-800 transition-all cursor-pointer"
              >
                Simulate Paying ₹{currentStep.demandAmount.toLocaleString('en-IN')} (See Escalation) →
              </button>
              <button
                type="button"
                onClick={handleStop}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-xs bg-emerald-600 text-white hover:bg-emerald-500 transition-all shadow-lg cursor-pointer"
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
                ? 'bg-emerald-950/40 border-emerald-800 text-emerald-100'
                : 'bg-rose-950/40 border-rose-800 text-rose-100'
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
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-zinc-800 text-white hover:bg-zinc-700 transition-all cursor-pointer"
              >
                ↺ Restart Scenario
              </button>
            </div>
          </div>
        )}

        {/* Transaction History Log */}
        {simState.history.length > 0 && (
          <div className="space-y-2 pt-4 border-t border-zinc-800">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Simulated Escalation Trail ({simState.history.length} steps)
            </h4>
            <div className="space-y-1.5 font-mono text-xs">
              {simState.history.map((h, idx) => (
                <div
                  key={idx}
                  className="p-2.5 bg-zinc-950 rounded-lg border border-zinc-800 flex justify-between items-center text-zinc-300"
                >
                  <span>
                    Step {h.stepNumber}: {h.title}
                  </span>
                  <span className="text-rose-400 font-bold">
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
