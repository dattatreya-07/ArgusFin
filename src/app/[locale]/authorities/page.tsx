'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Lang } from '@/lib/types';

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
    { key: 'money_lost_recent', label: t('opt2'), badge: 'Golden Hour' },
    { key: 'offer_only', label: t('opt1'), badge: 'Preventive' },
    { key: 'unregistered_adviser', label: t('opt3'), badge: 'Regulatory' },
    { key: 'social_media_fraud', label: t('opt4'), badge: 'Telecom/Cyber' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* Header */}
      <div className="space-y-2 text-center md:text-left">
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <span className="p-2 bg-blue-950 border border-blue-800 text-blue-400 rounded-xl text-xl">
            🛡️
          </span>
          {t('title')}
        </h1>
        <p className="text-zinc-400 text-base max-w-2xl">{t('subtitle')}</p>
      </div>

      {/* Situation Selector */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
        <label className="block text-sm font-semibold text-zinc-300">
          {t('situationPrompt')}
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {situations.map((sit) => {
            const isSelected = selectedSituation === sit.key;
            return (
              <button
                key={sit.key}
                type="button"
                onClick={() => setSelectedSituation(sit.key)}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                  isSelected
                    ? 'bg-blue-950/70 border-blue-500 text-white shadow-lg ring-1 ring-blue-500'
                    : 'bg-zinc-950/60 border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-400">
                    {sit.badge}
                  </span>
                  {isSelected && <span className="text-blue-400 text-xs">● Active</span>}
                </div>
                <span className="text-sm font-medium">{sit.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Rationale explanation banner */}
      {reasons.length > 0 && (
        <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-800/80 text-blue-200 text-xs space-y-1">
          <span className="font-bold flex items-center gap-1.5">
            <span>ℹ️</span> Routing Rationale:
          </span>
          <ul className="list-disc list-inside space-y-0.5 text-blue-300">
            {reasons.map((r, idx) => (
              <li key={idx}>{r}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Authorities List */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">
          {t('recommendedAuthorities')}
        </h2>

        {loading ? (
          <div className="p-8 text-center text-zinc-500 text-sm">Loading authorities...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {authorities.map((auth) => (
              <div
                key={auth.id}
                className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white">{auth.name}</h3>
                    {auth.isEmergency && (
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-rose-950 text-rose-300 border border-rose-800 rounded-md">
                        Priority First Response
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">{auth.scope}</p>

                  {auth.reason && (
                    <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-300 space-y-1">
                      <span className="font-semibold text-zinc-400 block">Why this resource:</span>
                      <p className="text-zinc-300">{auth.reason}</p>
                      {auth.actionGuidance && (
                        <p className="text-emerald-400 pt-1 font-medium">{auth.actionGuidance}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Channels */}
                <div className="space-y-2 pt-3 border-t border-zinc-800/80">
                  {auth.channels.map((ch, idx) => {
                    // Hard Rule 8: If unverified, hide number and show portal note only
                    const isVerified = ch.verified_at !== null && ch.value.length > 0;

                    if (ch.type === 'phone') {
                      return (
                        <div key={idx} className="flex items-center justify-between gap-2">
                          <span className="text-xs text-zinc-400">Emergency Helpline:</span>
                          {isVerified ? (
                            <a
                              href={`tel:${ch.value}`}
                              className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-bold text-sm hover:bg-rose-500 transition-all cursor-pointer shadow-md"
                            >
                              📞 {ch.value} ({t('callNow')})
                            </a>
                          ) : (
                            <span className="text-xs text-zinc-500 italic">
                              Check back of bank card
                            </span>
                          )}
                        </div>
                      );
                    }

                    if (ch.type === 'url') {
                      return (
                        <div key={idx} className="flex items-center justify-between gap-2">
                          <span className="text-xs text-zinc-400">Official Portal:</span>
                          {isVerified ? (
                            <a
                              href={ch.value}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-semibold text-xs hover:bg-blue-500 transition-all cursor-pointer"
                            >
                              🌐 {t('visitPortal')} ↗
                            </a>
                          ) : (
                            <span className="text-xs text-zinc-500 italic">Official Portal</span>
                          )}
                        </div>
                      );
                    }

                    return null;
                  })}
                </div>

                {auth.verified_at && (
                  <span className="text-[10px] text-zinc-600">
                    Source verified as of: {auth.verified_at}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Checklist box */}
      <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-400 space-y-2">
        <h3 className="font-bold text-zinc-300 uppercase tracking-wider">
          {t('checklistTitle')}
        </h3>
        <ul className="list-disc list-inside space-y-1 text-zinc-400">
          <li>Transaction UTR / UPI Reference Number (12 digits)</li>
          <li>Beneficiary account number, phone number, or UPI VPA</li>
          <li>Date, exact time, and debit account details</li>
          <li>Screenshots of chat conversations, fake portal URLs, and app download links</li>
        </ul>
      </div>
    </div>
  );
}
