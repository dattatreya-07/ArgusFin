import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'quiet' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      loading = false,
      leftIcon,
      rightIcon,
      icon,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const isBusy = isLoading || loading;
    const resolvedLeftIcon = icon || leftIcon;

    const baseStyles =
      'inline-flex items-center justify-center font-bold tracking-tight rounded-md transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:opacity-45 disabled:cursor-not-allowed select-none min-h-[44px] cursor-pointer';

    const sizeStyles = {
      sm: 'px-3.5 py-1.5 text-xs min-w-[36px]',
      md: 'px-5 py-2.5 text-sm sm:text-base min-w-[44px]',
      lg: 'px-7 py-3.5 text-base sm:text-lg min-w-[52px]',
    };

    const variantStyles = {
      primary:
        'bg-accent text-accent-ink hover:opacity-90 shadow-soft font-extrabold active:scale-[0.98]',
      secondary:
        'bg-surface-sunken border border-border text-ink hover:border-accent hover:text-accent hover:bg-surface active:scale-[0.98]',
      quiet:
        'bg-transparent text-accent border border-transparent hover:border-border hover:bg-accent-soft active:scale-[0.98]',
      danger:
        'bg-risk-high-bg border border-risk-high-border text-risk-high-ink hover:bg-risk-high-border/20 active:scale-[0.98]',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isBusy}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {isBusy ? (
          <span className="inline-flex items-center gap-2">
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Processing...</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-2">
            {resolvedLeftIcon && <span className="shrink-0">{resolvedLeftIcon}</span>}
            <span>{children}</span>
            {rightIcon && <span className="shrink-0">{rightIcon}</span>}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
