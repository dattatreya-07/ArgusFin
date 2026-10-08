'use client';

import React, { useState } from 'react';
import { Link } from '@/i18n/routing';
import { simulatorService, EducationalSipOutput } from '@/lib/financeX/academy/simulators';
import { Card, CardHeader, CardContent, Button, Chip } from '@/components/ui';

export default function SipSimulatorPage() {
  const [monthlyContribution, setMonthlyContribution] = useState<number>(5000);
  const [annualRatePct, setAnnualRatePct] = useState<number>(12);
  const [durationYears, setDurationYears] = useState<number>(10);

  const result: EducationalSipOutput = simulatorService.calculateSIP({
    monthlyContribution,
    annualRatePct,
    durationYears,
  });

  return (
    <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-accent">EDUCATIONAL SIMULATOR</span>
            <Chip>SIP Compounding</Chip>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-inktrap text-ink mt-1">
            Systematic Investment Plan (SIP) Simulator
          </h1>
        </div>
        <Link href="/learn">
          <Button variant="secondary" size="sm">
            Back to Academy
          </Button>
        </Link>
      </div>

      {/* Simulator Inputs & Result Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left: Interactive Controls */}
        <Card className="md:col-span-5 border-border">
          <CardHeader>
            <h2 className="text-base font-bold text-ink">Simulator Assumptions</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-ink-muted">Monthly Contribution (₹)</label>
              <input
                type="number"
                value={monthlyContribution}
                onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                min={500}
                max={1000000}
                className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-ink text-sm font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-ink-muted">Illustrative Annual Rate (%)</label>
              <input
                type="number"
                value={annualRatePct}
                onChange={(e) => setAnnualRatePct(Number(e.target.value))}
                min={1}
                max={30}
                step={0.5}
                className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-ink text-sm font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-ink-muted">Duration (Years)</label>
              <input
                type="number"
                value={durationYears}
                onChange={(e) => setDurationYears(Number(e.target.value))}
                min={1}
                max={40}
                className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-ink text-sm font-mono"
              />
            </div>
          </CardContent>
        </Card>

        {/* Right: Results Display */}
        <Card className="md:col-span-7 border-accent/40 bg-surface-sunken">
          <CardHeader>
            <span className="text-xs font-mono font-bold text-accent uppercase">Projected Output</span>
            <h2 className="text-xl font-bold font-inktrap text-ink">Compounding Growth Summary</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-surface rounded-xl border border-border text-center">
                <span className="text-xs text-ink-muted block">Total Principal Invested</span>
                <span className="text-lg font-bold font-mono text-ink">
                  ₹{result.totalInvested.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="p-3 bg-surface rounded-xl border border-border text-center">
                <span className="text-xs text-ink-muted block">Est. Growth Component</span>
                <span className="text-lg font-bold font-mono text-emerald-400">
                  +₹{Math.round(result.totalGrowth).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="p-4 bg-accent-soft/40 rounded-xl border border-accent/30 text-center space-y-1">
              <span className="text-xs font-bold text-accent uppercase font-mono">Estimated Ending Maturity Value</span>
              <span className="text-3xl font-black font-mono text-ink block">
                ₹{Math.round(result.finalEstimatedValue).toLocaleString('en-IN')}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-surface border border-border text-[11px] text-ink-muted leading-relaxed font-mono">
              ⚠️ {result.disclaimer}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
