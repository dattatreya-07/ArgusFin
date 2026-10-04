'use client';

import React from 'react';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import { Lang } from '@/lib/types';

const LANGUAGES = [
  { code: 'en', label: 'English', nativeLabel: 'English', ariaLabel: 'Switch to English' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी', ariaLabel: 'हिन्दी में बदलें (Switch to Hindi)' },
  { code: 'ta', label: 'Tamil', nativeLabel: 'தமிழ்', ariaLabel: 'தமிழில் மாற்றவும் (Switch to Tamil)' },
] as const;

export interface LanguageSwitcherProps {
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ className = '' }) => {
  const currentLocale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale as Lang });
  };

  return (
    <nav
      aria-label="Language selection"
      className={`inline-flex items-center gap-1.5 p-1 rounded-pill bg-surface-sunken border border-border ${className}`}
    >
      {LANGUAGES.map((lang) => {
        const isActive = currentLocale === lang.code;
        return (
          <button
            key={lang.code}
            type="button"
            onClick={() => handleLanguageChange(lang.code)}
            aria-current={isActive ? 'true' : undefined}
            aria-label={lang.ariaLabel}
            className={`min-h-[48px] min-w-[48px] px-3.5 py-2 text-sm font-semibold rounded-pill transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${
              isActive
                ? 'bg-accent text-accent-ink shadow-soft'
                : 'text-ink-muted hover:text-ink hover:bg-surface'
            }`}
          >
            {lang.nativeLabel}
          </button>
        );
      })}
    </nav>
  );
};
