'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Lang } from '@/lib/types';
import { VoiceInput } from '@/components/VoiceInput';
import { SpeakButton } from '@/components/SpeakButton';
import { Citation } from '@/lib/rag/types';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  SourceChip,
  BandBadge,
  Banner,
  SkeletonBlock,
} from '@/components/ui';
import { IconBook, IconQuestion, IconSpeaker } from '@/components/icons';

export default function AskPage() {
  const t = useTranslations('ask');
  const params = useParams();
  const currentLang = (params?.locale as Lang) || 'en';

  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);
  const [verified, setVerified] = useState<boolean | null>(null);
  const [citations, setCitations] = useState<Citation[]>([]);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (textToQuery?: string) => {
    const q = textToQuery || query;
    if (!q.trim() || loading) return;

    setLoading(true);
    setError(null);
    setAnswer(null);
    setCitations([]);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, lang: currentLang }),
      });

      if (!res.ok) {
        throw new Error('Failed to fetch response');
      }

      const data = await res.json();
      setAnswer(data.answer);
      setVerified(data.verified);
      setCitations(data.citations || []);
      setConfidence(data.confidence);
    } catch {
      setError('An error occurred while retrieving information. Please try again or test the calculator.');
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceTranscript = (transcript: string) => {
    setQuery(transcript);
    handleSubmit(transcript);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-ink tracking-tight">
          {t('title')}
        </h1>
        <p className="text-base text-ink-muted max-w-2xl">{t('subtitle')}</p>
      </div>

      {/* Suggested Questions */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
          {t('suggestedTitle')}
        </p>
        <div className="flex flex-wrap gap-2">
          {[t('q1'), t('q2'), t('q3')].map((sug, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setQuery(sug);
                handleSubmit(sug);
              }}
              className="text-xs px-3.5 py-2 rounded-pill bg-surface border border-border text-ink hover:border-accent hover:text-accent transition text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {sug}
            </button>
          ))}
        </div>
      </div>

      {/* Question Input Card */}
      <Card>
        <CardContent className="pt-6 space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder={t('inputPlaceholder')}
              className="flex-1 px-4 py-3 border border-border bg-surface rounded-md focus:outline-none focus:ring-2 focus:ring-accent text-base text-ink placeholder:text-ink-muted/60"
            />
            <div className="flex items-center gap-2 self-end sm:self-center">
              <VoiceInput onTranscript={handleVoiceTranscript} lang={currentLang} disabled={loading} />
              <Button
                variant="primary"
                size="md"
                onClick={() => handleSubmit()}
                disabled={loading || !query.trim()}
                loading={loading}
              >
                {t('askBtn')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading Skeleton */}
      {loading && (
        <Card className="p-6 space-y-4 animate-pulse">
          <SkeletonBlock height="h-6" width="w-48" rounded="pill" />
          <SkeletonBlock height="h-4" width="w-full" />
          <SkeletonBlock height="h-4" width="w-5/6" />
          <SkeletonBlock height="h-4" width="w-2/3" />
        </Card>
      )}

      {/* Error Banner */}
      {error && (
        <Banner
          variant="warning"
          title="Service Notice"
          description={error}
        />
      )}

      {/* Answer & Citations Card */}
      {answer && !loading && (
        <Card className="border-border shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between gap-3 border-b border-border pb-4">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-pill text-xs font-semibold ${
                  verified
                    ? 'bg-surface-sunken border border-border text-accent'
                    : 'bg-risk-unverified-bg border border-risk-unverified-border text-risk-unverified-text'
                }`}
              >
                {verified ? '✓ ' + t('verifiedBadge') : 'ℹ ' + t('unverifiedBadge')}
              </span>
              {confidence !== null && confidence > 0 && (
                <span className="text-xs text-ink-muted">
                  Confidence: {Math.round(confidence * 100)}%
                </span>
              )}
            </div>

            <SpeakButton
              text={answer}
              lang={currentLang}
              speakLabel={t('readAloud')}
              stopLabel={t('stopReading')}
            />
          </CardHeader>

          <CardContent className="pt-6 space-y-6">
            {/* Answer text */}
            <div className="text-ink text-base leading-relaxed whitespace-pre-line">
              {answer}
            </div>

            {/* Citations List */}
            {citations.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-border">
                <h3 className="text-xs font-bold text-ink uppercase tracking-wider">
                  {t('citationsTitle')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {citations.map((c, idx) => (
                    <SourceChip
                      key={idx}
                      title={c.title}
                      publisher={c.publisher}
                      date={c.verifiedAt}
                      href={c.sourceUrl}
                    />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
