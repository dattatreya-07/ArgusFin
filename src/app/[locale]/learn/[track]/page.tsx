import React from 'react';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { curriculumService, TRACKS } from '@/lib/financeX/academy/curriculum';
import { Card, CardHeader, CardContent, Button, Chip } from '@/components/ui';

export async function generateStaticParams() {
  return TRACKS.map((t) => ({
    track: t.slug,
  }));
}

export default function TrackDetailPage({
  params: { locale, track: trackSlug },
}: {
  params: { locale: string; track: string };
}) {
  setRequestLocale(locale);

  const track = curriculumService.getTrackBySlug(trackSlug);
  if (!track) {
    notFound();
  }

  const langKey = (locale === 'hi' || locale === 'ta' ? locale : 'en') as 'en' | 'hi' | 'ta';
  const lessons = curriculumService.getLessons(langKey, track.slug);

  return (
    <div className="max-w-[1000px] mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-mono text-ink-muted">
        <Link href="/learn" className="hover:text-accent hover:underline">
          ← Back to Academy Hub
        </Link>
        <span>/</span>
        <span className="text-ink font-bold">{track.slug}</span>
      </div>

      {/* Track Header */}
      <div className="p-6 sm:p-8 rounded-2xl bg-surface border border-border space-y-3">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{track.icon}</span>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black font-inktrap text-ink">
              {track.title[langKey] || track.title.en}
            </h1>
            <p className="text-xs sm:text-sm text-ink-muted mt-1">
              {track.description[langKey] || track.description.en}
            </p>
          </div>
        </div>
      </div>

      {/* Lessons List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold font-inktrap text-ink">Lessons in this Track ({lessons.length})</h2>
        <div className="grid grid-cols-1 gap-4">
          {lessons.map((lesson, index) => (
            <Card key={lesson.id} className="hover:border-accent/50 transition-all group">
              <CardHeader className="py-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-accent">
                        {index + 1}. {lesson.level}
                      </span>
                      <Chip>{lesson.estimatedMinutes} min</Chip>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-ink group-hover:text-accent transition-colors">
                      {lesson.title[langKey] || lesson.title.en}
                    </h3>
                    <p className="text-xs text-ink-muted leading-relaxed">
                      {lesson.description[langKey] || lesson.description.en}
                    </p>
                  </div>
                  <Link href={`/learn/${track.slug}/${lesson.slug}`} className="shrink-0">
                    <Button variant="secondary" size="sm">
                      Start Lesson →
                    </Button>
                  </Link>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
