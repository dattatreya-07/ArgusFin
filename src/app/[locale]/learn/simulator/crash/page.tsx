import React from 'react';
import { setRequestLocale } from 'next-intl/server';
import { MarketCrashSimulator } from '@/components/MarketCrashSimulator';
import { Link } from '@/i18n/routing';
import { SectionHeading } from '@/components/ui';

export default function MarketCrashSimulatorPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-mono text-ink-muted">
        <Link href="/learn" className="hover:text-accent hover:underline">
          ← Back to Learn Hub
        </Link>
        <span>/</span>
        <span className="text-ink font-bold">Market Crash Simulator</span>
      </div>

      <div className="space-y-2">
        <SectionHeading
          badge="M12 Zero-Money Simulator"
          title="Market Crash &amp; Drawdown Interactive Simulator"
          subtitle="Test hold vs panic exit strategies during a -38% market crash (Zero real money at risk)."
        />
      </div>

      {/* Lazy Loaded Interactive Simulator */}
      <MarketCrashSimulator />
    </div>
  );
}
