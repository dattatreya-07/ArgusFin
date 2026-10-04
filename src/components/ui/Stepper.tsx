import React from 'react';

export interface StepperProps {
  currentStep: number;
  totalSteps: number;
  stepLabel?: string;
  label?: string;
  onStepClick?: (step: number) => void;
}

export function Stepper({
  currentStep,
  totalSteps,
  stepLabel,
  label,
  onStepClick,
}: StepperProps) {
  const displayLabel = label || stepLabel || `Step ${currentStep} of ${totalSteps}`;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs sm:text-sm text-ink-muted">
        <span className="font-bold text-ink">
          {displayLabel}
        </span>
        <span aria-hidden="true" className="font-mono">
          {Math.round((currentStep / totalSteps) * 100)}%
        </span>
      </div>

      <div
        role="progressbar"
        aria-valuenow={currentStep}
        aria-valuemin={1}
        aria-valuemax={totalSteps}
        aria-label="Progress"
        className="w-full h-2.5 bg-surface-sunken border border-border rounded-pill overflow-hidden"
      >
        <div
          className="h-full bg-accent transition-all duration-300 rounded-pill"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>
    </div>
  );
}
