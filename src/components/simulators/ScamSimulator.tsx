'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';

export function ScamSimulator() {
  const t = useTranslations('simulator');

  const [initialDeposit, setInitialDeposit] = useState<number>(10000);
  const [dailyRatePct, setDailyRatePct] = useState<number>(5);
  const [days, setDays] = useState<number>(30);
  const [newVictimCount, setNewVictimCount] = useState<number>(5);

  // Compute daily simulation timeline
  const simulationResults = useMemo(() => {
    let pool = initialDeposit;
    let totalInflow = initialDeposit;
    let totalOutflow = 0;
    let collapseDay: number | null = null;

    const timeline: Array<{
      day: number;
      pool: number;
      payoutDue: number;
      newInflow: number;
      status: 'solvent' | 'collapsed';
    }> = [];

    for (let day = 1; day <= days; day++) {
      // Inflow decreases exponentially as recruiting slows down
      const decayFactor = Math.max(0.1, 1 - (day / (days * 0.75)));
      const todayNewDeposits = day <= 10 ? newVictimCount * initialDeposit * decayFactor : (newVictimCount * initialDeposit * 0.15 * decayFactor);
      
      // Daily return owed to existing participants
      const promisedDailyGain = (totalInflow * dailyRatePct) / 100;
      
      pool += todayNewDeposits;
      totalInflow += todayNewDeposits;

      // Payouts demanded (assuming 40% requested as withdrawals)
      const withdrawalDemand = promisedDailyGain * 0.6;
      
      if (pool >= withdrawalDemand) {
        pool -= withdrawalDemand;
        totalOutflow += withdrawalDemand;
        timeline.push({
          day,
          pool: Math.round(pool),
          payoutDue: Math.round(withdrawalDemand),
          newInflow: Math.round(todayNewDeposits),
          status: 'solvent',
        });
      } else {
        if (!collapseDay) collapseDay = day;
        timeline.push({
          day,
          pool: 0,
          payoutDue: Math.round(withdrawalDemand),
          newInflow: Math.round(todayNewDeposits),
          status: 'collapsed',
        });
      }
    }

    return { timeline, collapseDay, totalInflow, totalOutflow };
  }, [initialDeposit, dailyRatePct, days, newVictimCount]);

  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6">
      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-zinc-400">
            {t('initialDeposit')} (₹)
          </label>
          <input
            type="number"
            value={initialDeposit}
            onChange={(e) => setInitialDeposit(Math.max(1000, Number(e.target.value)))}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-zinc-400">
            {t('promisedDaily')} (%)
          </label>
          <input
            type="number"
            value={dailyRatePct}
            onChange={(e) => setDailyRatePct(Math.max(1, Math.min(50, Number(e.target.value))))}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-zinc-400">
            {t('simDays')} (10-60)
          </label>
          <input
            type="number"
            value={days}
            onChange={(e) => setDays(Math.max(10, Math.min(60, Number(e.target.value))))}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Collapse Alert Banner */}
      {simulationResults.collapseDay ? (
        <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-sm flex items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="font-bold text-rose-100 flex items-center gap-2">
              🚨 {t('collapsed')} — Day {simulationResults.collapseDay}
            </span>
            <p className="text-xs text-rose-300">
              On Day {simulationResults.collapseDay}, withdrawal requests exceed total available deposits. The scammer blocks accounts and deletes communication groups.
            </p>
          </div>
          <span className="px-3 py-1 bg-rose-900 border border-rose-700 text-white rounded-lg text-xs font-bold whitespace-nowrap">
            Pool Deficit
          </span>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-amber-950/50 border border-amber-800 text-amber-200 text-sm">
          <span className="font-bold">⚠️ {t('solvent')}</span>: System is currently paying early users exclusively using new members&apos; deposits.
        </div>
      )}

      {/* Visual Timeline Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-zinc-400">
          <span>Day 1 (Initial Lure)</span>
          <span>Day {Math.floor(days / 2)} (Peak Inflow)</span>
          <span>Day {days} (Inevitable Deficit)</span>
        </div>
        <div className="h-6 w-full bg-zinc-950 rounded-lg overflow-hidden flex border border-zinc-800">
          {simulationResults.timeline.map((item) => (
            <div
              key={item.day}
              title={`Day ${item.day}: Reserve Pool ₹${item.pool.toLocaleString('en-IN')}`}
              className={`h-full flex-1 transition-all ${
                item.status === 'solvent'
                  ? item.day <= (simulationResults.collapseDay ? simulationResults.collapseDay / 2 : 10)
                    ? 'bg-emerald-600'
                    : 'bg-amber-500'
                  : 'bg-rose-600 animate-pulse'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Explanatory Box */}
      <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-400 leading-relaxed space-y-2">
        <h4 className="font-bold text-zinc-200">💡 Mathematical Reality of Doubling Schemes:</h4>
        <p>{t('reserveExplanation')}</p>
        <p className="text-zinc-500 italic">
          No trading algorithm, crypto mining bot, or VIP strategy can sustainably generate compounding returns of {dailyRatePct}% per day.
        </p>
      </div>
    </div>
  );
}
