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
    <div className="flex items-center space-x-2 text-sm">
      <span className="text-slate-500 font-medium">{t('language')}:</span>
      <div className="inline-flex rounded-md shadow-sm border border-slate-300 bg-white p-0.5">
        <button
          type="button"
          onClick={() => handleLanguageChange('en')}
          className={`px-2.5 py-1 text-xs rounded font-medium transition ${
            currentLocale === 'en'
              ? 'bg-slate-900 text-white'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          {t('english')}
        </button>
        <button
          type="button"
          onClick={() => handleLanguageChange('hi')}
          className={`px-2.5 py-1 text-xs rounded font-medium transition ${
            currentLocale === 'hi'
              ? 'bg-slate-900 text-white'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          {t('hindi')}
        </button>
        <button
          type="button"
          onClick={() => handleLanguageChange('ta')}
          className={`px-2.5 py-1 text-xs rounded font-medium transition ${
            currentLocale === 'ta'
              ? 'bg-slate-900 text-white'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          {t('tamil')}
        </button>
      </div>
    </div>
  );
}
