'use client';

import { Suspense, useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { computeAnnualised } from '@/lib/calc';
import {
  computeReinvestProjection,
  formatAnnualisedMultiple,
  formatAnnualisedReturnPct,
  formatIndianNumber,
} from '@/lib/format';
import { LadderChart } from '@/components/LadderChart';
import { LadderDisplayModel } from '@/lib/ladder';

type DurationUnit = 'days' | 'weeks' | 'months' | 'years';

function CalculatorContent() {
  const t = useTranslations('calculator');
  const searchParams = useSearchParams();

  // Read URL query parameters if prefilled from /check deep-link
  const paramInvested = searchParams.get('invested') || '10000';
  const paramPayout = searchParams.get('payout') || '20000';
  const paramDays = searchParams.get('days') || '30';

  const [invested, setInvested] = useState<string>(paramInvested);
  const [payout, setPayout] = useState<string>(paramPayout);
  const [durationValue, setDurationValue] = useState<string>(paramDays);
  const [durationUnit, setDurationUnit] = useState<DurationUnit>('days');
  const [ladderData, setLadderData] = useState<LadderDisplayModel | null>(null);

  // Convert duration value + unit to total days
  const totalDays = useMemo(() => {
    const val = parseFloat(durationValue) || 0;
    switch (durationUnit) {
      case 'weeks':
        return val * 7;
      case 'months':
        return val * 30.4167;
      case 'years':
        return val * 365;
      case 'days':
      default:
        return val;
    }
  }, [durationValue, durationUnit]);

  // Load ladder data client-side for threshold injection and chart display
  useEffect(() => {
    fetch('/api/ladder')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setLadderData(data);
      })
      .catch(() => {
        // Safe offline fallback
      });
  }, []);

  // Compute calculation
  const calcResult = useMemo(() => {
    const p = parseFloat(invested);
    const a = parseFloat(payout);

    if (!Number.isFinite(p) || !Number.isFinite(a) || totalDays <= 0 || p <= 0 || a <= 0) {
      return null;
    }

    // Only inject thresholds if ladder data has active verified rungs
    const hasVerifiedLadderData = (ladderData?.activeRungs.length || 0) > 0;
    const thresholds = hasVerifiedLadderData
      ? {
          tier1MaxAnnualisedReturnPct: 8,
          tier2MaxAnnualisedReturnPct: 15,
        }
      : undefined;

    return computeAnnualised({
      invested: p,
      payout: a,
      durationDays: totalDays,
      thresholds,
    });
  }, [invested, payout, totalDays, ladderData]);

  // 12-Month Reinvestment projection view
  const reinvestProjection = useMemo(() => {
    if (!calcResult || !calcResult.success) return null;
    const p = parseFloat(invested) || 0;
    return computeReinvestProjection(
      p,
      calcResult.annualisedMultiple,
      totalDays,
      calcResult.overflow
    );
  }, [calcResult, invested, totalDays]);

  const hasVerifiedLadder = (ladderData?.activeRungs.length || 0) > 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {t('title')}
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Convert any return promise into its annualised percentage and compare against real market benchmarks.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-6 space-y-6">
          <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm space-y-5">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Investment Promise Inputs
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('investedLabel')}
              </label>
              <input
                type="number"
                min="1"
                step="any"
                value={invested}
                onChange={(e) => setInvested(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                placeholder="e.g. 10000"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('payoutLabel')}
              </label>
              <input
                type="number"
                min="1"
                step="any"
                value={payout}
                onChange={(e) => setPayout(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                placeholder="e.g. 20000"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Duration & Time Unit
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0.1"
                  step="any"
                  value={durationValue}
                  onChange={(e) => setDurationValue(e.target.value)}
                  className="w-2/3 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                  placeholder="30"
                />
                <select
                  value={durationUnit}
                  onChange={(e) => setDurationUnit(e.target.value as DurationUnit)}
                  className="w-1/3 px-2 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-medium bg-white"
                >
                  <option value="days">Days</option>
                  <option value="weeks">Weeks</option>
                  <option value="months">Months</option>
                  <option value="years">Years</option>
                </select>
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                Total duration: {totalDays.toFixed(1)} days
              </p>
            </div>
          </div>

          {/* Reality Check Output */}
          {calcResult && calcResult.success && (
            <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-base font-bold text-slate-900">{t('resultsTitle')}</h2>
                {calcResult.tier === 4 ? (
                  <span className="px-2.5 py-1 text-xs font-bold rounded-full border bg-rose-100 text-rose-800 border-rose-300">
                    Tier 4: Unsustainable
                  </span>
                ) : hasVerifiedLadder ? (
                  <span className="px-2.5 py-1 text-xs font-bold rounded-full border bg-blue-100 text-blue-800 border-blue-300">
                    Tier {calcResult.tier}
                  </span>
                ) : null}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <span className="block text-[11px] text-slate-500">{t('multiple')}</span>
                  <span className="text-base font-bold text-slate-900">
                    {calcResult.multiple.toFixed(2)}x
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <span className="block text-[11px] text-slate-500">{t('totalGain')}</span>
                  <span className="text-base font-bold text-slate-900">
                    {calcResult.totalGainPct >= 0 ? '+' : ''}
                    {calcResult.totalGainPct.toFixed(1)}%
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <span className="block text-[11px] text-slate-500">{t('annualisedMultiple')}</span>
                  <span className="text-base font-bold text-slate-900">
                    {formatAnnualisedMultiple(calcResult.annualisedMultiple, calcResult.overflow)}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <span className="block text-[11px] text-slate-500">{t('annualisedReturn')}</span>
                  <span className="text-base font-bold text-slate-900">
                    {formatAnnualisedReturnPct(calcResult.annualisedReturnPct, calcResult.overflow)}
                  </span>
                </div>
              </div>

              {/* Tier and Explanation */}
              {calcResult.tier === 4 && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 space-y-1">
                  <p className="font-bold uppercase tracking-wide">
                    ⚠️ {t('tier4')}
                  </p>
                  <p>{t('tierWarning')}</p>
                </div>
              )}

              {/* 12-Month Reinvestment View */}
              {reinvestProjection && (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 space-y-1">
                  <p className="font-bold text-amber-800">
                    📈 12-Month Compounding Projection (If rate repeated):
                  </p>
                  <p className="text-sm font-extrabold text-amber-950">
                    {reinvestProjection.formattedValue}
                  </p>
                  <p className="text-[11px] text-amber-700">
                    Starting from ₹{formatIndianNumber(parseFloat(invested) || 0, 0)} compounded over {reinvestProjection.periodsPerYear.toFixed(1)} cycles.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Ladder Benchmark Chart Column */}
        <div className="lg:col-span-6">
          <LadderChart
            ladderModel={ladderData}
            promiseAnnualisedPct={
              calcResult && calcResult.success ? calcResult.annualisedReturnPct : null
            }
            promiseMultiple={
              calcResult && calcResult.success ? calcResult.annualisedMultiple : null
            }
          />
        </div>
      </div>
    </div>
  );
}

export default function CalculatorPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500 text-sm">Loading Calculator...</div>}>
      <CalculatorContent />
    </Suspense>
  );
}
