import React from 'react';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { SCAM_MODULES } from '@/lib/education/data';
import { Link } from '@/i18n/routing';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  BandBadge,
  SectionHeading,
} from '@/components/ui';
import { IconAlertTriangle } from '@/components/icons';

export async function generateStaticParams() {
  return SCAM_MODULES.map((scam) => ({
    slug: scam.slug,
  }));
}

export default function ScamDetailPage({
  params: { locale, slug },
}: {
  params: { locale: string; slug: string };
}) {
  setRequestLocale(locale);

  const scam = SCAM_MODULES.find((item) => item.slug === slug);
  if (!scam) {
    notFound();
  }

  const langKey = (locale === 'hi' || locale === 'ta' ? locale : 'en') as 'en' | 'hi' | 'ta';

  const title = scam.title[langKey] || scam.title.en;
  const summary = scam.summary[langKey] || scam.summary.en;
  const howItOperates = scam.howItOperates[langKey] || scam.howItOperates.en;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-mono text-ink-muted">
        <Link href="/learn" className="hover:text-accent hover:underline">
          ← Back to Learn Hub
        </Link>
        <span>/</span>
        <span className="text-ink font-bold">Scam Awareness</span>
      </div>

      <div className="space-y-2">
        <SectionHeading
          badge={`Archetype: ${scam.archetype}`}
          title={title}
          subtitle={summary}
        />
      </div>

      <Card className="border-risk-high-border/40 bg-surface">
        <CardHeader className="space-y-3">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <BandBadge band="HIGH" size="md" />
            <span className="text-xs font-bold text-risk-high-text font-mono">
              Pattern Code: {scam.archetype}
            </span>
          </div>

          <div className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-ink font-mono">
              How This Scam Operates
            </h2>
            <p className="text-xs sm:text-sm text-ink-muted leading-relaxed font-sans">
              {howItOperates}
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-4 border-t border-border">
          {/* Warning Signs */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-risk-high-text font-mono flex items-center gap-1.5">
              <IconAlertTriangle className="w-4 h-4 text-accent" /> Red Flag Warning Signs
            </h3>
            <div className="space-y-2">
              {scam.warningSigns.map((ws, idx) => {
                const text = ws[langKey] || ws.en;
                return (
                  <div key={idx} className="p-3 rounded-lg bg-risk-high-bg border border-risk-high-border/30 text-xs text-risk-high-text font-medium">
                    ⚠️ {text}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Socratic Questions */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink font-mono">
              ❓ Essential Verification Questions
            </h3>
            <div className="space-y-2">
              {scam.socraticQuestions.map((sq, idx) => {
                const text = sq[langKey] || sq.en;
                return (
                  <div key={idx} className="p-3.5 rounded-lg bg-accent-soft border border-accent/40 text-xs font-bold text-ink">
                    {text}
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>

        <CardFooter className="bg-surface-sunken border-t border-border flex justify-between items-center p-4 text-xs font-mono text-ink-muted">
          <span>Source: {scam.sourceTitle} ({scam.asOf})</span>
          <a
            href={scam.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent font-bold hover:underline"
          >
            Official Alert Reference ↗
          </a>
        </CardFooter>
      </Card>

      <div className="flex justify-between items-center pt-4 border-t border-border">
        <Link href="/learn">
          <Button variant="secondary" size="md">
            ← Back to Scam Modules
          </Button>
        </Link>
        <Link href="/check">
          <Button variant="primary" size="md">
            Check Suspicious Message Now →
          </Button>
        </Link>
      </div>
    </div>
  );
}
