import React from 'react';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { LESSONS } from '@/lib/education/data';
import { Link } from '@/i18n/routing';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  Chip,
  SectionHeading,
} from '@/components/ui';
import { IconBook, IconCalculator, IconInfo } from '@/components/icons';

export async function generateStaticParams() {
  return LESSONS.map((lesson) => ({
    slug: lesson.slug,
  }));
}

export default function LessonDetailPage({
  params: { locale, slug },
}: {
  params: { locale: string; slug: string };
}) {
  setRequestLocale(locale);

  const lesson = LESSONS.find((l) => l.slug === slug);
  if (!lesson) {
    notFound();
  }

  const langKey = (locale === 'hi' || locale === 'ta' ? locale : 'en') as 'en' | 'hi' | 'ta';

  const title = lesson.title[langKey] || lesson.title.en;
  const summary = lesson.summary[langKey] || lesson.summary.en;
  const explanation = lesson.explanation[langKey] || lesson.explanation.en;
  const example = lesson.example[langKey] || lesson.example.en;
  const questionToAsk = lesson.questionToAsk[langKey] || lesson.questionToAsk.en;
  const misconception = lesson.misconception[langKey] || lesson.misconception.en;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-mono text-ink-muted">
        <Link href="/learn" className="hover:text-accent hover:underline">
          ← Back to Learn Hub
        </Link>
        <span>/</span>
        <span className="text-ink font-bold">{lesson.category}</span>
      </div>

      {/* Header */}
      <div className="space-y-2">
        <SectionHeading
          badge={`${lesson.estimatedMinutes} min lesson`}
          title={title}
          subtitle={summary}
        />
      </div>

      {/* Main Lesson Content Card */}
      <Card className="border-border">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-accent font-mono">
              Lesson Category: {lesson.category}
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-surface-sunken border border-border text-ink-muted font-mono">
              {lesson.difficulty}
            </span>
          </div>

          <div className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-ink font-mono">
              Core Concept Explanation
            </h2>
            <p className="text-sm sm:text-base text-ink leading-relaxed font-sans">
              {explanation}
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-4 border-t border-border">
          {/* Real World Example */}
          <div className="p-4 bg-surface-sunken rounded-xl border border-border space-y-1.5">
            <span className="text-xs font-bold text-ink uppercase tracking-wider block font-mono">
              💡 Real-World Factual Example
            </span>
            <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
              {example}
            </p>
          </div>

          {/* Key Question to Ask */}
          <div className="p-4 bg-accent-soft rounded-xl border border-accent/40 space-y-1.5">
            <span className="text-xs font-bold text-accent uppercase tracking-wider block font-mono">
              ❓ Question to Ask Yourself
            </span>
            <p className="text-xs sm:text-sm text-ink font-bold leading-relaxed">
              {questionToAsk}
            </p>
          </div>

          {/* Common Misconception */}
          <div className="p-4 bg-risk-med-bg border border-risk-med-border/40 rounded-xl space-y-1.5 text-risk-med-text">
            <span className="text-xs font-bold uppercase tracking-wider block font-mono">
              ⚠️ Common Misconception
            </span>
            <p className="text-xs sm:text-sm leading-relaxed">
              {misconception}
            </p>
          </div>
        </CardContent>

        {/* Provenance Footer */}
        <CardFooter className="bg-surface-sunken border-t border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 text-xs font-mono text-ink-muted">
          <div>
            <span className="block">Source: {lesson.sourceTitle}</span>
            <span className="block opacity-80">Publisher: {lesson.publisher} (Verified as of {lesson.asOf})</span>
          </div>
          <a
            href={lesson.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent font-bold hover:underline shrink-0"
          >
            Official Source ↗
          </a>
        </CardFooter>
      </Card>

      {/* Action Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border">
        <Link href="/learn">
          <Button variant="secondary" size="md">
            ← Back to Lessons List
          </Button>
        </Link>
        {lesson.simulatorLink && (
          <Link href={lesson.simulatorLink}>
            <Button variant="primary" size="md" icon={<IconCalculator />}>
              {lesson.simulatorAction || 'Try Interactive Tool'} →
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
