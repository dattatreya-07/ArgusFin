'use client';

import React, { useState, useEffect } from 'react';
import { Link } from '@/i18n/routing';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Stepper } from '@/components/ui';
import { progressService, UserLessonProgress } from '@/lib/financeX/academy/progress';
import { walletService, WalletState } from '@/lib/financeX/prove/walletService';
import { getRecommendations, RecommendationResult } from '@/lib/financeX/journey';

export default function UnifiedDashboardPage() {
  const [wallet, setWallet] = useState<WalletState>(walletService.getState());
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationResult>({});

  useEffect(() => {
    const unsub = walletService.listen((w) => setWallet(w));
    return () => unsub();
  }, []);

  useEffect(() => {
    // Retrieve real completed progress state
    const userProgress = progressService.getProgress('guest-user');
    const completed = Object.values(userProgress)
      .filter((p: UserLessonProgress) => p.status === 'COMPLETED')
      .map((p: UserLessonProgress) => p.lessonId);

    setCompletedLessons(completed);

    const recs = getRecommendations({
      completedLessons: completed,
      currentTrack: 'financial-foundations',
    });
    setRecommendations(recs);
  }, []);

  const totalLessons = 26;
  const completedCount = completedLessons.length;
  const progressPct = Math.round((completedCount / totalLessons) * 100);

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-mono font-bold border border-accent/20 mb-2">
            <span>YOUR UNIFIED FINANCEX JOURNEY</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-ink font-inktrap tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm sm:text-base text-ink-muted">
            Overview of your learning progress, protection checks, and verifiable Web3 trust proofs.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/check">
            <Button variant="primary" size="md">
              Protect (Check Scam)
            </Button>
          </Link>
          <Link href="/learn">
            <Button variant="secondary" size="md">
              Learn (Academy)
            </Button>
          </Link>
        </div>
      </div>

      {/* Progress Cards Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Learning Progress */}
        <Card className="bg-surface">
          <CardContent className="p-5 space-y-2">
            <span className="text-xs font-bold text-ink-muted uppercase tracking-wider block">Academy Progress</span>
            <div className="text-3xl font-black text-ink font-mono">{progressPct}%</div>
            <p className="text-xs text-ink-muted">{completedCount} of {totalLessons} lessons completed</p>
            <div className="w-full bg-surface-sunken h-2 rounded-full overflow-hidden border border-border mt-2">
              <div
                className="bg-accent h-full transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* 2. Protection Checks */}
        <Card className="bg-surface">
          <CardContent className="p-5 space-y-2">
            <span className="text-xs font-bold text-ink-muted uppercase tracking-wider block">Protection Shield</span>
            <div className="text-3xl font-black text-emerald-400 font-mono">Active</div>
            <p className="text-xs text-ink-muted">ArgusFin engine ready</p>
            <Link href="/check" className="inline-block text-xs text-accent underline font-semibold pt-1">
              Check an offer →
            </Link>
          </CardContent>
        </Card>

        {/* 3. Credentials Earned */}
        <Card className="bg-surface">
          <CardContent className="p-5 space-y-2">
            <span className="text-xs font-bold text-ink-muted uppercase tracking-wider block">Soulbound Credentials</span>
            <div className="text-3xl font-black text-ink font-mono">
              {recommendations.credentialEligibility?.eligible ? '1 Eligible' : '0 Earned'}
            </div>
            <p className="text-xs text-ink-muted">Polygon Amoy Testnet</p>
            <Link href="/prove/credentials" className="inline-block text-xs text-accent underline font-semibold pt-1">
              View Credentials →
            </Link>
          </CardContent>
        </Card>

        {/* 4. Evidence Proofs */}
        <Card className="bg-surface">
          <CardContent className="p-5 space-y-2">
            <span className="text-xs font-bold text-ink-muted uppercase tracking-wider block">Evidence Proofs</span>
            <div className="text-3xl font-black text-ink font-mono">0 Anchored</div>
            <p className="text-xs text-ink-muted">Tamper-evident fingerprints</p>
            <Link href="/prove" className="inline-block text-xs text-accent underline font-semibold pt-1">
              View Evidence →
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recommended Next Steps (Explained Engine Output) */}
      <Card className="border-accent/30 bg-surface">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold text-ink">Recommended Learning &amp; Actions</CardTitle>
              <CardDescription>Deterministic suggestions based on your progress and resilience goals</CardDescription>
            </div>
            <span className="text-[10px] font-mono font-bold bg-accent/10 text-accent px-2.5 py-1 rounded border border-accent/20">
              EXPLAINABLE RULES
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Recommendation 1: Next Lesson */}
            {recommendations.nextLesson && (
              <div className="p-4 bg-surface-sunken rounded-lg border border-border space-y-2 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono text-accent uppercase font-bold tracking-wider block">
                    NEXT ACADEMY LESSON
                  </span>
                  <h4 className="text-sm font-bold text-ink mt-1">{recommendations.nextLesson.title}</h4>
                  <p className="text-xs text-ink-muted mt-1">{recommendations.nextLesson.reason}</p>
                </div>
                <Link href={recommendations.nextLesson.href as any} className="pt-2">
                  <Button variant="primary" size="sm" className="w-full">
                    Start Lesson →
                  </Button>
                </Link>
              </div>
            )}

            {/* Recommendation 2: Resilience Training */}
            {recommendations.resilienceLesson && (
              <div className="p-4 bg-surface-sunken rounded-lg border border-border space-y-2 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold tracking-wider block">
                    RESILIENCE TRAINING
                  </span>
                  <h4 className="text-sm font-bold text-ink mt-1">{recommendations.resilienceLesson.title}</h4>
                  <p className="text-xs text-ink-muted mt-1">{recommendations.resilienceLesson.reason}</p>
                </div>
                <Link href={recommendations.resilienceLesson.href as any} className="pt-2">
                  <Button variant="secondary" size="sm" className="w-full">
                    Learn Resilience →
                  </Button>
                </Link>
              </div>
            )}

            {/* Recommendation 3: Interactive Simulator */}
            {recommendations.simulator && (
              <div className="p-4 bg-surface-sunken rounded-lg border border-border space-y-2 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono text-highlight uppercase font-bold tracking-wider block">
                    PRACTICE SIMULATOR
                  </span>
                  <h4 className="text-sm font-bold text-ink mt-1">{recommendations.simulator.title}</h4>
                  <p className="text-xs text-ink-muted mt-1">{recommendations.simulator.reason}</p>
                </div>
                <Link href={recommendations.simulator.href as any} className="pt-2">
                  <Button variant="secondary" size="sm" className="w-full">
                    Run Simulator →
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Credential Claim Eligibility Banner if ready */}
          {recommendations.credentialEligibility && (
            <div className={`p-4 rounded-lg border ${
              recommendations.credentialEligibility.eligible
                ? 'bg-emerald-500/10 border-emerald-500/30'
                : 'bg-surface-sunken border-border'
            } flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3`}>
              <div className="space-y-0.5 text-xs">
                <span className="font-bold text-ink block text-sm">
                  {recommendations.credentialEligibility.eligible
                    ? '🎉 Soulbound Credential Eligibility Unlocked!'
                    : '🎓 Milestone Credential Status'}
                </span>
                <p className="text-ink-muted">{recommendations.credentialEligibility.reason}</p>
              </div>
              <Link href={recommendations.credentialEligibility.claimHref as any}>
                <Button
                  variant={recommendations.credentialEligibility.eligible ? 'primary' : 'secondary'}
                  size="sm"
                >
                  {recommendations.credentialEligibility.eligible ? 'Claim Web3 Credential →' : 'View Track →'}
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
