'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Lang } from '@/lib/types';
import { VoiceInput } from '@/components/VoiceInput';
import { Citation } from '@/lib/rag/types';

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
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSubmit = async (textToQuery?: string) => {
    const q = textToQuery || query;
    if (!q.trim() || loading) return;

    setLoading(true);
    setError(null);
    setAnswer(null);
    setCitations([]);
    stopAudio();

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
    } catch (err) {
      setError('An error occurred while retrieving information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceTranscript = (transcript: string) => {
    setQuery(transcript);
    handleSubmit(transcript);
  };

  const speakText = (text: string) => {
    if (!window.speechSynthesis) return;

    if (isSpeaking) {
      stopAudio();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = currentLang === 'hi' ? 'hi-IN' : currentLang === 'ta' ? 'ta-IN' : 'en-IN';
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const stopAudio = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* Header */}
      <div className="space-y-2 text-center md:text-left">
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <span className="p-2 bg-emerald-950 border border-emerald-800 text-emerald-400 rounded-xl text-xl">
            🏛️
          </span>
          {t('title')}
        </h1>
        <p className="text-zinc-400 text-base max-w-2xl">{t('subtitle')}</p>
      </div>

      {/* Suggested Queries */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
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
              className="text-xs px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 hover:border-emerald-700 hover:text-white transition-all text-left"
            >
              {sug}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input Box */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 shadow-xl backdrop-blur space-y-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder={t('inputPlaceholder')}
            className="flex-1 bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-zinc-600"
          />
          <VoiceInput onTranscript={handleVoiceTranscript} lang={currentLang} disabled={loading} />
          <button
            type="button"
            onClick={() => handleSubmit()}
            disabled={loading || !query.trim()}
            className="px-5 py-3 rounded-xl font-semibold text-sm bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer shadow-lg shadow-emerald-950"
          >
            {loading ? '...' : t('askBtn')}
          </button>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-sm">
          {error}
        </div>
      )}

      {/* Answer & Citations Card */}
      {answer && (
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-4">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                  verified
                    ? 'bg-emerald-950 border border-emerald-800 text-emerald-300'
                    : 'bg-zinc-800 border border-zinc-700 text-zinc-400'
                }`}
              >
                {verified ? '✓ ' + t('verifiedBadge') : '⚠ ' + t('unverifiedBadge')}
              </span>
              {confidence !== null && confidence > 0 && (
                <span className="text-xs text-zinc-500">
                  Confidence: {Math.round(confidence * 100)}%
                </span>
              )}
            </div>

            {/* Read Aloud Button */}
            <button
              type="button"
              onClick={() => speakText(answer)}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-zinc-800 border border-zinc-700 text-zinc-200 hover:bg-zinc-700 rounded-lg transition-all cursor-pointer"
            >
              <span>{isSpeaking ? '⏹' : '🔊'}</span>
              <span>{isSpeaking ? t('stopReading') : t('readAloud')}</span>
            </button>
          </div>

          {/* Answer Body */}
          <div className="text-zinc-200 text-sm md:text-base leading-relaxed whitespace-pre-line">
            {answer}
          </div>

          {/* Source Citations */}
          {citations.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-zinc-800">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                {t('citationsTitle')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {citations.map((c, idx) => (
                  <a
                    key={idx}
                    href={c.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col p-3 rounded-xl bg-zinc-950/70 border border-zinc-800 hover:border-emerald-700/60 transition-all group"
                  >
                    <span className="text-xs font-semibold text-emerald-400 group-hover:underline line-clamp-1">
                      {c.title}
                    </span>
                    <span className="text-xs text-zinc-400 mt-1">{c.publisher}</span>
                    <span className="text-[10px] text-zinc-600 mt-2">
                      Verified as of: {c.verifiedAt} ↗
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
