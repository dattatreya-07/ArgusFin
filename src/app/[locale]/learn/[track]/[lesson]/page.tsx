import React from 'react';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { curriculumService, LESSONS, TRACKS } from '@/lib/financeX/academy/curriculum';
import { Card, CardHeader, CardContent, Button, Chip } from '@/components/ui';

export async function generateStaticParams() {
  const params: Array<{ track: string; lesson: string }> = [];
  LESSONS.forEach((lesson) => {
    const track = TRACKS.find((t) => t.id === lesson.trackId);
    if (track) {
      params.push({
        track: track.slug,
        lesson: lesson.slug,
      });
    }
  });
  return params;
}

export default function LessonDetailPage({
  params: { locale, track: trackSlug, lesson: lessonSlug },
}: {
  params: { locale: string; track: string; lesson: string };
}) {
  setRequestLocale(locale);

  const track = curriculumService.getTrackBySlug(trackSlug);
  const lesson = curriculumService.getLessonBySlug(lessonSlug);

  if (!track || !lesson || lesson.trackId !== track.id) {
    notFound();
  }

  const langKey = (locale === 'hi' || locale === 'ta' ? locale : 'en') as 'en' | 'hi' | 'ta';

  const title = lesson.title[langKey] || lesson.title.en;
  const description = lesson.description[langKey] || lesson.description.en;
  const objectives = lesson.objectives[langKey] || lesson.objectives.en || [];
  const sections = lesson.sections[langKey] || lesson.sections.en || [];
  const keyTakeaways = lesson.keyTakeaways[langKey] || lesson.keyTakeaways.en || [];
  const nextLesson = curriculumService.getNextLesson(lesson.slug);

  return (
    <div className="max-w-[840px] mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-mono text-ink-muted">
        <Link href="/learn" className="hover:text-accent hover:underline">
          Academy
        </Link>
        <span>/</span>
        <Link href={`/learn/${track.slug}`} className="hover:text-accent hover:underline">
          {track.slug}
        </Link>
        <span>/</span>
        <span className="text-ink font-bold">{lesson.slug}</span>
      </div>

      {/* Lesson Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Chip icon={<span>⏱️</span>}>{lesson.estimatedMinutes} min read</Chip>
          <Chip icon={<span>🎯</span>}>{lesson.level}</Chip>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black font-inktrap text-ink tracking-tight">
          {title}
        </h1>
        <p className="text-base text-ink-muted leading-relaxed">
          {description}
        </p>
      </div>

      {/* Learning Objectives Box */}
      {objectives.length > 0 && (
        <Card className="bg-surface-sunken border-accent/30">
          <CardHeader className="py-4">
            <h2 className="text-sm font-bold font-mono text-accent uppercase tracking-wider">
              Learning Objectives
            </h2>
            <ul className="list-disc list-inside text-sm text-ink space-y-1.5 mt-2">
              {objectives.map((obj, i) => (
                <li key={i}>{obj}</li>
              ))}
            </ul>
          </CardHeader>
        </Card>
      )}

      {/* Structured Sections */}
      <div className="space-y-6">
        {sections.map((sec, i) => (
          <div key={i} className="p-6 rounded-2xl bg-surface border border-border space-y-3">
            <h2 className="text-xl font-bold font-inktrap text-ink">{sec.title}</h2>
            <p className="text-sm sm:text-base text-ink-muted leading-relaxed whitespace-pre-line">
              {sec.content}
            </p>

            {sec.codeOrFormula && (
              <div className="p-3 rounded-lg bg-surface-sunken border border-border font-mono text-xs text-accent">
                {sec.codeOrFormula}
              </div>
            )}

            {sec.example && (
              <div className="p-3.5 rounded-xl bg-accent-soft/40 border border-accent/20 text-xs text-ink space-y-1">
                <span className="font-bold text-accent block uppercase font-mono">Example:</span>
                <p>{sec.example}</p>
              </div>
            )}

            {sec.warning && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 space-y-1">
                <span className="font-bold block uppercase font-mono">⚠️ Safety Guardrail Warning:</span>
                <p>{sec.warning}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Key Takeaways */}
      {keyTakeaways.length > 0 && (
        <div className="p-6 rounded-2xl bg-surface border border-border space-y-3">
          <h2 className="text-lg font-bold font-inktrap text-ink">Key Takeaways</h2>
          <ul className="space-y-2">
            {keyTakeaways.map((takeaway, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-ink">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>{takeaway}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Verified Source Provenance */}
      <div className="p-4 rounded-xl bg-surface-sunken border border-border space-y-2 text-xs text-ink-muted">
        <span className="font-mono font-bold uppercase tracking-wider block text-accent">
          Verified Source Provenance
        </span>
        {lesson.sources.map((src) => (
          <div key={src.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-1 border-t border-border/50">
            <span>
              <strong>{src.publisher}:</strong> {src.title}
            </span>
            <a
              href={src.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline font-mono text-[11px]"
            >
              Verify Source (As of {src.verifiedAt}) →
            </a>
          </div>
        ))}
      </div>

      {/* Action Footer: Quiz & Next Lesson */}
      <div className="p-6 rounded-2xl bg-surface border border-border flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link href={`/learn/quiz/${lesson.quizId}`}>
          <Button variant="primary" size="lg">
            Take Lesson Quiz →
          </Button>
        </Link>
        {nextLesson && (
          <Link href={`/learn/${track.slug}/${nextLesson.slug}`}>
            <Button variant="secondary" size="md">
              Next Lesson: {nextLesson.title[langKey] || nextLesson.title.en} →
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
