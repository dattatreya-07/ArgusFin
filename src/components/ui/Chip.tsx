import React from 'react';

export interface ChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'neutral' | 'accent' | 'sunken';
  icon?: React.ReactNode;
}

export function Chip({
  children,
  variant = 'neutral',
  icon,
  className = '',
  ...props
}: ChipProps) {
  const variantStyles = {
    neutral: 'bg-surface border-border text-ink-muted',
    accent: 'bg-accent-soft border-accent/20 text-accent font-semibold',
    sunken: 'bg-surface-sunken border-border text-ink',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-pill text-sm sm:text-base border shadow-2xs select-none ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}
