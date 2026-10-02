import { ReactNode } from 'react';
import Image from 'next/image';
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
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur sticky top-0 z-30 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2.5 group">
            {/* Canonical Argus Fin Logo */}
            <Image
              src="/argus-fin-logo.png"
              alt="Argus Fin Logo"
              width={140}
              height={36}
              priority
              className="h-9 w-auto object-contain transition-transform group-hover:scale-105"
            />
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <span className="text-lg font-extrabold tracking-tight text-slate-900 font-sans">
                  Argus <span className="text-emerald-600 font-black">Fin</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-blue-100 text-blue-900 rounded-full border border-blue-200">
                  SANGYAN
                </span>
              </div>
              <span className="text-[10px] font-medium text-slate-500 hidden sm:inline">
                Investor Resilience Infrastructure
              </span>
            </div>
          </Link>
          <div className="md:hidden">
            <LanguageSwitcher />
          </div>
        </div>

        <nav className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm font-semibold text-slate-600 overflow-x-auto pb-1 md:pb-0">
          <Link href="/" className="hover:text-slate-900 hover:bg-slate-100 px-2.5 py-1.5 rounded-lg whitespace-nowrap transition">
            {tNav('home')}
          </Link>
          <Link href="/check" className="hover:text-slate-900 hover:bg-slate-100 px-2.5 py-1.5 rounded-lg whitespace-nowrap transition">
            {tNav('check')}
          </Link>
          <Link href="/calculator" className="hover:text-slate-900 hover:bg-slate-100 px-2.5 py-1.5 rounded-lg whitespace-nowrap transition">
            {tNav('calculator')}
          </Link>
          <Link href="/simulate" className="hover:text-slate-900 hover:bg-slate-100 px-2.5 py-1.5 rounded-lg whitespace-nowrap transition">
            {tNav('simulator')}
          </Link>
          <Link href="/authorities" className="hover:text-slate-900 hover:bg-slate-100 px-2.5 py-1.5 rounded-lg whitespace-nowrap transition">
            {tNav('authorities')}
          </Link>
          <Link href="/report" className="hover:text-slate-900 hover:bg-slate-100 px-2.5 py-1.5 rounded-lg whitespace-nowrap transition">
            {tNav('report')}
          </Link>
          <Link href="/ask" className="hover:text-slate-900 hover:bg-slate-100 px-2.5 py-1.5 rounded-lg whitespace-nowrap transition">
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
    <footer className="border-t border-slate-200 bg-slate-900 text-slate-400 mt-16 py-10 text-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <Image
              src="/argus-fin-logo.png"
              alt="Argus Fin"
              width={120}
              height={32}
              className="h-8 w-auto object-contain brightness-110"
            />
            <div>
              <p className="text-white font-bold text-sm">
                Argus Fin <span className="text-slate-400 font-normal">/ SANGYAN — Investor Resilience</span>
              </p>
              <p className="text-[11px] text-slate-500">
                Evidence-Based Fraud Defense & Truth in Numbers for Indian Retail Investors
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-[11px] text-slate-400">
            <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-emerald-400 font-mono">
              Privacy Shield Active
            </span>
            <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-blue-300 font-mono">
              SEBI/RBI Grounded
            </span>
          </div>
        </div>

        <div className="p-3 bg-amber-950/40 border border-amber-800/60 rounded-xl text-amber-200">
          <p className="font-semibold text-xs tracking-wide uppercase text-amber-300 mb-1">
            Mandatory Notice (G3)
          </p>
          <p>{t('disclaimer')}</p>
        </div>
        <div className="p-3 bg-slate-800/70 border border-slate-700/80 rounded-xl text-slate-300">
          <p className="font-semibold text-xs tracking-wide uppercase text-slate-400 mb-1">
            Privacy Guarantee (G6)
          </p>
          <p>{t('privacyNotice')}</p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-slate-800 text-slate-500">
          <p>© 2026 Argus Fin • SANGYAN Investor Resilience Initiative</p>
          <p>Strictly non-commercial · SEBI + NSDL Investor Protection Hackathon</p>
        </div>
      </div>
    </footer>
  );
}

import { VoiceDiagnostics } from '@/components/VoiceDiagnostics';

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
          <VoiceDiagnostics lang={locale as Lang} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
