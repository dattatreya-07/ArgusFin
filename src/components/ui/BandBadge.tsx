import React from 'react';
import { RiskBand } from '@/lib/types';
import {
  IconAlertTriangle,
  IconAlertCircle,
  IconInfo,
  IconQuestion,
} from '@/components/icons';

export interface BandBadgeProps {
  band: RiskBand;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const BAND_CONFIG: Record<
  RiskBand,
  {
    bg: string;
    border: string;
    text: string;
    icon: React.ReactNode;
    defaultLabel: string;
  }
> = {
  HIGH: {
    bg: 'bg-[#220B0E]',
    border: 'border-[#EF4444]',
    text: 'text-[#FCA5A5]',
    icon: <IconAlertTriangle size={20} className="shrink-0 text-[#EF4444]" />,
    defaultLabel: 'High Risk Signals',
  },
  MEDIUM: {
    bg: 'bg-[#241407]',
    border: 'border-[#F59E0B]',
    text: 'text-[#FCD34D]',
    icon: <IconAlertCircle size={20} className="shrink-0 text-[#F59E0B]" />,
    defaultLabel: 'Medium Risk Signals',
  },
  LOW_SIGNALS: {
    bg: 'bg-[#091F16]',
    border: 'border-[#10B981]',
    text: 'text-[#6EE7B7]',
    icon: <IconInfo size={20} className="shrink-0 text-[#10B981]" />,
    defaultLabel: 'Low Risk Signals (Not a Guarantee)',
  },
  CANNOT_VERIFY: {
    bg: 'bg-[#181329]',
    border: 'border-[#8B5CF6]',
    text: 'text-[#DDD6FE]',
    icon: <IconQuestion size={20} className="shrink-0 text-[#8B5CF6]" />,
    defaultLabel: 'Cannot Verify From Data',
  },
};

export function BandBadge({
  band,
  label,
  size = 'md',
  className = '',
}: BandBadgeProps) {
  const config = BAND_CONFIG[band] || BAND_CONFIG.CANNOT_VERIFY;
  const sizeStyles = {
    sm: 'px-3 py-1 text-xs',
    md: 'px-4 py-2 text-sm font-bold',
    lg: 'px-5 py-2.5 text-base font-extrabold',
  };

  return (
    <div
      role="status"
      className={`inline-flex items-center gap-2 rounded-md border ${config.bg} ${config.border} ${config.text} ${sizeStyles[size]} ${className}`}
    >
      {config.icon}
      <span>{label || config.defaultLabel}</span>
    </div>
  );
}
