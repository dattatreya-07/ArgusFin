'use client';

import React from 'react';
import { RiskBand } from '@/lib/types';

interface RiskGaugeProps {
  band: RiskBand;
  confidence?: number;
  scorePercent?: number;
  size?: number;
}

export function RiskGauge({ band, confidence = 0.95, scorePercent, size = 64 }: RiskGaugeProps) {
  // Determine percentage based on risk band if not explicitly provided
  let percent = scorePercent;
  if (percent === undefined) {
    if (band === 'HIGH') percent = Math.round(Math.max(85, confidence * 100));
    else if (band === 'MEDIUM') percent = Math.round(Math.max(50, confidence * 75));
    else if (band === 'LOW_SIGNALS') percent = Math.round(Math.max(15, confidence * 30));
    else percent = 10;
  }

  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  let strokeColor = '#B42318'; // High risk red
  let textColor = '#B42318';

  if (band === 'MEDIUM') {
    strokeColor = '#B54708';
    textColor = '#B54708';
  } else if (band === 'LOW_SIGNALS') {
    strokeColor = '#475467';
    textColor = '#475467';
  } else if (band === 'CANNOT_VERIFY') {
    strokeColor = '#5B4B8A';
    textColor = '#5B4B8A';
  }

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-border/40 fill-none"
        />
        {/* Animated fill circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="fill-none transition-all duration-1000 ease-out"
        />
      </svg>
      {/* Center text score percentage */}
      <span className="absolute font-black text-xs sm:text-sm tracking-tighter" style={{ color: textColor }}>
        {percent}%
      </span>
    </div>
  );
}
