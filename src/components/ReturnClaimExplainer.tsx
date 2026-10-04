import React from 'react';
import { Link } from '@/i18n/routing';

export interface ReturnClaimProps {
  invested: number;
  payout: number;
  days: number;
  claimText?: string;
}

export function ReturnClaimExplainer({ invested, payout, days, claimText }: ReturnClaimProps) {
  if (invested <= 0 || payout <= 0 || days <= 0) {
    return null;
  }

  const profit = payout - invested;
  const absoluteReturnPercent = (profit / invested) * 100;
  const multiple = payout / invested;
  const dailyRate = Math.pow(multiple, 1 / days) - 1;
  const dailyPercent = dailyRate * 100;
  const annualisedPercent = (Math.pow(1 + dailyRate, 365) - 1) * 100;

  return (
    <div className="p-6 rounded-2xl border-2 border-accent bg-accent-soft/30 space-y-6 text-ink">
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🧮</span>
          <h3 className="text-base font-bold font-inktrap">Return Mathematics Reality Check</h3>
        </div>
        <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-surface border border-border text-ink-muted">
          Deterministic Mathematical Interpretation
        </span>
      </div>

      {claimText && (
        <div className="p-3 rounded-lg bg-surface border border-border text-xs font-mono text-ink-muted">
          <span className="font-bold text-ink">Stated Claim:</span> &ldquo;{claimText}&rdquo;
        </div>
      )}

      {/* Grid of Key Calculations */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        <div className="p-3 rounded-xl bg-surface border border-border">
          <div className="text-[11px] text-ink-muted font-mono uppercase">Absolute Gain</div>
          <div className="text-lg font-bold text-ink font-mono">+{absoluteReturnPercent.toFixed(1)}%</div>
          <div className="text-[10px] text-ink-muted font-mono">₹{profit.toLocaleString('en-IN')} profit</div>
        </div>

        <div className="p-3 rounded-xl bg-surface border border-border">
          <div className="text-[11px] text-ink-muted font-mono uppercase">Duration</div>
          <div className="text-lg font-bold text-ink font-mono">{days} Days</div>
          <div className="text-[10px] text-ink-muted font-mono">{multiple.toFixed(2)}x Multiple</div>
        </div>

        <div className="p-3 rounded-xl bg-surface border border-border">
          <div className="text-[11px] text-ink-muted font-mono uppercase">Implied Daily Rate</div>
          <div className="text-lg font-bold text-ink font-mono">+{dailyPercent.toFixed(2)}%/day</div>
          <div className="text-[10px] text-ink-muted font-mono">Compounded daily</div>
        </div>

        <div className="p-3 rounded-xl bg-surface border border-border">
          <div className="text-[11px] text-ink-muted font-mono uppercase">Annualised CAGR Equivalent</div>
          <div className="text-lg font-bold text-accent font-mono">
            {annualisedPercent > 10000 ? '>10,000%' : `+${annualisedPercent.toFixed(1)}%`}
          </div>
          <div className="text-[10px] text-accent font-mono font-bold">Extreme Rate</div>
        </div>
      </div>

      {/* Plain Language Interpretation */}
      <div className="space-y-3 text-xs leading-relaxed">
        <div className="p-4 rounded-xl bg-surface border border-border space-y-2">
          <h4 className="font-bold text-ink font-mono flex items-center gap-1.5">
            <span>💡</span> Mathematical vs Economic Reality
          </h4>
          <p className="text-ink-muted">
            The stated payout implies earning <span className="font-bold text-ink">+{dailyPercent.toFixed(2)}% per day</span> compounding continuously over {days} days. If sustained for a full year, this compounding rate equates to an annual return of over <span className="font-bold text-accent">{annualisedPercent > 10000 ? '10,000%' : `${annualisedPercent.toFixed(0)}%`}</span>.
          </p>
          <p className="text-ink-muted">
            For comparison, regulated benchmark investments in India generate:
          </p>
          <ul className="list-disc list-inside text-ink-muted font-mono space-y-1 pt-1">
            <li>Bank Fixed Deposits (RBI DICGC Insured): <span className="font-bold text-ink">~6.5% – 7.5% per YEAR</span></li>
            <li>Nifty 50 Benchmark Index (Regulated Equity): <span className="font-bold text-ink">~11% – 13% long-term CAGR</span></li>
          </ul>
        </div>

        {/* Behavioral Separation Notice */}
        <div className="p-3 rounded-xl bg-surface-sunken border border-border text-[11px] text-ink-muted flex items-start gap-2">
          <span className="text-sm">ℹ️</span>
          <div>
            <span className="font-bold text-ink">Product Safety Boundary:</span> This arithmetic calculation evaluates mathematical rates of return. It does NOT predict markets or state whether an entity is licensed. The behavioral detector independently evaluates requested transfers, pressure tactics, and credential requests.
          </div>
        </div>
      </div>

      {/* CTA to Calculator */}
      <div className="pt-2 flex justify-end">
        <Link
          href={`/calculator?mode=PROMISE_CHECK&invested=${invested}&payout=${payout}&days=${days}`}
          className="text-xs font-bold font-mono px-4 py-2 rounded-xl bg-accent text-white hover:bg-accent/90 transition-colors inline-flex items-center gap-1.5 shadow-sm"
        >
          <span>Open Full Interactive Reality Check</span>
          <span>→</span>
        </Link>
      </div>
    </div>
  );
}
