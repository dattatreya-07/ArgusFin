'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import { Lang } from '@/lib/types';

export function LanguageSwitcher() {
  const currentLocale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('common');

  const handleLanguageChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale as Lang });
  };

  return (
    <div className="flex items-center space-x-2 text-sm font-sans">
      <span className="text-ink-muted text-xs font-semibold">{t('language')}:</span>
      <div className="inline-flex rounded-lg border border-border bg-surface-sunken p-0.5">
        <button
          type="button"
          onClick={() => handleLanguageChange('en')}
          className={`px-2.5 py-1 text-xs rounded-md font-semibold transition-all ${
            currentLocale === 'en'
              ? 'bg-accent text-accent-ink shadow-xs'
              : 'text-ink hover:text-accent hover:bg-surface'
          }`}
        >
          {t('english')}
        </button>
        <button
          type="button"
          onClick={() => handleLanguageChange('hi')}
          className={`px-2.5 py-1 text-xs rounded-md font-semibold transition-all ${
            currentLocale === 'hi'
              ? 'bg-accent text-accent-ink shadow-xs'
              : 'text-ink hover:text-accent hover:bg-surface'
          }`}
        >
          {t('hindi')}
        </button>
        <button
          type="button"
          onClick={() => handleLanguageChange('ta')}
          className={`px-2.5 py-1 text-xs rounded-md font-semibold transition-all ${
            currentLocale === 'ta'
              ? 'bg-accent text-accent-ink shadow-xs'
              : 'text-ink hover:text-accent hover:bg-surface'
          }`}
        >
          {t('tamil')}
        </button>
      </div>
    </div>
  );
}
