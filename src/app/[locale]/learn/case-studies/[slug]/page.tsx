import React from 'react';
import { notFound } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { getCaseStudyBySlug, getAllCaseStudies } from '@/lib/financeX/academy/caseStudies';
import { Card, CardHeader, CardContent, CardFooter, Button } from '@/components/ui';
import { SpeechControl } from '@/components/SpeechControl';
import { IconShield, IconBook, IconPhone } from '@/components/icons';

interface Props {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const cases = getAllCaseStudies();
  const locales = ['en', 'hi', 'ta'];
  const params: Array<{ locale: string; slug: string }> = [];

  for (const loc of locales) {
    for (const c of cases) {
      params.push({ locale: loc, slug: c.slug });
    }
  }

  return params;
}

export default async function CaseStudyDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  const caseStudy = getCaseStudyBySlug(slug);

  if (!caseStudy) {
    notFound();
  }

  const narrationText = `${caseStudy.title}. ${caseStudy.summary}. What happened: ${caseStudy.whatHappened}. Psychological manipulation: ${caseStudy.psychologicalManipulation}.`;

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-4">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 text-xs">
          <Link href="/learn" className="text-accent hover:underline font-semibold">
            Academy
          </Link>
          <span className="text-ink-muted">/</span>
          <Link href="/learn/case-studies" className="text-accent hover:underline font-semibold">
            Case Studies
          </Link>
          <span className="text-ink-muted">/</span>
          <span className="text-ink-muted font-mono">{caseStudy.category}</span>
        </div>

        <SpeechControl text={narrationText} locale={locale as any} />
      </div>

      {/* Main Header */}
      <div className="space-y-3 border-b border-border pb-6">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs font-mono font-bold px-3 py-1 rounded-pill bg-accent-soft text-accent">
            {caseStudy.category}
          </span>
          <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-pill bg-risk-high-bg text-risk-high-text border border-risk-high-border/30">
            {caseStudy.badge}
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
          {caseStudy.title}
        </h1>
        <p className="text-base sm:text-lg text-ink font-medium leading-relaxed">
          {caseStudy.summary}
        </p>
      </div>

      {/* Structured 9-Part Analysis */}
      <div className="space-y-6">
        {/* 1. What Happened */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-ink font-mono flex items-center gap-2">
              <span>📋 1. What Happened</span>
            </h2>
          </CardHeader>
          <CardContent className="text-sm text-ink leading-relaxed">
            <p>{caseStudy.whatHappened}</p>
          </CardContent>
        </Card>

        {/* 2. How Victims Were Approached */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-ink font-mono flex items-center gap-2">
              <span>🎯 2. How Victims Were Approached</span>
            </h2>
          </CardHeader>
          <CardContent className="text-sm text-ink leading-relaxed">
            <p>{caseStudy.howVictimsApproached}</p>
          </CardContent>
        </Card>

        {/* 3. Warning Signs */}
        <Card className="border-risk-high-border/30 bg-risk-high-bg/20">
          <CardHeader className="pb-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-risk-high-text font-mono flex items-center gap-2">
              <span>⚠️ 3. Warning Signs</span>
            </h2>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-ink list-disc list-inside">
              {caseStudy.warningSigns.map((ws, i) => (
                <li key={i} className="leading-relaxed">{ws}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* 4. Psychological Manipulation */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-ink font-mono flex items-center gap-2">
              <span>🧠 4. Psychological Manipulation Technique</span>
            </h2>
          </CardHeader>
          <CardContent className="text-sm text-ink leading-relaxed">
            <p>{caseStudy.psychologicalManipulation}</p>
          </CardContent>
        </Card>

        {/* 5. How Money / Data Was Lost */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-ink font-mono flex items-center gap-2">
              <span>💸 5. How Money &amp; Data Were Lost</span>
            </h2>
          </CardHeader>
          <CardContent className="text-sm text-ink leading-relaxed">
            <p>{caseStudy.howMoneyLost}</p>
          </CardContent>
        </Card>

        {/* 6. What Users Should Have Checked */}
        <Card className="border-emerald-500/30 bg-emerald-500/5">
          <CardHeader className="pb-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-mono flex items-center gap-2">
              <span>✅ 6. What You Should Have Checked</span>
            </h2>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-ink list-disc list-inside">
              {caseStudy.whatUsersShouldHaveChecked.map((chk, i) => (
                <li key={i} className="leading-relaxed">{chk}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* 7. How to Report */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-ink font-mono flex items-center gap-2">
              <span>🚨 7. How To Report Suspected Incidents</span>
            </h2>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-ink list-disc list-inside">
              {caseStudy.howToReport.map((rep, i) => (
                <li key={i} className="leading-relaxed">{rep}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* 8. Lessons Learned */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-ink font-mono flex items-center gap-2">
              <span>💡 8. Key Lessons Learned</span>
            </h2>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-ink list-disc list-inside">
              {caseStudy.lessonsLearned.map((ll, i) => (
                <li key={i} className="leading-relaxed">{ll}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* 9. Official Sources */}
        <Card className="border-border bg-surface-sunken">
          <CardHeader className="pb-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-ink font-mono flex items-center gap-2">
              <span>🏛️ 9. Official Authoritative Sources</span>
            </h2>
          </CardHeader>
          <CardContent className="space-y-3">
            {caseStudy.officialSources.map((src, i) => (
              <div key={i} className="p-3 bg-surface rounded-xl border border-border flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <span className="text-xs font-bold text-ink block">{src.authority}</span>
                  <span className="text-xs text-ink-muted">{src.advisoryTitle}</span>
                  <span className="text-[10px] font-mono text-ink-muted/80 block mt-0.5">Verified: {src.verifiedAt}</span>
                </div>
                <a
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-accent hover:underline flex items-center gap-1"
                >
                  <span>Official Portal ↗</span>
                </a>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Integrated Learn → Protect → Prove Action Strip */}
      <Card className="border-accent/40 bg-accent-soft/20 p-6 space-y-4">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-ink flex items-center gap-2">
            <span>🛡️ Experience the FinanceX Loop</span>
          </h3>
          <p className="text-xs sm:text-sm text-ink-muted">
            Test a simulated real-world sample of this scam pattern in Shield, review the score calculation breakdown, and master the underlying lesson.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href={`/check?text=${encodeURIComponent(caseStudy.shieldExamplePayload)}`}>
            <Button variant="primary" size="md" icon={<IconShield />}>
              Try this example in Shield →
            </Button>
          </Link>
          <Link href={`/learn/${caseStudy.relatedTrackId === 'track_resilience' ? 'investor-resilience' : 'investing-basics'}/${caseStudy.relatedLessonSlug}`}>
            <Button variant="secondary" size="md" icon={<IconBook />}>
              Open Related Academy Lesson →
            </Button>
          </Link>
          <Link href="/report">
            <Button variant="quiet" size="md" icon={<IconPhone />}>
              Draft Incident Report →
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
