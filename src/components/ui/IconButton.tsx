import React from 'react';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  'aria-label'?: string;
  ariaLabel?: string;
  isActive?: boolean;
  active?: boolean;
  size?: 'md' | 'lg';
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      icon,
      'aria-label': ariaLabelProp,
      ariaLabel,
      isActive = false,
      active = false,
      size = 'md',
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const isStateActive = isActive || active;
    const resolvedAriaLabel = ariaLabelProp || ariaLabel || 'Icon Button';
    const sizeClasses = size === 'lg' ? 'w-14 h-14 min-w-[56px] min-h-[56px]' : 'w-12 h-12 min-w-[48px] min-h-[48px]';

    return (
      <button
        ref={ref}
        type="button"
        aria-label={resolvedAriaLabel}
        disabled={disabled}
        className={`inline-flex items-center justify-center rounded-pill border transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed ${sizeClasses} ${
          isStateActive
            ? 'bg-accent-soft border-accent text-accent font-bold ring-2 ring-accent'
            : 'bg-surface border-border text-ink hover:bg-surface-sunken hover:border-ink-muted shadow-soft'
        } ${className}`}
        {...props}
      >
        <span className="shrink-0">{icon}</span>
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';
