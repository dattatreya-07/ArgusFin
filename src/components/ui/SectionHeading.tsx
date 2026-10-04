import React from 'react';

export interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  badge?: string;
  id?: string;
  className?: string;
  align?: 'left' | 'center';
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  title,
  subtitle,
  badge,
  id,
  className = '',
  align = 'left',
}) => {
  const alignClass = align === 'center' ? 'text-center items-center' : 'text-left items-start';

  return (
    <div className={`flex flex-col gap-2.5 ${alignClass} ${className}`}>
      {badge && (
        <span className="tag-bracket">
          {badge}
        </span>
      )}
      <h2
        id={id}
        className="font-extrabold text-2xl sm:text-3xl lg:text-4xl text-ink font-inktrap tracking-tight leading-snug"
      >
        {title}
      </h2>
      {subtitle && (
        <p className="text-base sm:text-lg text-ink-muted max-w-[65ch] leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
};
