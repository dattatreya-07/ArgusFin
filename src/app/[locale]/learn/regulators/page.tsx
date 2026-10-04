import React from 'react';
import { setRequestLocale } from 'next-intl/server';
import { REGULATORS } from '@/lib/education/data';
import { Link } from '@/i18n/routing';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, SectionHeading } from '@/components/ui';

export default function RegulatorsPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const langKey = (locale === 'hi' || locale === 'ta' ? locale : 'en') as 'en' | 'hi' | 'ta';

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-mono text-ink-muted">
        <Link href="/learn" className="hover:text-accent hover:underline">
          ← Back to Learn Hub
        </Link>
        <span>/</span>
        <span className="text-ink font-bold">Regulators Map</span>
      </div>

      <div className="space-y-2">
        <SectionHeading
          badge="Statutory Authorities"
          title="Who Does What in Indian Capital Markets?"
          subtitle="Understand the legal jurisdictions of SEBI, RBI, NSDL, CDSL, NSE, and BSE."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {REGULATORS.map((reg) => {
          const fullName = reg.fullName[langKey] || reg.fullName.en;
          const whatTheyDo = reg.whatTheyDo[langKey] || reg.whatTheyDo.en;
          const whatTheyDoNotDo = reg.whatTheyDoNotDo[langKey] || reg.whatTheyDoNotDo.en;

          return (
            <Card key={reg.id} id={reg.slug} className="border-border hover:border-accent transition-all flex flex-col justify-between">
              <CardHeader className="p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div>
                    <CardTitle className="text-lg font-bold text-ink">{reg.name}</CardTitle>
                    <span className="text-xs text-ink-muted font-mono">{fullName}</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-accent-soft text-accent border border-border font-mono">
                    {reg.role}
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-surface-sunken rounded-lg border border-border space-y-1">
                    <span className="font-bold text-accent font-mono block">✅ What They Do:</span>
                    <p className="text-ink leading-relaxed">{whatTheyDo}</p>
                  </div>

                  <div className="p-3 bg-risk-med-bg border border-risk-med-border/40 rounded-lg space-y-1 text-risk-med-text">
                    <span className="font-bold font-mono block">❌ What They Do NOT Do:</span>
                    <p className="leading-relaxed">{whatTheyDoNotDo}</p>
                  </div>
                </div>
              </CardHeader>

              <CardFooter className="bg-surface-sunken border-t border-border flex justify-between items-center p-4 text-xs font-mono text-ink-muted">
                <span>Official Statutory Site</span>
                <a
                  href={reg.officialSourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent font-bold hover:underline"
                >
                  Visit Official Portal ↗
                </a>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
