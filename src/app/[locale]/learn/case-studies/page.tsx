import React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { getAllCaseStudies } from '@/lib/financeX/academy/caseStudies';
import { Card, CardHeader, CardContent, CardFooter, Button, Chip } from '@/components/ui';
import { IconShield, IconBook } from '@/components/icons';

export default function CaseStudiesIndexPage() {
  const locale = useLocale();
  const caseStudies = getAllCaseStudies();

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-4">
      {/* Header Banner */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Link
            href="/learn"
            className="text-xs font-semibold text-accent hover:underline flex items-center gap-1"
          >
            ← Back to Academy
          </Link>
          <span className="text-xs text-ink-muted">/</span>
          <span className="text-xs font-mono text-ink-muted uppercase">Case Studies</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
              India Cyber Scam Case Studies
            </h1>
            <p className="text-sm sm:text-base text-ink-muted mt-1 max-w-2xl leading-relaxed">
              Real-world fraud patterns documented by official authorities (I4C, SEBI, RBI).
              Learn how victims were approached, how psychological traps work, and how to protect yourself.
            </p>
          </div>
          <Link href="/check">
            <Button variant="primary" size="md" icon={<IconShield />}>
              Test with Shield →
            </Button>
          </Link>
        </div>
      </div>

      {/* Case Studies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {caseStudies.map((cs) => (
          <Card key={cs.slug} className="flex flex-col justify-between border-border hover:border-accent/40 transition-all hover:shadow-md">
            <CardHeader className="space-y-3 pb-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-pill bg-accent-soft text-accent">
                  {cs.category}
                </span>
                <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-pill bg-risk-high-bg text-risk-high-text border border-risk-high-border/30">
                  {cs.badge}
                </span>
              </div>
              <h2 className="text-lg font-bold text-ink leading-snug hover:text-accent transition-colors">
                <Link href={`/learn/case-studies/${cs.slug}`}>
                  {cs.title}
                </Link>
              </h2>
              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed line-clamp-3">
                {cs.summary}
              </p>
            </CardHeader>

            <CardContent className="space-y-3 py-2 border-t border-border/60">
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-ink font-mono block">
                  Key Warning Signs
                </span>
                <ul className="space-y-1 text-xs text-ink/80 list-disc list-inside">
                  {cs.warningSigns.slice(0, 2).map((ws, i) => (
                    <li key={i} className="line-clamp-1">{ws}</li>
                  ))}
                </ul>
              </div>
            </CardContent>

            <CardFooter className="pt-3 border-t border-border flex items-center justify-between gap-2 bg-surface-sunken rounded-b-xl">
              <Link href={`/learn/case-studies/${cs.slug}`}>
                <Button variant="secondary" size="sm">
                  Read Full Case Study →
                </Button>
              </Link>
              <Link
                href={`/check?text=${encodeURIComponent(cs.shieldExamplePayload)}`}
                className="text-xs font-semibold text-accent hover:underline flex items-center gap-1"
              >
                <span>Try in Shield</span>
                <span>🛡️</span>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
