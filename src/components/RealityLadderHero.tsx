'use client';

import React from 'react';
import { computeAnnualised } from '@/lib/calc';

export interface RealityLadderHeroProps {
  invested?: number;
  payout?: number;
  durationDays?: number;
  className?: string;
}

export const RealityLadderHero: React.FC<RealityLadderHeroProps> = ({
  invested = 10000,
  payout = 20000,
  durationDays = 30,
  className = '',
}) => {
  const calcResult = computeAnnualised({ invested, payout, durationDays });
  const multipleStr =
    calcResult.success && calcResult.annualisedMultiple !== Infinity
      ? Math.round(calcResult.annualisedMultiple).toLocaleString('en-IN')
      : '4,600';

  return (
    <div className={`w-full max-w-[560px] rounded-xl bg-surface/90 border border-border p-5 sm:p-6 shadow-soft backdrop-blur-md relative overflow-hidden ${className}`}>
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between mb-4 relative z-10">
        <span className="tag-bracket text-[11px]">
          THE REALITY LADDER
        </span>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-surface-sunken border border-border text-ink-muted">
          SEBI / RBI Benchmarks
        </span>
      </div>

      {/* Inline SVG Chart */}
      <svg
        viewBox="0 0 460 260"
        role="img"
        aria-labelledby="ladder-title ladder-desc"
        className="w-full h-auto overflow-visible select-none relative z-10"
      >
        <title id="ladder-title">The Reality Ladder of Investment Returns</title>
        <desc id="ladder-desc">
          A comparison showing standard investment returns like Savings, Fixed Deposits, Bonds, and Index Funds, contrasted against an unrealistic high-return promise that exceeds realistic market limits by thousands of times.
        </desc>

        <style>{`
          @media (prefers-reduced-motion: no-preference) {
            .ladder-bar {
              transform-origin: left;
              animation: growBar 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            }
            @keyframes growBar {
              from { transform: scaleX(0); }
              to { transform: scaleX(1); }
            }
          }
        `}</style>

        {/* Background Grid Lines */}
        <g stroke="currentColor" className="text-border" strokeDasharray="3,3" strokeWidth="1" opacity="0.8">
          <line x1="120" y1="10" x2="120" y2="215" />
          <line x1="200" y1="10" x2="200" y2="215" />
          <line x1="300" y1="10" x2="300" y2="215" />
          <line x1="400" y1="10" x2="400" y2="215" />
        </g>

        {/* 1. Savings */}
        <g>
          <text x="110" y="32" textAnchor="end" fill="currentColor" className="text-ink" fontSize="12" fontWeight="700" fontFamily="sans-serif">
            Savings (3%)
          </text>
          <rect
            x="120"
            y="18"
            width="32"
            height="20"
            rx="4"
            fill="currentColor"
            className="text-surface-sunken stroke-border"
            strokeWidth="1.5"
          />
          <text x="160" y="32" fill="currentColor" className="text-ink-muted" fontSize="11" fontWeight="500">
            Everyday liquidity
          </text>
        </g>

        {/* 2. Fixed Deposit */}
        <g>
          <text x="110" y="72" textAnchor="end" fill="currentColor" className="text-ink" fontSize="12" fontWeight="700" fontFamily="sans-serif">
            Fixed Dep (7%)
          </text>
          <rect
            x="120"
            y="58"
            width="56"
            height="20"
            rx="4"
            fill="#FFF3E0"
            stroke="#B84E00"
            strokeWidth="1.5"
            className="ladder-bar"
            style={{ animationDelay: '50ms' }}
          />
          <text x="184" y="72" fill="#B84E00" fontSize="11" fontWeight="600">
            1–3 year safe term
          </text>
        </g>

        {/* 3. Small Savings / Bonds */}
        <g>
          <text x="110" y="112" textAnchor="end" fill="currentColor" className="text-ink" fontSize="12" fontWeight="700" fontFamily="sans-serif">
            PPF / Bonds (8%)
          </text>
          <rect
            x="120"
            y="98"
            width="68"
            height="20"
            rx="4"
            fill="#ECFDF3"
            stroke="#027A48"
            strokeWidth="1.5"
            className="ladder-bar"
            style={{ animationDelay: '100ms' }}
          />
          <text x="196" y="112" fill="#027A48" fontSize="11" fontWeight="600">
            Govt-guaranteed ceiling
          </text>
        </g>

        {/* 4. Broad Equity Index */}
        <g>
          <text x="110" y="152" textAnchor="end" fill="currentColor" className="text-ink" fontSize="12" fontWeight="700" fontFamily="sans-serif">
            Nifty 50 (~12%)
          </text>
          <rect
            x="120"
            y="138"
            width="105"
            height="20"
            rx="4"
            fill="#EFF8FF"
            stroke="#175CD3"
            strokeWidth="1.5"
            className="ladder-bar"
            style={{ animationDelay: '150ms' }}
          />
          <text x="233" y="152" fill="#175CD3" fontSize="11" fontWeight="600">
            Long-term rolling CAGR
          </text>
        </g>

        {/* Divider line before the claim */}
        <line x1="20" y1="175" x2="440" y2="175" stroke="currentColor" className="text-border" strokeWidth="1.5" />

        {/* 5. The Promise Bar (Breaks off the edge) */}
        <g>
          <text x="110" y="206" textAnchor="end" fill="#B42318" fontSize="12" fontWeight="800" fontFamily="sans-serif">
            The Promise
          </text>
          {/* Main broken bar */}
          <rect
            x="120"
            y="190"
            width="250"
            height="24"
            rx="4"
            fill="#FEF3F2"
            stroke="#B42318"
            strokeWidth="1.5"
            className="ladder-bar"
            style={{ animationDelay: '200ms' }}
          />
          {/* Zig-zag break mark */}
          <g transform="translate(365, 187)">
            <rect x="0" y="0" width="12" height="30" fill="currentColor" className="text-surface" />
            <path
              d="M 2 0 L 8 15 L 2 30"
              fill="none"
              stroke="#B42318"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M 6 0 L 12 15 L 6 30"
              fill="none"
              stroke="#B42318"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </g>
          {/* Label indicating impossible multiple */}
          <text x="382" y="206" fill="#B42318" fontSize="12" fontWeight="800" fontFamily="monospace">
            ~{multipleStr}×/yr!
          </text>
        </g>

        {/* Footer annotation in chart */}
        <text x="120" y="238" fill="#B42318" fontSize="11" fontWeight="600">
          Double in 30 days = Impossible in legitimate regulated markets
        </text>
      </svg>

      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-ink-muted">
        <span className="font-mono">Numbers grounded in official data</span>
        <span className="font-semibold text-accent">Zero investment advice</span>
      </div>
    </div>
  );
};
