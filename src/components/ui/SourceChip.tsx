import React from 'react';
import { IconLink } from '@/components/icons';

export interface SourceChipProps {
  title: string;
  publisher: string;
  url?: string;
  href?: string;
  verifiedAt?: string;
  date?: string;
  className?: string;
}

export function SourceChip({
  title,
  publisher,
  url,
  href,
  verifiedAt,
  date,
  className = '',
}: SourceChipProps) {
  const resolvedUrl = href || url;
  const resolvedDate = date || verifiedAt;

  const content = (
    <div className={`p-3 rounded-lg border border-border bg-surface hover:bg-surface-sunken transition text-left space-y-1 shadow-soft ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-bold text-ink line-clamp-1">
          {title}
        </span>
        {resolvedUrl && <IconLink size={16} className="shrink-0 text-accent" />}
      </div>
      <div className="flex items-center justify-between text-xs text-ink-muted">
        <span>{publisher}</span>
        {resolvedDate && <span className="font-mono">As of: {resolvedDate}</span>}
      </div>
    </div>
  );

  if (resolvedUrl) {
    return (
      <a
        href={resolvedUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-lg"
      >
        {content}
      </a>
    );
  }

  return content;
}
