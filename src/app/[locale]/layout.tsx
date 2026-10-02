import { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { Lang } from '@/lib/types';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

function HeaderNav() {
  const tNav = useTranslations('nav');
  const tCommon = useTranslations('common');

  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold tracking-tight text-slate-900">
              SANGYAN <span className="text-xs font-semibold px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">Resilience</span>
            </span>
          </Link>
          <div className="md:hidden">
            <LanguageSwitcher />
          </div>
        </div>

        <nav className="flex items-center space-x-1 sm:space-x-4 text-xs sm:text-sm font-medium text-slate-600 overflow-x-auto pb-1 md:pb-0">
          <Link href="/" className="hover:text-slate-900 px-2 py-1 rounded">
            {tNav('home')}
          </Link>
          <Link href="/check" className="hover:text-slate-900 px-2 py-1 rounded">
            {tNav('check')}
          </Link>
          <Link href="/calculator" className="hover:text-slate-900 px-2 py-1 rounded">
            {tNav('calculator')}
          </Link>
          <Link href="/learn" className="hover:text-slate-900 px-2 py-1 rounded">
            {tNav('learn')}
          </Link>
          <Link href="/report" className="hover:text-slate-900 px-2 py-1 rounded">
            {tNav('report')}
          </Link>
          <Link href="/ask" className="hover:text-slate-900 px-2 py-1 rounded">
            {tNav('ask')}
          </Link>
        </nav>

        <div className="hidden md:block">
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}

function Footer() {
  const t = useTranslations('common');

  return (
    <footer className="border-t border-slate-200 bg-slate-50 mt-16 py-8 text-xs text-slate-500">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-4">
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900">
          <p className="font-semibold text-xs tracking-wide uppercase text-amber-800 mb-1">
            Mandatory Notice (G3)
          </p>
          <p>{t('disclaimer')}</p>
        </div>
        <div className="p-3 bg-slate-100 border border-slate-200 rounded-lg text-slate-700">
          <p className="font-semibold text-xs tracking-wide uppercase text-slate-600 mb-1">
            Privacy Guarantee (G6)
          </p>
          <p>{t('privacyNotice')}</p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-slate-200 text-slate-400">
          <p>© 2026 SANGYAN Investor Resilience Initiative</p>
          <p>Strictly non-commercial · SEBI + NSDL Hackathon Infrastructure</p>
        </div>
      </div>
    </footer>
  );
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: ReactNode;
  params: { locale: string };
}) {
  if (!routing.locales.includes(locale as Lang)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className="min-h-screen flex flex-col justify-between bg-slate-50 text-slate-900 antialiased">
        <NextIntlClientProvider messages={messages}>
          <HeaderNav />
          <main className="flex-grow max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
            {children}
          </main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
