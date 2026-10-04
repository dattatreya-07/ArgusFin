import React from 'react';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { FINANCIAL_INSTRUMENTS } from '@/lib/education/data';
import { Link } from '@/i18n/routing';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  SectionHeading,
} from '@/components/ui';

export async function generateStaticParams() {
  return FINANCIAL_INSTRUMENTS.map((inst) => ({
    slug: inst.slug,
  }));
}

export default function InstrumentDetailPage({
  params: { locale, slug },
}: {
  params: { locale: string; slug: string };
}) {
  setRequestLocale(locale);

  const inst = FINANCIAL_INSTRUMENTS.find((item) => item.slug === slug);
  if (!inst) {
    notFound();
  }

  const langKey = (locale === 'hi' || locale === 'ta' ? locale : 'en') as 'en' | 'hi' | 'ta';

  const name = inst.name[langKey] || inst.name.en;
  const riskProfile = inst.riskProfile[langKey] || inst.riskProfile.en;
  const whatIsIt = inst.whatIsIt[langKey] || inst.whatIsIt.en;
  const howItWorks = inst.howItWorks[langKey] || inst.howItWorks.en;
  const howValueChanges = inst.howValueChanges[langKey] || inst.howValueChanges.en;
  const commonRisks = inst.commonRisks[langKey] || inst.commonRisks.en;
  const liquidity = inst.liquidity[langKey] || inst.liquidity.en;
  const costs = inst.costs[langKey] || inst.costs.en;
  const beginnerQuestion = inst.beginnerQuestion[langKey] || inst.beginnerQuestion.en;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-mono text-ink-muted">
        <Link href="/learn" className="hover:text-accent hover:underline">
          ← Back to Learn Hub
        </Link>
        <span>/</span>
        <span className="text-ink font-bold">Instruments</span>
      </div>

      <div className="space-y-2">
        <SectionHeading
          badge={inst.regulator}
          title={name}
          subtitle={whatIsIt}
        />
      </div>

      <Card className="border-border">
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-accent font-mono">
              Regulator: {inst.regulator}
            </span>
            <span className="text-xs font-bold px-2.5 py-1 rounded bg-surface-sunken border border-border text-ink font-mono">
              Benchmark: {inst.typicalReturnsBenchmark}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
            <div className="p-3 bg-surface-sunken rounded-lg border border-border">
              <span className="text-ink-muted block">Risk Profile:</span>
              <span className="font-bold text-ink">{riskProfile}</span>
            </div>
            <div className="p-3 bg-surface-sunken rounded-lg border border-border">
              <span className="text-ink-muted block">Liquidity:</span>
              <span className="font-bold text-ink">{liquidity}</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-4 border-t border-border">
          {/* How it works */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink font-mono">
              1. How It Works
            </h3>
            <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
              {howItWorks}
            </p>
          </div>

          {/* How Value Changes */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink font-mono">
              2. How Value Changes
            </h3>
            <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
              {howValueChanges}
            </p>
          </div>

          {/* Common Risks & Costs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-risk-med-bg border border-risk-med-border/40 rounded-xl space-y-1 text-risk-med-text text-xs">
              <span className="font-bold font-mono uppercase block">⚠️ Common Risks</span>
              <p className="leading-relaxed">{commonRisks}</p>
            </div>
            <div className="p-4 bg-surface-sunken border border-border rounded-xl space-y-1 text-ink-muted text-xs">
              <span className="font-bold font-mono uppercase text-ink block">💰 Applicable Costs</span>
              <p className="leading-relaxed">{costs}</p>
            </div>
          </div>

          {/* Beginner Question */}
          <div className="p-4 bg-accent-soft rounded-xl border border-accent/40 space-y-1.5">
            <span className="text-xs font-bold text-accent uppercase tracking-wider block font-mono">
              ❓ Question Every Beginner Must Ask
            </span>
            <p className="text-xs sm:text-sm text-ink font-bold leading-relaxed">
              {beginnerQuestion}
            </p>
          </div>
        </CardContent>

        <CardFooter className="bg-surface-sunken border-t border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 text-xs font-mono text-ink-muted">
          <span>Source: {inst.sourceTitle} ({inst.asOf})</span>
          <a
            href={inst.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent font-bold hover:underline shrink-0"
          >
            Official Reference ↗
          </a>
        </CardFooter>
      </Card>

      <div className="flex justify-between items-center pt-4 border-t border-border">
        <Link href="/learn">
          <Button variant="secondary" size="md">
            ← Back to All Instruments
          </Button>
        </Link>
        <Link href="/calculator">
          <Button variant="primary" size="md">
            Compare Benchmark in Calculator →
          </Button>
        </Link>
      </div>
    </div>
  );
}
