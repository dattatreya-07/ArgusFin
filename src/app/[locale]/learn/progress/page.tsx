'use client';

import React from 'react';
import { Link } from '@/i18n/routing';
import { progressService } from '@/lib/financeX/academy/progress';
import { Card, CardHeader, CardContent, Button, Chip } from '@/components/ui';

export default function ProgressDashboardPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const langKey = (locale === 'hi' || locale === 'ta' ? locale : 'en') as 'en' | 'hi' | 'ta';
  const summary = progressService.getSummary('guest-user', langKey);

  const hasHistory = summary.completedLessonsCount > 0 || summary.totalQuizzesTaken > 0;

  return (
    <div className="max-w-[1000px] mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <span className="text-xs font-mono font-bold text-accent uppercase">DASHBOARD</span>
          <h1 className="text-2xl sm:text-3xl font-black font-inktrap text-ink">
            My Learning & Resilience Progress
          </h1>
        </div>
        <Link href="/learn">
          <Button variant="secondary" size="sm">
            Back to Academy
          </Button>
        </Link>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="text-center py-4">
          <CardContent className="space-y-1">
            <span className="text-3xl font-black font-mono text-accent">
              {summary.overallCompletionPct}%
            </span>
            <span className="text-xs text-ink-muted block">Overall Completion</span>
          </CardContent>
        </Card>

        <Card className="text-center py-4">
          <CardContent className="space-y-1">
            <span className="text-3xl font-black font-mono text-ink">
              {summary.completedLessonsCount} / {summary.totalLessons}
            </span>
            <span className="text-xs text-ink-muted block">Lessons Completed</span>
          </CardContent>
        </Card>

        <Card className="text-center py-4">
          <CardContent className="space-y-1">
            <span className="text-3xl font-black font-mono text-emerald-400">
              {summary.averageQuizScorePct}%
            </span>
            <span className="text-xs text-ink-muted block">Avg. Quiz Score</span>
          </CardContent>
        </Card>

        <Card className="text-center py-4">
          <CardContent className="space-y-1">
            <span className="text-3xl font-black font-mono text-amber-400">
              {summary.streakDays}🔥
            </span>
            <span className="text-xs text-ink-muted block">Current Streak</span>
          </CardContent>
        </Card>
      </div>

      {/* Actual Zero / Empty State Notice if no history */}
      {!hasHistory && (
        <div className="p-6 rounded-2xl bg-surface-sunken border border-border text-center space-y-3">
          <span className="text-3xl block">🌱</span>
          <h2 className="text-lg font-bold text-ink">No Learning History Yet</h2>
          <p className="text-xs text-ink-muted max-w-md mx-auto">
            You haven&apos;t completed any lessons or quizzes yet. Start your first lesson in Financial Foundations to build your investor resilience.
          </p>
          {summary.recommendedNextLesson && (
            <Link href={`/learn/financial-foundations/${summary.recommendedNextLesson.slug}`}>
              <Button variant="primary" size="md">
                Start Recommended Lesson: {summary.recommendedNextLesson.title[langKey] || summary.recommendedNextLesson.title.en} →
              </Button>
            </Link>
          )}
        </div>
      )}

      {/* Track Completion Breakdown */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold font-inktrap text-ink">Track Progress</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {summary.trackProgress.map((tp) => (
            <Card key={tp.trackId} className="border-border">
              <CardHeader className="py-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-ink">{tp.title}</h3>
                  <span className="text-xs font-mono font-bold text-accent">
                    {tp.completionPct}%
                  </span>
                </div>
                <div className="w-full h-2 bg-surface-sunken rounded-full overflow-hidden mt-2">
                  <div
                    className="h-full bg-accent transition-all duration-300"
                    style={{ width: `${tp.completionPct}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-ink-muted mt-2 font-mono">
                  <span>{tp.completedLessons} of {tp.totalLessons} lessons</span>
                  <Link href={`/learn/${tp.slug}`} className="text-accent hover:underline">
                    View Track →
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
