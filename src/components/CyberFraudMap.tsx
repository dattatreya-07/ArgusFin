'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CyberFraudDisplayModel } from '@/lib/cyber-stats';

interface CyberFraudMapProps {
  model?: CyberFraudDisplayModel | null;
  locale?: string;
}

export function CyberFraudMap({ model: initialModel, locale = 'en' }: CyberFraudMapProps) {
  const [model, setModel] = useState<CyberFraudDisplayModel | null>(initialModel || null);
  const [metricMode, setMetricMode] = useState<'rate' | 'raw'>('rate');
  const [selectedState, setSelectedState] = useState<string | null>(null);

  React.useEffect(() => {
    if (!initialModel) {
      fetch('/api/cyber-stats')
        .then((res) => res.json())
        .then((data) => setModel(data))
        .catch(() => {});
    }
  }, [initialModel]);

  const hasData = Boolean(model && model.hasVerifiedData && model.states.length > 0);
  const states = model?.states || [];
  const nationalTrend = model?.nationalTrend || [];
  const isDemo = model?.isDemo || false;

  if (!hasData) {
    return (
      <div className="p-8 bg-surface rounded-2xl border border-border text-center space-y-4 shadow-soft">
        <div className="inline-flex p-3 rounded-xl bg-surface-sunken border border-border text-2xl">
          🗺️
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-ink">
            India State-Wise Cyber Fraud Awareness
          </h3>
          <p className="text-xs text-ink-muted max-w-md mx-auto">
            Official NCRB & I4C portal statistics are currently pending human verification.
          </p>
        </div>
        <div className="pt-2">
          <span className="inline-block px-3 py-1 text-xs font-mono rounded bg-surface-sunken border border-border text-ink-muted">
            Status: data pending verification
          </span>
        </div>
      </div>
    );
  }

  // Find max for visual shading
  const maxRate = Math.max(...states.map((s) => s.ratePerLakh), 1);
  const maxRaw = Math.max(...states.map((s) => s.reportedCases), 1);

  const activeStateDetail = states.find((s) => s.code === selectedState) || states[0];

  return (
    <div className="bg-surface rounded-2xl border border-border p-6 sm:p-8 space-y-6 shadow-soft">
      {/* Header & Metric Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg sm:text-xl font-bold text-ink font-inktrap">
              India Cyber Fraud Awareness & Reporting Matrix
            </h3>
            {isDemo && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-sunken border border-border text-accent font-bold">
                ILLUSTRATIVE SAMPLE
              </span>
            )}
          </div>
          <p className="text-xs text-ink-muted mt-1">
            Grounded in official National Crime Records Bureau (NCRB) & I4C publications.
          </p>
        </div>

        {/* Metric Selector Toggle */}
        <div className="inline-flex rounded-lg border border-border bg-surface-sunken p-1 self-start sm:self-auto font-mono text-xs">
          <button
            type="button"
            onClick={() => setMetricMode('rate')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
              metricMode === 'rate'
                ? 'bg-surface text-accent shadow-xs border border-border'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            Rate / 1 Lakh Pop
          </button>
          <button
            type="button"
            onClick={() => setMetricMode('raw')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
              metricMode === 'raw'
                ? 'bg-surface text-accent shadow-xs border border-border'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            Raw Case Count
          </button>
        </div>
      </div>

      {/* Main Grid: State Tile Grid + Detail Spotlight */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: State Tiles (7 cols) */}
        <div className="lg:col-span-8 space-y-3">
          <div className="flex items-center justify-between text-xs text-ink-muted font-mono">
            <span>State / UT Awareness Density:</span>
            <span>Tap tile for details</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {states.map((st) => {
              const isSelected = selectedState === st.code;
              const ratio =
                metricMode === 'rate'
                  ? st.ratePerLakh / maxRate
                  : st.reportedCases / maxRaw;

              return (
                <button
                  key={st.code}
                  type="button"
                  onClick={() => setSelectedState(st.code)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-accent bg-accent-soft ring-2 ring-accent'
                      : 'border-border bg-surface-sunken hover:border-accent/60 hover:bg-surface'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="font-bold text-xs text-ink truncate">
                      {st.name}
                    </span>
                    <span className="text-[10px] font-mono text-ink-muted shrink-0">
                      {st.code}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between pt-1">
                    <span className="text-sm font-extrabold font-mono text-accent">
                      {metricMode === 'rate'
                        ? `${st.ratePerLakh.toFixed(1)}`
                        : `${st.reportedCases.toLocaleString('en-IN')}`}
                    </span>
                    <span className="text-[9px] text-ink-muted font-mono">
                      {metricMode === 'rate' ? '/ lakh' : 'cases'}
                    </span>
                  </div>

                  {/* Relative intensity mini-indicator */}
                  <div className="w-full bg-border/40 h-1.5 rounded-full overflow-hidden mt-2">
                    <div
                      className="bg-accent h-full rounded-full transition-all"
                      style={{ width: `${Math.max(10, Math.min(100, ratio * 100))}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Selected State Insight + Multi-year Trend (4 cols) */}
        <div className="lg:col-span-4 space-y-4 flex flex-col justify-between">
          {activeStateDetail && (
            <div className="p-5 rounded-xl bg-surface-sunken border border-border space-y-3">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <div>
                  <span className="text-xs font-mono font-bold text-accent uppercase">
                    State Profile
                  </span>
                  <h4 className="text-base font-bold text-ink">
                    {activeStateDetail.name}
                  </h4>
                </div>
                <span className="text-xl font-bold font-mono px-2 py-0.5 rounded bg-surface border border-border text-ink">
                  {activeStateDetail.code}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded bg-surface border border-border">
                  <span className="text-[10px] text-ink-muted block">Reported Cases (2022)</span>
                  <span className="text-sm font-bold text-ink">
                    {activeStateDetail.reportedCases.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="p-2.5 rounded bg-surface border border-border">
                  <span className="text-[10px] text-ink-muted block">Rate / Lakh Pop</span>
                  <span className="text-sm font-bold text-accent">
                    {activeStateDetail.ratePerLakh.toFixed(1)}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-ink-muted leading-relaxed">
                Higher reported rates reflect rigorous portal adoption, police reporting drives, and online awareness in this jurisdiction.
              </p>

              {activeStateDetail.sourceUrl && (
                <div className="pt-1 text-[10px] font-mono text-ink-muted flex items-center justify-between">
                  <span>Source: NCRB</span>
                  <a
                    href={activeStateDetail.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline"
                  >
                    Official Portal ↗
                  </a>
                </div>
              )}
            </div>
          )}

          {/* National Trend Line (Pure SVG) */}
          {nationalTrend.length > 0 && (
            <div className="p-4 rounded-xl bg-surface-sunken border border-border space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-ink-muted">
                <span className="font-bold text-ink">National Registered Cases Trend</span>
                <span>(NCRB Multi-Year)</span>
              </div>

              <svg
                viewBox="0 0 240 70"
                className="w-full h-16 overflow-visible select-none"
                aria-label="National Cyber Crime Cases Multi-Year Trend"
              >
                {/* Horizontal Baseline */}
                <line x1="10" y1="58" x2="230" y2="58" stroke="currentColor" className="text-border" strokeWidth="1" />

                {/* Trend Polyline */}
                <polyline
                  fill="none"
                  stroke="currentColor"
                  className="text-accent"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points="20,48 120,38 220,12"
                />

                {/* Data Points */}
                {nationalTrend.map((pt, i) => {
                  const x = 20 + i * 100;
                  const y = 48 - i * 18;
                  return (
                    <g key={pt.year}>
                      <circle cx={x} cy={y} r="4" fill="currentColor" className="text-accent" />
                      <text
                        x={x}
                        y={y - 8}
                        textAnchor="middle"
                        fill="currentColor"
                        className="text-ink"
                        fontSize="9"
                        fontWeight="700"
                        fontFamily="monospace"
                      >
                        {(pt.cases / 1000).toFixed(0)}k
                      </text>
                      <text
                        x={x}
                        y={68}
                        textAnchor="middle"
                        fill="currentColor"
                        className="text-ink-muted"
                        fontSize="8"
                        fontFamily="monospace"
                      >
                        {pt.year}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Caveat & Action Footer */}
      <div className="pt-4 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
        <div className="text-ink-muted leading-relaxed max-w-xl">
          <span className="font-semibold text-ink">Public Good Notice:</span> Raw reported cases, not adjusted for population, reflect reporting volume and public awareness, not only scam frequency.
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href={`/${locale}/check`}
            className="px-3.5 py-1.5 rounded-lg bg-accent text-accent-ink font-bold hover:opacity-90 transition-all font-mono"
          >
            Check Suspicious Message →
          </Link>
          <Link
            href={`/${locale}/authorities`}
            className="px-3.5 py-1.5 rounded-lg bg-surface-sunken border border-border text-ink hover:border-accent transition-all font-mono"
          >
            Official Helplines
          </Link>
        </div>
      </div>
    </div>
  );
}
