'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { TRACKS, LESSONS, curriculumService } from '@/lib/financeX/academy/curriculum';
import { aiTutor } from '@/lib/financeX/academy/tutor';
import { progressService } from '@/lib/financeX/academy/progress';
import { MOCK_COURSES } from '@/lib/financeX/fx1/mockData';
import { Card, CardHeader, CardContent, Button, Chip, SectionHeading } from '@/components/ui';

export default function FinanceXAcademyHub({ params: { locale } }: { params: { locale: string } }) {
  const tNav = useTranslations('nav');
  const langKey = (locale === 'hi' || locale === 'ta' ? locale : 'en') as 'en' | 'hi' | 'ta';

  const [tutorQuery, setTutorQuery] = useState('');
  const [tutorResponse, setTutorResponse] = useState<any | null>(null);
  const [isTutorLoading, setIsTutorLoading] = useState(false);

  const summary = progressService.getSummary('guest-user', langKey);

  const handleTutorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tutorQuery.trim()) return;
    setIsTutorLoading(true);
    try {
      const res = await aiTutor.processQuery({
        query: tutorQuery,
        lang: langKey,
      });
      setTutorResponse(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTutorLoading(false);
    }
  };

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-8 space-y-10">
      {/* 1. ACADEMY HERO & TITLE */}
      <div className="relative overflow-hidden rounded-3xl bg-surface border border-border p-6 sm:p-10 shadow-soft space-y-6">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/10 border border-accent/20 rounded-full text-accent font-mono text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            FinanceX Academy · Grounded Financial Literacy
          </div>
          <h1 className="text-3xl sm:text-5xl font-black font-inktrap text-ink tracking-tight">
            Learn Money Skills. Practice Safely. Build Confidence.
          </h1>
          <p className="text-ink-muted text-base sm:text-lg leading-relaxed">
            AI-guided financial education grounded in verified SEBI, RBI, and NSDL benchmarks. Master savings, compounding, mutual funds, scam resilience, and Web3 safety.
          </p>
        </div>

        {/* Action Doors */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <Link
            href="/check"
            className="p-4 rounded-xl border border-accent/40 bg-accent-soft/30 hover:border-accent transition-all flex flex-col justify-between"
          >
            <div>
              <span className="text-xs font-mono font-bold text-accent uppercase">PROTECT (SHIELD)</span>
              <h3 className="text-base font-bold text-ink mt-1">Check an Offer</h3>
              <p className="text-xs text-ink-muted mt-1">Scan suspicious text, links, or screenshots.</p>
            </div>
            <span className="text-xs font-bold text-accent mt-3">Launch ArgusFin Shield →</span>
          </Link>

          <Link
            href="/learn/simulators/sip"
            className="p-4 rounded-xl border border-border bg-surface-sunken hover:border-accent transition-all flex flex-col justify-between"
          >
            <div>
              <span className="text-xs font-mono font-bold text-highlight uppercase">PRACTICE</span>
              <h3 className="text-base font-bold text-ink mt-1">SIP & Compounding Simulators</h3>
              <p className="text-xs text-ink-muted mt-1">Visualize compounding & CAGR realities.</p>
            </div>
            <span className="text-xs font-bold text-ink mt-3">Open Simulators →</span>
          </Link>

          <Link
            href="/learn/progress"
            className="p-4 rounded-xl border border-border bg-surface-sunken hover:border-accent transition-all flex flex-col justify-between"
          >
            <div>
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase">TRACK PROGRESS</span>
              <h3 className="text-base font-bold text-ink mt-1">My Dashboard</h3>
              <p className="text-xs text-ink-muted mt-1">Overall completion: {summary.overallCompletionPct}%</p>
            </div>
            <span className="text-xs font-bold text-ink mt-3">View Progress →</span>
          </Link>
        </div>
      </div>

      {/* 2. FINANCE X AI TUTOR WIDGET */}
      <Card className="border-accent/30 bg-surface-sunken">
        <CardHeader>
          <div className="flex items-center gap-2">
            <span className="text-xl">🤖</span>
            <div>
              <h2 className="text-lg font-bold font-inktrap text-ink">FinanceX AI Tutor</h2>
              <p className="text-xs text-ink-muted">
                Ask any financial literacy question. Grounded strictly in regulatory sources. (No stock tips or buy/sell advice).
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleTutorSubmit} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={tutorQuery}
              onChange={(e) => setTutorQuery(e.target.value)}
              placeholder="e.g. What is compounding? How does inflation affect my savings?"
              className="flex-1 px-4 py-2.5 rounded-lg border border-border bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <Button type="submit" disabled={isTutorLoading} size="md">
              {isTutorLoading ? 'Searching...' : 'Ask Tutor'}
            </Button>
          </form>

          {tutorResponse && (
            <div className="p-4 rounded-xl bg-surface border border-border space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-accent font-bold">
                  MODE: {tutorResponse.mode}
                </span>
                {tutorResponse.verified && (
                  <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
                    Grounded & Verified
                  </span>
                )}
              </div>
              <p className="text-ink leading-relaxed whitespace-pre-line">{tutorResponse.answer}</p>
              {tutorResponse.citations?.length > 0 && (
                <div className="pt-2 border-t border-border text-xs text-ink-muted space-y-1">
                  <span className="font-bold block">Verified Sources:</span>
                  {tutorResponse.citations.map((c: any, i: number) => (
                    <a
                      key={i}
                      href={c.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent hover:underline block"
                    >
                      • {c.title}
                    </a>
                  ))}
                </div>
              )}
              {tutorResponse.shieldRouteRecommended && (
                <div className="mt-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-200 text-xs flex items-center justify-between">
                  <span>This query contains suspicious claim patterns. Scan the full message with ArgusFin Shield.</span>
                  <Link href="/check">
                    <Button size="sm" variant="secondary">Scan on Shield →</Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 3. FOUR LEARNING TRACKS GRID */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <SectionHeading
            badge="Curriculum"
            title="Learning Tracks"
            subtitle="Structured step-by-step tracks covering foundations, investing, scam resilience, and digital assets safety."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {TRACKS.map((track) => (
            <Card key={track.id} className="flex flex-col justify-between hover:border-accent/60 transition-all group">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <span className="text-3xl">{track.icon}</span>
                  <span className="text-xs font-mono text-ink-muted">
                    {track.lessonCount} Lessons
                  </span>
                </div>
                <h3 className="text-xl font-bold font-inktrap text-ink group-hover:text-accent transition-colors mt-2">
                  {track.title[langKey] || track.title.en}
                </h3>
                <p className="text-xs text-ink-muted leading-relaxed mt-1">
                  {track.description[langKey] || track.description.en}
                </p>
              </CardHeader>
              <CardContent className="pt-0">
                <Link href={`/learn/${track.slug}`}>
                  <Button variant="secondary" className="w-full justify-between">
                    <span>Explore Track Lessons</span>
                    <span>→</span>
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 4. FX1 EXTENDED MASTERCLASSES & TOUR */}
      <div className="space-y-6 pt-4 border-t border-border">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent/10 border border-accent/30 text-accent font-mono text-xs font-bold mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              FX1 Curriculum Integration
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-inktrap text-ink tracking-tight">
              FX1 Specialized Financial Masterclasses
            </h2>
            <p className="text-xs sm:text-sm text-ink-muted mt-1">
              Deep-dive interactive courses covering stock market basics, technical analysis, and derivatives.
            </p>
          </div>
          <Link href="/financex">
            <Button variant="primary" size="sm" className="font-extrabold text-accent-ink shadow-soft">
              Watch Boot Tour & Open Arena →
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {MOCK_COURSES.map((course) => (
            <div
              key={course.course_id}
              className="p-5 rounded-2xl border border-border bg-surface-sunken hover:border-accent/60 transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="px-2 py-0.5 rounded bg-surface border border-border text-accent font-bold uppercase">
                    {course.level || 'INTERMEDIATE'}
                  </span>
                  <span className="text-ink-muted">★ {(course.rating ?? 4.8).toFixed(1)}</span>
                </div>
                <h3 className="font-bold text-ink text-base font-inktrap mt-1">
                  {course.course_title}
                </h3>
                <p className="text-xs text-ink-muted line-clamp-2">
                  {course.description}
                </p>
              </div>

              <div className="pt-4 border-t border-border/60 mt-3 flex items-center justify-between">
                <span className="text-xs font-mono text-ink-muted">
                  {course.total_lessons || 10} Lessons · {course.estimated_hours || 8}h
                </span>
                <Link href="/financex">
                  <span className="text-xs font-bold text-accent hover:underline">
                    Explore →
                  </span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
