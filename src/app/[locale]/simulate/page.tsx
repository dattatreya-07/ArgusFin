'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ScamSimulator } from '@/components/simulators/ScamSimulator';
import { PaymentEscalationSimulator } from '@/components/simulators/PaymentEscalationSimulator';

export default function SimulatorPage() {
  const t = useTranslations('simulator');
  const [activeTab, setActiveTab] = useState<'escalation' | 'ponzi'>('escalation');

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* Header */}
      <div className="space-y-2 text-center md:text-left">
        <h1 className="text-3xl font-extrabold text-ink tracking-tight flex items-center gap-3">
          <span className="p-2 bg-accent-soft border border-border text-accent rounded-xl text-xl">
            📉
          </span>
          {t('title')}
        </h1>
        <p className="text-ink-muted text-base max-w-2xl">{t('subtitle')}</p>
      </div>

      {/* Simulator Mode Tabs */}
      <div className="flex gap-2 p-1.5 bg-surface-sunken border border-border rounded-xl">
        <button
          type="button"
          onClick={() => setActiveTab('escalation')}
          className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'escalation'
              ? 'bg-surface border border-accent text-accent shadow-soft font-mono'
              : 'text-ink-muted hover:text-ink font-mono'
          }`}
        >
          💳 Advance-Fee Payment Escalation
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('ponzi')}
          className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'ponzi'
              ? 'bg-surface border border-accent text-accent shadow-soft font-mono'
              : 'text-ink-muted hover:text-ink font-mono'
          }`}
        >
          📊 Ponzi Cashflow Collapse Dynamics
        </button>
      </div>

      {activeTab === 'escalation' ? (
        <PaymentEscalationSimulator />
      ) : (
        <ScamSimulator />
      )}
    </div>
  );
}
