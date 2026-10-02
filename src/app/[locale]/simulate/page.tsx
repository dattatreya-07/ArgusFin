'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { ScamSimulator } from '@/components/simulators/ScamSimulator';

export default function SimulatorPage() {
  const t = useTranslations('simulator');

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* Header */}
      <div className="space-y-2 text-center md:text-left">
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <span className="p-2 bg-amber-950 border border-amber-800 text-amber-400 rounded-xl text-xl">
            📉
          </span>
          {t('title')}
        </h1>
        <p className="text-zinc-400 text-base max-w-2xl">{t('subtitle')}</p>
      </div>

      <ScamSimulator />
    </div>
  );
}
