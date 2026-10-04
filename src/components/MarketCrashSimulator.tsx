'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Button, BandBadge, Banner } from '@/components/ui';

interface MarketDataPoint {
  month: string;
  niftyValue: number;
  portfolioHoldValue: number; // ₹1,00,000 initial held through crash
  panicExitValue: number;     // Sold at month 4 peak crash & held in cash
  phase: string;
}

const SIMULATED_COVID_CRASH_SERIES: MarketDataPoint[] = [
  { month: 'Jan 2020', niftyValue: 12168, portfolioHoldValue: 100000, panicExitValue: 100000, phase: 'Pre-Crash Peak' },
  { month: 'Feb 2020', niftyValue: 11201, portfolioHoldValue: 92053, panicExitValue: 92053, phase: 'Early Drop' },
  { month: 'Mar 2020', niftyValue: 8597, portfolioHoldValue: 70652, panicExitValue: 70652, phase: 'Peak Panic (-38%)' },
  { month: 'Apr 2020', niftyValue: 9859, portfolioHoldValue: 81024, panicExitValue: 70652, phase: 'Initial Recovery' },
  { month: 'Jun 2020', niftyValue: 10302, portfolioHoldValue: 84665, panicExitValue: 70652, phase: 'Steady Bounce' },
  { month: 'Sep 2020', niftyValue: 11247, portfolioHoldValue: 92431, panicExitValue: 70652, phase: 'Pre-Level Reached' },
  { month: 'Nov 2020', niftyValue: 12968, portfolioHoldValue: 106575, panicExitValue: 70652, phase: 'New All-Time High' },
  { month: 'Mar 2021', niftyValue: 14690, portfolioHoldValue: 120726, panicExitValue: 70652, phase: 'Post-Crash Growth' },
];

