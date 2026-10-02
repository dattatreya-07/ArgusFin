'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import Link from 'next/link';
import { normalizeChannelInput } from '@/lib/channels/normalize';
import { checkChannelContent } from '@/lib/channels/service';
import { ChannelCheckResult } from '@/lib/channels/types';
import { Lang } from '@/lib/types';

function ShareContentProcessor() {
  const searchParams = useSearchParams();
  const params = useParams();
  const locale = (params?.locale as Lang) || 'en';

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<ChannelCheckResult | null>(null);
  const [rawPreview, setRawPreview] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function processSharedPayload() {
      setLoading(true);
      setError(null);

      const title = searchParams.get('title') || '';
      const text = searchParams.get('text') || '';
      const url = searchParams.get('url') || '';

      if (!title && !text && !url) {
        setLoading(false);
        setError('No content was shared. Please paste or enter text manually to verify.');
        return;
      }

      try {
        const normalized = normalizeChannelInput({
          channel: 'pwa-share',
          title,
          text,
          url,
          language: locale,
        });

        setRawPreview(normalized.normalizedText || normalized.rawText);

        const checkRes = await checkChannelContent(normalized);
        setResult(checkRes);
      } catch (err: any) {
        setError(err.message || 'Failed to analyze shared content.');
      } finally {
        setLoading(false);
      }
    }

    processSharedPayload();
  }, [searchParams, locale]);

  return (
    <>
      {/* Loading State */}
      {loading && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center space-y-3">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-slate-300 font-medium">Screening shared message for red flags...</p>
          <p className="text-xs text-slate-500">Checking deterministic rules, signals, and math</p>
        </div>
      )}

      {/* Error / Empty State */}
      {!loading && error && (
        <div className="bg-amber-950/40 border border-amber-800/50 rounded-xl p-6 text-center space-y-4">
          <span className="text-3xl">⚠️</span>
          <p className="text-amber-200">{error}</p>
          <div>
            <Link
              href={`/${locale}/check`}
              className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition"
            >
              Go to Manual Scam Check
            </Link>
          </div>
        </div>
      )}

      {/* Result State */}
      {!loading && result && (
        <div className="space-y-6">
          {/* Shared Content Provenance Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Received Content (Sanitized on Device)</span>
              <span className="text-emerald-400 font-medium">✓ PII Protected</span>
            </div>
            <p className="text-sm text-slate-200 bg-slate-950 p-3 rounded-lg border border-slate-800/80 font-mono whitespace-pre-wrap">
              {rawPreview}
            </p>
          </div>

          {/* Risk Assessment Banner */}
          <div
            className={`rounded-xl p-5 border ${
              result.band === 'HIGH'
                ? 'bg-rose-950/60 border-rose-700 text-rose-100'
                : result.band === 'MEDIUM'
                ? 'bg-amber-950/60 border-amber-700 text-amber-100'
                : 'bg-emerald-950/50 border-emerald-700 text-emerald-100'
            }`}
          >
            <div className="flex items-start space-x-3">
              <span className="text-2xl">
                {result.band === 'HIGH'
                  ? '🚨'
                  : result.band === 'MEDIUM'
                  ? '⚠️'
                  : 'ℹ️'}
              </span>
              <div>
                <h2 className="text-lg font-bold">
                  {result.band === 'HIGH'
                    ? 'High Risk Detected (Major Red Flags)'
                    : result.band === 'MEDIUM'
                    ? 'Medium Risk (Proceed with Caution)'
                    : 'Low Risk Signals Found (Not a Guarantee)'}
                </h2>
                <p className="text-sm opacity-90 mt-1">{result.explanation}</p>
              </div>
            </div>
          </div>

          {/* Detected Red Flags */}
          {result.flags.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                Triggered Red Flag Rules ({result.flags.length})
              </h3>
              <ul className="space-y-2">
                {result.flags.map((flag, idx) => (
                  <li
                    key={idx}
                    className="flex items-center space-x-2 text-sm bg-slate-950 px-3 py-2 rounded-lg border border-slate-800"
                  >
                    <span className="text-rose-400">🚩</span>
                    <span className="font-medium text-slate-200">{flag.ruleId}</span>
                    <span className="text-xs text-slate-500 uppercase ml-auto">
                      {flag.severity}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Quick Action Directives */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {result.calcUrl && (
              <Link
                href={result.calcUrl}
                className="flex items-center justify-between p-4 rounded-xl bg-blue-950/60 border border-blue-700 hover:bg-blue-900/70 transition"
              >
                <div>
                  <h4 className="text-sm font-semibold text-blue-200">
                    Check Yield Reality Ladder
                  </h4>
                  <p className="text-xs text-blue-300/80 mt-0.5">
                    Verify if promised returns defy economic reality
                  </p>
                </div>
                <span className="text-xl">🔢</span>
              </Link>
            )}

            <Link
              href={`/${locale}/report`}
              className="flex items-center justify-between p-4 rounded-xl bg-indigo-950/60 border border-indigo-700 hover:bg-indigo-900/70 transition"
            >
              <div>
                <h4 className="text-sm font-semibold text-indigo-200">
                  Prepare Incident Report
                </h4>
                <p className="text-xs text-indigo-300/80 mt-0.5">
                  1930 / Cyber Crime pre-filing guide
                </p>
              </div>
              <span className="text-xl">📋</span>
            </Link>
          </div>

          {/* Standard Guardrail Disclaimer */}
          <div className="text-center text-xs text-slate-500 pt-4">
            <p>
              SANGYAN is an educational investor-protection system. It does not provide investment
              advice or label specific companies/individuals as scams.
            </p>
          </div>
        </div>
      )}
    </>
  );
}

export default function PwaShareTargetPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">📲</span>
            <div>
              <h1 className="text-xl font-bold text-white">SANGYAN Share Target</h1>
              <p className="text-xs text-slate-400">
                Shared Content Analysis • Privacy Shield Active
              </p>
            </div>
          </div>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-900/50 text-blue-300 border border-blue-700">
            Android PWA Access
          </span>
        </div>

        <Suspense
          fallback={
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center space-y-3">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
              <p className="text-slate-300 font-medium">Loading share target...</p>
            </div>
          }
        >
          <ShareContentProcessor />
        </Suspense>
      </div>
    </div>
  );
}
