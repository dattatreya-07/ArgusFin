import React from 'react';
import { LadderDisplayModel, computeLadderPosition } from '@/lib/ladder';

interface LadderChartProps {
  ladderModel?: LadderDisplayModel | null;
  promiseAnnualisedPct?: number | null;
  promiseMultiple?: number | null;
}

export function LadderChart({
  ladderModel,
  promiseAnnualisedPct,
  promiseMultiple,
}: LadderChartProps) {
  const activeRungs = ladderModel?.activeRungs || [];
  const hiddenRungs = ladderModel?.hiddenRungs || [];

  const positionResult =
    promiseAnnualisedPct !== null && promiseAnnualisedPct !== undefined
      ? computeLadderPosition(promiseAnnualisedPct, 20)
      : null;

  return (
    <div className="p-6 bg-surface rounded-xl border border-border shadow-soft space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-ink font-inktrap">
              The Reality Ladder
            </h3>
            <span className="tag-bracket text-[10px]">
              SOVEREIGN & MARKET SPREAD
            </span>
          </div>
          <p className="text-xs text-ink-muted mt-0.5">
            Calibrated against official sovereign interest rates and regulatory ceilings.
          </p>
        </div>
        <span className="text-[11px] font-mono text-ink-muted px-2 py-0.5 rounded bg-surface-sunken border border-border">
          Source: Official Portals
        </span>
      </div>

      {/* Promise Marker if provided */}
      {promiseAnnualisedPct !== null && promiseAnnualisedPct !== undefined && positionResult && (
        <div className="p-4 bg-risk-high-bg border border-risk-high-border rounded-lg space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-mono font-bold text-risk-high-ink uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
              Claimed Promise (Annualised)
            </span>
            <span className="font-mono font-extrabold text-risk-high-ink text-sm sm:text-base">
              {promiseAnnualisedPct > 1e6
                ? `${promiseAnnualisedPct.toExponential(2)}%`
                : `${promiseAnnualisedPct.toLocaleString('en-IN', { maximumFractionDigits: 1 })}%`}
              {promiseMultiple ? ` (${promiseMultiple >= 100 ? promiseMultiple.toLocaleString('en-IN', { maximumFractionDigits: 0 }) : promiseMultiple.toFixed(1)}×)` : ''}
            </span>
          </div>

          {/* Visualization bar with break indicator if off-scale */}
          <div className="relative w-full bg-surface-sunken h-4 rounded-full overflow-hidden border border-risk-high-border">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                positionResult.isOffScale
                  ? 'w-full bg-gradient-to-r from-amber-500 via-rose-500 to-rose-700 animate-pulse'
                  : 'bg-rose-600'
              }`}
              style={{
                width: positionResult.isOffScale ? '100%' : `${positionResult.relativePosPct}%`,
              }}
            />
          </div>

          {positionResult.isOffScale && positionResult.breakIndicatorLabel && (
            <div className="flex items-center justify-between text-[11px] font-mono font-bold text-risk-high-ink pt-0.5">
              <span className="flex items-center gap-1">
                <span>⚡ OFF-SCALE EXCEEDANCE:</span>
                <span>{positionResult.breakIndicatorLabel}</span>
              </span>
              <span className="px-1.5 py-0.5 rounded bg-risk-high-border/30 border border-risk-high-border text-[10px]">
                High Advance-Fee / Ponzi Risk
              </span>
            </div>
          )}

          <p className="text-[11px] text-risk-high-ink/90 leading-normal">
            Mathematically impossible in legitimate regulated capital markets without unbacked speculation or fraud risk.
          </p>
        </div>
      )}

      {/* Active Rungs */}
      <div className="space-y-4">
        {activeRungs.map((rung) => (
          <div key={rung.id} className="space-y-1.5 text-xs bg-surface-sunken p-3.5 rounded-lg border border-border">
            <div className="flex items-center justify-between font-medium text-ink">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-ink">{rung.name}</span>
                {rung.illustrative && (
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-surface border border-border text-ink-muted">
                    SAMPLE
                  </span>
                )}
              </div>
              <span className="font-mono font-bold text-accent">
                {rung.value_low}% – {rung.value_high}%
              </span>
            </div>
            <div className="w-full bg-surface h-2.5 rounded-full overflow-hidden border border-border">
              <div
                className="bg-gradient-to-r from-accent to-highlight h-full rounded-full"
                style={{
                  width: `${Math.min(100, Math.max(8, (rung.value_high / 20) * 100))}%`,
                }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-ink-muted font-mono">
              <span>Verified as of {rung.as_of}</span>
              {rung.source_url && (
                <a
                  href={rung.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  Official Source ↗
                </a>
              )}
            </div>
          </div>
        ))}

        {/* Hidden Rungs with "data being verified" status */}
        {hiddenRungs.length > 0 && (
          <div className="pt-3 border-t border-border space-y-2">
            <p className="text-xs font-mono font-semibold text-ink-muted uppercase tracking-wider">
              Benchmark Pipeline (Pending Human Verification):
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {hiddenRungs.map((hr) => (
                <div
                  key={hr.id}
                  className="flex items-center justify-between px-3 py-2 bg-surface-sunken border border-border rounded text-xs text-ink-muted"
                >
                  <span className="truncate pr-2">{hr.name}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface border border-border text-ink-muted flex-shrink-0">
                    pending verification
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="text-[11px] text-ink-muted bg-surface-sunken p-3 rounded-lg border border-border flex items-start gap-2">
        <span className="text-accent">ℹ️</span>
        <span>
          Past benchmark returns do not predict future returns. Real rates shown strictly with verified source citations. This is not investment advice or recommendation.
        </span>
      </div>
    </div>
  );
}