export function MarketCrashSimulator() {
  const [selectedStrategy, setSelectedStrategy] = useState<'HOLD' | 'PANIC_SELL' | null>(null);

  return (
    <Card className="border-accent/40 bg-surface overflow-hidden shadow-medium">
      <CardHeader className="bg-surface-sunken border-b border-border">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">📉</span>
            <div>
              <CardTitle className="text-lg font-bold text-ink">
                M12 Zero-Money Market Crash &amp; Drawdown Simulator
              </CardTitle>
              <CardDescription className="text-xs text-ink-muted">
                Educational simulation based on historical Nifty 50 COVID-19 crash &amp; recovery cycle (Zero Real Money At Risk)
              </CardDescription>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-1 rounded bg-accent-soft text-accent border border-border font-mono">
            Educational Model
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-5 sm:p-6 space-y-6">
        {/* Scenario Intro */}
        <div className="p-4 bg-surface-sunken rounded-xl border border-border space-y-2">
          <h3 className="text-xs font-bold text-ink uppercase tracking-wider font-mono">
            Simulation Setup: Imagine You Invested ₹1,00,000 in Nifty 50 Index Fund in Jan 2020
          </h3>
          <p className="text-xs text-ink-muted leading-relaxed">
            In March 2020, global pandemic panic caused the Nifty 50 index to drop 38% in 30 days. Your ₹1,00,000 portfolio dropped to ₹70,652 on screen. Compare what happens if you <strong>Panic Sold to Cash</strong> vs <strong>Held Through Recovery</strong>.
          </p>
        </div>

        {/* Strategy Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setSelectedStrategy('HOLD')}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer space-y-1.5 ${
              selectedStrategy === 'HOLD'
                ? 'bg-accent-soft border-accent text-ink shadow-sm ring-1 ring-accent font-bold'
                : 'bg-surface-sunken border-border text-ink-muted hover:border-accent hover:text-ink'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-accent font-mono">Strategy A</span>
              {selectedStrategy === 'HOLD' && <span className="text-xs font-bold text-accent font-mono">✓ Active</span>}
            </div>
            <h4 className="text-sm font-bold text-ink">Hold &amp; Stay Invested</h4>
            <p className="text-xs text-ink-muted">
              Do not panic sell. Maintain index holdings through temporary market drawdown.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setSelectedStrategy('PANIC_SELL')}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer space-y-1.5 ${
              selectedStrategy === 'PANIC_SELL'
                ? 'bg-risk-high-bg border-risk-high-border/50 text-risk-high-text shadow-sm ring-1 ring-risk-high-border'
                : 'bg-surface-sunken border-border text-ink-muted hover:border-accent hover:text-ink'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-risk-high-text font-mono">Strategy B</span>
              {selectedStrategy === 'PANIC_SELL' && <span className="text-xs font-bold text-risk-high-text font-mono">✓ Active</span>}
            </div>
            <h4 className="text-sm font-bold text-ink">Panic Sell to Cash at Peak Drawdown</h4>
            <p className="text-xs text-ink-muted">
              Exit all holdings in March 2020 at ₹70,652 out of fear and keep money in zero-yield cash.
            </p>
          </button>
        </div>

        {/* Simulated Performance Chart Table */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-ink-muted uppercase tracking-wider font-mono block">
            Historical Data Transcript &amp; Trajectory
          </span>
          <div className="overflow-x-auto border border-border rounded-xl">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-surface-sunken border-b border-border text-ink-muted">
                <tr>
                  <th className="p-3">Timeline</th>
                  <th className="p-3">Nifty Index</th>
                  <th className="p-3">Strategy A (Hold)</th>
                  <th className="p-3">Strategy B (Panic Sold)</th>
                  <th className="p-3">Market Phase</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {SIMULATED_COVID_CRASH_SERIES.map((pt, idx) => (
                  <tr
                    key={idx}
                    className={`transition-colors ${
                      selectedStrategy === 'HOLD'
                        ? 'hover:bg-accent-soft/40'
                        : selectedStrategy === 'PANIC_SELL'
                        ? 'hover:bg-risk-high-bg/40'
                        : ''
                    }`}
                  >
                    <td className="p-3 font-bold text-ink">{pt.month}</td>
                    <td className="p-3 text-ink-muted">{pt.niftyValue.toLocaleString('en-IN')}</td>
                    <td className={`p-3 font-bold ${pt.portfolioHoldValue >= 100000 ? 'text-accent' : 'text-ink-muted'}`}>
                      ₹{pt.portfolioHoldValue.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3 text-ink-muted">
                      ₹{pt.panicExitValue.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3 text-ink-muted text-[11px] font-sans">{pt.phase}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mathematical Consequence Summary */}
        {selectedStrategy && (
          <div
            className={`p-4 rounded-xl border text-xs space-y-2 ${
              selectedStrategy === 'HOLD'
                ? 'bg-accent-soft border-accent/40 text-ink'
                : 'bg-risk-high-bg border-risk-high-border/40 text-risk-high-text'
            }`}
          >
            <h4 className="font-bold text-sm font-mono uppercase tracking-wider">
              {selectedStrategy === 'HOLD'
                ? '✅ Strategy A Result: Full Recovery (+₹20,726 Gain)'
                : '⚠️ Strategy B Result: Locked-in Permanent Loss (-₹29,348 Loss)'}
            </h4>
            <p className="leading-relaxed">
              {selectedStrategy === 'HOLD'
                ? 'By holding through the 38% temporary drawdown, your ₹1,00,000 recovered within 7 months and grew to ₹1,20,726 by March 2021 (+20.7% return).'
                : 'By selling out of panic at the March 2020 bottom (₹70,652), you locked in a permanent ₹29,348 loss. While the market recovered to new highs, your cash balance remained frozen at ₹70,652.'}
            </p>
            <p className="text-[11px] opacity-80 italic pt-1">
              Educational mathematical example based on historical NSE data. Not a prediction or forecast of future stock prices.
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="bg-surface-sunken border-t border-border flex justify-between items-center p-4">
        <span className="text-xs text-ink-muted font-mono">
          Accessible Text Transcript Included
        </span>
        <Button variant="secondary" size="md" onClick={() => setSelectedStrategy(null)}>
          Reset Simulator
        </Button>
      </CardFooter>
    </Card>
  );
}
