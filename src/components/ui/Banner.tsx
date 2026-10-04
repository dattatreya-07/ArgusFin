import React from 'react';
import { IconInfo, IconAlertTriangle } from '@/components/icons';

export interface BannerProps {
  variant?: 'info' | 'warning' | 'limited';
  title?: string;
  description?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export function Banner({
  variant = 'info',
  title,
  description,
  children,
  className = '',
}: BannerProps) {
  const config = {
    info: {
      bg: 'bg-risk-low-bg',
      border: 'border-risk-low-border/40',
      text: 'text-risk-low-text',
      icon: <IconInfo size={22} className="shrink-0 text-risk-low-border" />,
    },
    warning: {
      bg: 'bg-risk-med-bg',
      border: 'border-risk-med-border/40',
      text: 'text-risk-med-text',
      icon: <IconAlertTriangle size={22} className="shrink-0 text-risk-med-border" />,
    },
    limited: {
      bg: 'bg-surface-sunken',
      border: 'border-border',
      text: 'text-ink',
      icon: <IconInfo size={22} className="shrink-0 text-accent" />,
    },
  }[variant];

  const bodyContent = children || description;

  return (
    <div
      role="region"
      aria-label={title || 'Announcement'}
      className={`p-4 sm:p-5 rounded-md border ${config.bg} ${config.border} ${config.text} ${className}`}
    >
      <div className="flex items-start gap-3">
        {config.icon}
        <div className="space-y-1 text-sm sm:text-base leading-relaxed">
          {title && <p className="font-bold text-base">{title}</p>}
          {bodyContent && <div>{bodyContent}</div>}
        </div>
      </div>
    </div>
  );
}
