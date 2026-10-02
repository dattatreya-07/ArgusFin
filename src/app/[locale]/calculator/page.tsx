'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { computeAnnualised, CalcSuccessResult } from '@/lib/calc';

export default function CalculatorPage() {
  const t = useTranslations('calculator');

  const [invested, setInvested] = useState<string>('10000');
  const [payout, setPayout] = useState<string>('20000');
  const [durationDays, setDurationDays] = useState<string>('30');
  const [result, setResult] = useState<CalcSuccessResult | null>(() => {
    const initial = computeAnnualised({
      invested: 10000,
      payout: 20000,
      durationDays: 30,
    });
    return initial.success ? initial : null;
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const p = parseFloat(invested);
    const a = parseFloat(payout);
    const d = parseFloat(durationDays);

    const calcRes = computeAnnualised({
      invested: p,
      payout: a,
      durationDays: d,
    });

    if (calcRes.success) {
      setResult(calcRes);
    } else {
      setErrorMsg(calcRes.error);
      setResult(null);
    }
  };

  const getTierBadge = (tier: number) => {
    switch (tier) {
      case 1:
        return {
          label: 'Tier 1: Normal Bank / FD Range',
          color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          desc: t('tier1'),
        };
      case 2:
        return {
          label: 'Tier 2: Broad Market Equity Range',
          color: 'bg-blue-100 text-blue-800 border-blue-300',
          desc: t('tier2'),
        };
      case 3:
        return {
          label: 'Tier 3: Above Sustainable Benchmark',
          color: 'bg-amber-100 text-amber-800 border-amber-300',
          desc: t('tier3'),
        };
      case 4:
      default:
        return {
          label: 'Tier 4: Unsustainable Multiplier',
          color: 'bg-rose-100 text-rose-800 border-rose-300',
          desc: t('tier4'),
        };
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{t('title')}</h1>
        <p className="mt-1 text-sm text-slate-600">
          Deterministic mathematical conversion from promised return to annualised reality.
        </p>
      </div>

      <form
        onSubmit={handleCalculate}
        className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm space-y-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t('investedLabel')}
            </label>
            <input
              type="number"
              step="any"
              value={invested}
              onChange={(e) => setInvested(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t('payoutLabel')}
            </label>
            <input
              type="number"
              step="any"
              value={payout}
              onChange={(e) => setPayout(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t('durationLabel')}
            </label>
            <input
              type="number"
              step="any"
              value={durationDays}
              onChange={(e) => setDurationDays(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              required
            />
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-md">
            {errorMsg}
          </div>
        )}

        <button
          type="submit"
          className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm rounded-md transition shadow-sm"
        >
          {t('calculateBtn')}
        </button>
      </form>

      {result && (
        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4 gap-2">
            <h2 className="text-lg font-bold text-slate-900">{t('resultsTitle')}</h2>
            {(() => {
              const badge = getTierBadge(result.tier);
              return (
                <span
                  className={`inline-block px-3 py-1 text-xs font-semibold rounded-full border ${badge.color}`}
                >
                  {badge.label}
                </span>
              );
            })()}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="block text-xs text-slate-500">{t('multiple')}</span>
              <span className="text-lg font-bold text-slate-900">
                {result.multiple.toFixed(2)}x
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="block text-xs text-slate-500">{t('totalGain')}</span>
              <span className="text-lg font-bold text-slate-900">
                {result.totalGainPct >= 0 ? '+' : ''}
                {result.totalGainPct.toFixed(1)}%
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="block text-xs text-slate-500">{t('annualisedMultiple')}</span>
              <span className="text-lg font-bold text-slate-900">
                {result.overflow
                  ? '> 1,000,000,000x'
                  : `${result.annualisedMultiple >= 1000 ? result.annualisedMultiple.toLocaleString('en-IN', { maximumFractionDigits: 0 }) : result.annualisedMultiple.toFixed(2)}x`}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="block text-xs text-slate-500">{t('annualisedReturn')}</span>
              <span className="text-lg font-bold text-slate-900">
                {result.overflow
                  ? 'Overflow'
                  : `${result.annualisedReturnPct.toLocaleString('en-IN', { maximumFractionDigits: 1 })}%`}
              </span>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 space-y-2">
            <p className="font-semibold text-slate-900">{getTierBadge(result.tier).desc}</p>
            <p className="text-slate-600">{t('tierWarning')}</p>
            {result.overflow && (
              <p className="text-rose-600 font-medium">{t('overflowWarning')}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
