import React from 'react';

export interface SkeletonBlockProps {
  height?: string;
  width?: string;
  className?: string;
  rounded?: 'sm' | 'md' | 'lg' | 'pill' | 'full';
}

export const SkeletonBlock: React.FC<SkeletonBlockProps> = ({
  height = 'h-4',
  width = 'w-full',
  className = '',
  rounded = 'md',
}) => {
  const roundedClass =
    rounded === 'sm'
      ? 'rounded-sm'
      : rounded === 'lg'
      ? 'rounded-lg'
      : rounded === 'pill'
      ? 'rounded-pill'
      : rounded === 'full'
      ? 'rounded-full'
      : 'rounded-md';

  return (
    <div
      aria-hidden="true"
      className={`bg-border/60 animate-pulse ${height} ${width} ${roundedClass} ${className}`}
    />
  );
};
