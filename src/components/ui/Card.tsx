import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'surface' | 'sunken' | 'elevated' | 'glass';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  glow?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      variant = 'surface',
      padding = 'none',
      glow = false,
      className = '',
      ...props
    },
    ref
  ) => {
    const bgStyles = {
      surface: 'bg-surface/90 border border-border backdrop-blur-md',
      sunken: 'bg-surface-sunken/90 border border-border/80 backdrop-blur-md',
      elevated: 'bg-surface-elevated border border-border hover:border-accent/40 backdrop-blur-lg',
      glass: 'bg-surface-glass border border-border/70 backdrop-blur-xl',
    }[variant];

    const paddingStyles = {
      none: '',
      sm: 'p-4',
      md: 'p-6 sm:p-8',
      lg: 'p-8 sm:p-10',
    };

    const glowStyle = glow ? 'shadow-glow-sm border-accent/40' : 'shadow-soft';

    return (
      <div
        ref={ref}
        className={`rounded-xl ${bgStyles} ${glowStyle} overflow-hidden transition-all duration-200 ${paddingStyles[padding]} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export function CardHeader({
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-5 sm:p-6 pb-2 space-y-1.5 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={`text-lg sm:text-xl font-extrabold text-ink tracking-tight leading-snug ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={`text-sm sm:text-base text-ink-muted leading-relaxed ${className}`} {...props}>
      {children}
    </p>
  );
}

export function CardContent({
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-5 sm:p-6 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`p-5 sm:p-6 pt-2 flex items-center justify-between gap-3 border-t border-border/40 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
