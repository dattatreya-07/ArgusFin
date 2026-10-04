'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Lang } from '@/lib/types';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  Chip,
  Banner,
  SectionHeading,
} from '@/components/ui';
import {
  IconPhone,
  IconShield,
  IconInfo,
  IconAlertTriangle,
} from '@/components/icons';

interface AuthorityChannel {
  type: string;
  value: string;
  verified_at: string | null;
  notes?: string;
}

interface AuthorityItem {
  id: string;
  name: string;
  scope: string;
  channels: AuthorityChannel[];
  verified_at: string | null;
  source_url: string | null;
  reason?: string;
  actionGuidance?: string;
  isEmergency?: boolean;
}

export default function AuthoritiesPage() {
  const t = useTranslations('authorities');
  const params = useParams();
  const currentLang = (params?.locale as Lang) || 'en';

  const [selectedSituation, setSelectedSituation] = useState('money_lost_recent');
  const [authorities, setAuthorities] = useState<AuthorityItem[]>([]);
  const [reasons, setReasons] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAuthorities() {
      setLoading(true);
      try {
        const res = await fetch(`/api/authorities?situation=${selectedSituation}&lang=${currentLang}`);
        if (res.ok) {
          const data = await res.json();
          setAuthorities(data.authorities || []);
          setReasons(data.reasons || []);
        }
      } catch (err) {
        console.error('Failed to load authorities', err);
      } finally {
        setLoading(false);
      }
    }
    loadAuthorities();
  }, [selectedSituation, currentLang]);

  const situations = [
    { key: 'money_lost_recent', label: t('opt2'), badge: 'Golden Hour (1930)' },
    { key: 'offer_only', label: t('opt1'), badge: 'Preventive Alert' },
    { key: 'unregistered_adviser', label: t('opt3'), badge: 'SEBI / RBI Regulatory' },
    { key: 'social_media_fraud', label: t('opt4'), badge: 'DoT / Telecom / Cyber' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <SectionHeading
          badge="Official Redressal Router"
          title={t('title')}
          subtitle={t('subtitle')}
        />
      </div>

      {/* Situation Selector */}
      <Card>
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-ink">
              {t('situationPrompt')}
            </CardTitle>
            <span className="text-xs text-accent font-mono font-bold">[ Smart Router ]</span>
          </div>
          <CardDescription className="text-xs text-ink-muted">
            Select your scenario to view verified emergency helplines &amp; official grievance portals.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {situations.map((sit) => {
              const isSelected = selectedSituation === sit.key;
              return (
                <button
                  key={sit.key}
                  type="button"
                  onClick={() => setSelectedSituation(sit.key)}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                    isSelected
                      ? 'bg-accent-soft border-accent text-ink shadow-md ring-1 ring-accent font-bold'
                      : 'bg-surface-sunken border-border text-ink-muted hover:border-accent/60 hover:text-ink'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-surface border border-border text-accent font-mono">
                      {sit.badge}
                    </span>
                    {isSelected && (
                      <span className="text-xs font-bold text-accent font-mono">
                        ● Selected
                      </span>
                    )}
                  </div>
                  <span className="text-sm leading-snug">{sit.label}</span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Rationale Explanation Banner */}
      {reasons.length > 0 && (
        <Banner
          variant="info"
          title="Routing Rationale"
          description={
            <ul className="list-disc list-inside space-y-1 pt-1 font-mono text-xs">
              {reasons.map((r, idx) => (
                <li key={idx}>{r}</li>
              ))}
            </ul>
          }
        />
      )}

      {/* Authorities Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-ink font-mono">
            {t('recommendedAuthorities')} ({authorities.length})
          </h2>
          <span className="text-[11px] text-ink-muted font-mono">
            Source: data/authorities.json
          </span>
        </div>

        {loading ? (
          <Card className="p-8 text-center text-ink-muted text-sm font-mono animate-pulse">
            Loading verified authorities...
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {authorities.map((auth) => (
              <Card key={auth.id} className="border-border hover:border-accent transition-all flex flex-col justify-between">
                <CardHeader className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base font-bold text-ink">{auth.name}</CardTitle>
                    {auth.isEmergency && (
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-risk-high-bg text-risk-high-text border border-risk-high-border/30 rounded font-mono shrink-0">
                        Priority 1930
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-ink-muted leading-relaxed">{auth.scope}</p>

                  {auth.reason && (
                    <div className="p-3 rounded-lg bg-surface-sunken border border-border text-xs space-y-1">
                      <span className="font-bold text-ink block font-mono text-[11px]">Why this authority:</span>
                      <p className="text-ink-muted">{auth.reason}</p>
                      {auth.actionGuidance && (
                        <p className="text-accent font-bold pt-1">{auth.actionGuidance}</p>
                      )}
                    </div>
                  )}
                </CardHeader>

                <CardContent className="space-y-3 pt-3 border-t border-border">
                  {auth.channels.map((ch, idx) => {
                    // Hard Rule 8: If unverified, hide number and show portal note only
                    const isVerified = ch.verified_at !== null && ch.value.length > 0;

                    if (ch.type === 'phone') {
                      return (
                        <div key={idx} className="flex items-center justify-between gap-2">
                          <span className="text-xs text-ink-muted font-medium">Helpline:</span>
                          {isVerified ? (
                            <a
                              href={`tel:${ch.value}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-accent-ink font-bold text-xs hover:scale-105 transition-all shadow-sm"
                            >
                              <IconPhone className="w-3.5 h-3.5" />
                              {ch.value} ({t('callNow')})
                            </a>
                          ) : (
                            <span className="text-xs text-ink-muted italic">
                              Check back of bank card
                            </span>
                          )}
                        </div>
                      );
                    }

                    if (ch.type === 'url') {
                      return (
                        <div key={idx} className="flex items-center justify-between gap-2">
                          <span className="text-xs text-ink-muted font-medium">Official Portal:</span>
                          {isVerified ? (
                            <a
                              href={ch.value}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-sunken border border-border text-ink hover:border-accent font-bold text-xs transition-all"
                            >
                              🌐 {t('visitPortal')} ↗
                            </a>
                          ) : (
                            <span className="text-xs text-ink-muted italic">Official Portal</span>
                          )}
                        </div>
                      );
                    }

                    return null;
                  })}
                </CardContent>

                {auth.verified_at && (
                  <CardFooter className="bg-surface-sunken border-t border-border py-2 text-[10px] text-ink-muted font-mono">
                    Source verified as of: {auth.verified_at}
                  </CardFooter>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Evidence Preparation Checklist Box */}
      <Card className="border-border bg-surface-sunken">
        <CardHeader className="space-y-2">
          <CardTitle className="text-sm font-bold text-ink uppercase tracking-wider font-mono flex items-center gap-2">
            <span>📋</span> {t('checklistTitle')}
          </CardTitle>
          <CardDescription className="text-xs text-ink-muted">
            Have these 4 pieces of details ready before lodging a complaint with 1930 or SEBI SCORES:
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-ink-muted">
            <li className="p-2.5 rounded bg-surface border border-border flex items-center gap-2">
              <span className="text-accent font-bold">✓</span>
              <span>Transaction UTR / UPI Ref Number (12 digits)</span>
            </li>
            <li className="p-2.5 rounded bg-surface border border-border flex items-center gap-2">
              <span className="text-accent font-bold">✓</span>
              <span>Beneficiary Bank Account, Phone, or UPI VPA</span>
            </li>
            <li className="p-2.5 rounded bg-surface border border-border flex items-center gap-2">
              <span className="text-accent font-bold">✓</span>
              <span>Date, Exact Timestamp &amp; Debit Bank Details</span>
            </li>
            <li className="p-2.5 rounded bg-surface border border-border flex items-center gap-2">
              <span className="text-accent font-bold">✓</span>
              <span>Screenshots of Chat History, Fake Portals &amp; Apps</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
