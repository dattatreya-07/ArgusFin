import { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { Lang } from '@/lib/types';
import { VoiceDiagnostics } from '@/components/VoiceDiagnostics';
import { CustomCursor } from '@/components/CustomCursor';
import { ScrollRevealProvider } from '@/components/ScrollReveal';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

import { HeaderNav } from '@/components/HeaderNav';

function Footer() {
  return (
    <footer className="border-t border-border bg-surface-sunken/80 text-ink-muted mt-24 py-14 text-xs">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 border-b border-border/60">
          {/* Brand Column */}
          <div className="md:col-span-4 space-y-3">
            <div className="flex items-center gap-2.5">
              <img
                src="/assets/logo.png"
                alt="FinanceX Logo"
                className="w-7 h-7 object-contain rounded"
              />
              <div className="flex items-center">
                <span className="text-lg font-black tracking-tight text-ink font-inktrap">
                  Finance
                </span>
                <span className="text-lg font-black tracking-tight text-accent font-inktrap ml-0.5">
                  X
                </span>
              </div>
              <span className="tag-bracket text-[10px]">
                Learn · Protect · Prove
              </span>
            </div>
            <p className="text-ink-muted text-xs leading-relaxed max-w-[40ch]">
              FinanceX connects interactive financial learning, ArgusFin Shield fraud detection, and tamper-evident Web3 credentials into a unified trust ecosystem.
            </p>
            <div className="flex items-center gap-2 pt-1 font-mono text-[11px]">
              <span className="px-2.5 py-1 rounded bg-surface border border-border text-emerald-500 dark:text-emerald-400">
                ● 100% In-Browser Privacy
              </span>
              <span className="px-2.5 py-1 rounded bg-surface border border-border text-ink-dim">
                Zero User Storage
              </span>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-6">
            <div className="space-y-2">
              <p className="font-bold text-xs uppercase tracking-wider text-ink font-mono">
                Scam Analysis
              </p>
              <ul className="space-y-1.5 text-ink-muted">
                <li>
                  <Link href="/check" className="hover:text-accent transition-colors">
                    Scam Detect
                  </Link>
                </li>
                <li>
                  <Link href="/calculator" className="hover:text-accent transition-colors">
                    Yield Calculator
                  </Link>
                </li>
                <li>
                  <Link href="/simulate" className="hover:text-accent transition-colors">
                    Doubling Simulator
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <p className="font-bold text-xs uppercase tracking-wider text-ink font-mono">
                Authorities & Help
              </p>
              <ul className="space-y-1.5 text-ink-muted">
                <li>
                  <Link href="/authorities" className="hover:text-accent transition-colors">
                    Authority Directory
                  </Link>
                </li>
                <li>
                  <Link href="/report" className="hover:text-accent transition-colors">
                    Victim Incident Record
                  </Link>
                </li>
                <li>
                  <Link href="/ask" className="hover:text-accent transition-colors">
                    Cited Q&A Assistant
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <p className="font-bold text-xs uppercase tracking-wider text-ink font-mono">
                Emergency Portals
              </p>
              <ul className="space-y-1.5 text-ink-muted">
                <li>
                  <a
                    href="https://cybercrime.gov.in"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-accent transition-colors"
                  >
                    Cyber Crime 1930 ↗
                  </a>
                </li>
                <li>
                  <a
                    href="https://scores.gov.in"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-accent transition-colors"
                  >
                    SEBI SCORES ↗
                  </a>
                </li>
                <li>
                  <a
                    href="https://sachet.rbi.org.in"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-accent transition-colors"
                  >
                    RBI Sachet Portal ↗
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Mandatory Educational & Regulatory Disclaimers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-surface/70 rounded-lg border border-border space-y-1">
            <p className="font-bold text-xs uppercase tracking-wider text-ink font-mono">
              Educational Public Good
            </p>
            <p className="text-ink-muted leading-relaxed text-[11px]">
              Educational tool. Not investment advice. Not a legal document. Independent public good project; not an official service of SEBI, RBI, or any regulator. No financial promotions, stock tips, or monetization.
            </p>
          </div>
          <div className="p-4 bg-surface/70 rounded-lg border border-border space-y-1">
            <p className="font-bold text-xs uppercase tracking-wider text-ink font-mono">
              Privacy By Design
            </p>
            <p className="text-ink-muted leading-relaxed text-[11px]">
              Nothing is stored on any server. Personal and financial identifiers (phone numbers, account numbers, UPI IDs) are masked directly on your device before any external analysis.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-border/60 text-ink-dim text-[11px]">
          <p>© 2026 ArgusFin · Educational Public Good Project</p>
          <p className="mt-1 sm:mt-0 font-mono">
            STRICTLY NON-COMMERCIAL · ZERO ADS · ZERO AFFILIATES
          </p>
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
    <html lang={locale} className="light" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var t = localStorage.getItem('argus-theme');
                if (t === 'dark') {
                  document.documentElement.classList.remove('light');
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.classList.add('light');
                }
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col justify-between bg-canvas text-ink antialiased font-sans selection:bg-accent selection:text-accent-ink transition-colors duration-200">
        <CustomCursor />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-accent focus:text-accent-ink focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
        >
          Skip to main content
        </a>
        <NextIntlClientProvider messages={messages}>
          <ScrollRevealProvider>
            <HeaderNav />
            <main id="main-content" className="flex-grow max-w-[1240px] w-full mx-auto px-4 sm:px-6 py-8">
              {children}
            </main>
            <Footer />
            <VoiceDiagnostics lang={locale as Lang} />
          </ScrollRevealProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
