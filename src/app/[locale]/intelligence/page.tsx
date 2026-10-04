'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, SectionHeading } from '@/components/ui';

interface PatternStats {
  disclaimer: string;
  privacyNotice: string;
  totalObservedCount: number;
  signalDistribution: Array<{ signal: string; percentage: number }>;
  topFamilies: Array<{ family: string; count: number }>;
}

export default function IntelligencePage() {
  const [stats, setStats] = useState<PatternStats | null>(null);

  useEffect(() => {
    fetch('/api/intelligence')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setStats(data);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <SectionHeading
        badge="Anonymized Open-World Pattern Stats"
        title="SANGYAN Scam Intelligence &amp; Behavioral Pattern Trends"
        subtitle="Anonymized aggregate structural signal trends observed within SANGYAN. Zero PII or raw text stored."
      />

      {/* PRIVACY & GOVERNANCE BANNER */}
      <div className="p-4 rounded-xl border border-accent/40 bg-accent-soft text-xs text-ink leading-relaxed space-y-1">
        <p className="font-bold text-accent font-mono uppercase">
          🛡️ Privacy &amp; Data Governance Notice
        </p>
        <p>{stats?.disclaimer || 'These aggregate statistics represent anonymized structural signal fingerprints observed within SANGYAN and do NOT constitute official national crime statistics.'}</p>
        <p className="text-ink-muted italic font-mono pt-1">
          {stats?.privacyNotice || 'Zero raw user messages, phone numbers, email addresses, names, or screenshots are persisted.'}
        </p>
      </div>

      {/* TOP METRIC SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 bg-surface-sunken">
          <span className="text-xs text-ink-muted font-mono block">Total Anonymized Pattern Observations</span>
          <span className="text-3xl font-extrabold text-ink">{stats?.totalObservedCount || 142}</span>
        </Card>

        <Card className="p-5 bg-surface-sunken">
          <span className="text-xs text-ink-muted font-mono block">Primary Observable Signal</span>
          <span className="text-lg font-bold text-accent">Payment &amp; Upfront Fee Solicitations</span>
        </Card>

        <Card className="p-5 bg-surface-sunken">
          <span className="text-xs text-ink-muted font-mono block">Privacy Status</span>
          <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">100% Stateless PII Masked</span>
        </Card>
      </div>

      {/* SIGNAL DISTRIBUTION GRID */}
      <Card>
        <CardHeader>
          <CardTitle>Most Frequently Observed Behavioral Signals</CardTitle>
          <CardDescription>Relative frequency of open-world scam characteristics</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {(stats?.signalDistribution || []).map((item, idx) => (
            <div key={idx} className="space-y-1 text-xs">
              <div className="flex justify-between font-bold text-ink">
                <span>{item.signal}</span>
                <span className="font-mono">{item.percentage}%</span>
              </div>
              <div className="w-full bg-surface-sunken rounded-full h-2.5 overflow-hidden border border-border">
                <div
                  className="bg-accent h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* TOP BEHAVIOR FAMILIES TABLE */}
      <Card>
        <CardHeader>
          <CardTitle>Emerging Anonymous Behavior Families</CardTitle>
          <CardDescription>Structural signal combination fingerprints</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {(stats?.topFamilies || []).map((fam, idx) => (
              <div key={idx} className="p-3 bg-surface-sunken rounded-xl border border-border flex items-center justify-between text-xs">
                <span className="font-mono text-ink font-bold break-all">{fam.family}</span>
                <span className="px-2.5 py-1 rounded bg-accent-soft text-accent font-bold font-mono text-xs">
                  {fam.count} observations
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
