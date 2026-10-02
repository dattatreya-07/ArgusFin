import React from 'react';
import { LadderDisplayModel } from '@/lib/ladder';

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

  return (
    <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-3 gap-1">
        <div>
          <h3 className="text-base font-bold text-slate-900">Reality Ladder (Official Rates)</h3>
          <p className="text-xs text-slate-500">
            Real market and sovereign interest rate benchmarks.
          </p>
        </div>
        <span className="text-[11px] font-medium text-slate-400">
          Source: Official Portals
        </span>
      </div>

      {/* Promise Marker if provided */}
      {promiseAnnualisedPct !== null && promiseAnnualisedPct !== undefined && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-rose-800 uppercase tracking-wide">
              ⚡ The Promise (Annualised)
            </span>
            <span className="font-extrabold text-rose-700">
              {promiseAnnualisedPct > 1e6
                ? `${promiseAnnualisedPct.toExponential(2)}%`
                : `${promiseAnnualisedPct.toLocaleString('en-IN', { maximumFractionDigits: 1 })}%`}
              {promiseMultiple ? ` (${promiseMultiple >= 100 ? promiseMultiple.toLocaleString('en-IN', { maximumFractionDigits: 0 }) : promiseMultiple.toFixed(1)}x)` : ''}
            </span>
          </div>
          <div className="w-full bg-rose-200 h-2.5 rounded-full overflow-hidden">
            <div className="bg-rose-600 h-2.5 rounded-full w-full animate-pulse" />
          </div>
        </div>
      )}

      {/* Active Rungs (if any data verified) */}
      <div className="space-y-4">
        {activeRungs.map((rung) => (
          <div key={rung.id} className="space-y-1 text-xs">
            <div className="flex items-center justify-between font-medium text-slate-700">
              <span>{rung.name}</span>
              <span className="font-semibold text-slate-900">
                {rung.value_low}% – {rung.value_high}%
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{
                  width: `${Math.min(100, Math.max(5, rung.value_high * 4))}%`,
                }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span>As of {rung.as_of}</span>
              {rung.source_url && (
                <a
                  href={rung.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-slate-600"
                >
                  Source Link
                </a>
              )}
            </div>
          </div>
        ))}

        {/* Hidden Rungs with "data being verified" status */}
        {hiddenRungs.length > 0 && (
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <p className="text-xs font-semibold text-slate-500">Benchmark Rungs Status:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {hiddenRungs.map((hr) => (
                <div
                  key={hr.id}
                  className="flex items-center justify-between px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs text-slate-600"
                >
                  <span className="truncate pr-2">{hr.name}</span>
                  <span className="text-[10px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex-shrink-0">
                    data being verified
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-md border border-slate-200 flex items-start gap-1.5">
        <span className="text-slate-400">ℹ️</span>
        <span>Past returns do not predict future returns. Real rates shown only with cited sources.</span>
      </div>
    </div>
  );
}
