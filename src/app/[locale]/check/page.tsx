'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { maskPII, MaskResult } from '@/lib/mask';
import { Archetype, Lang, RiskBand } from '@/lib/types';
import { RuleResult } from '@/lib/rules';
import { Link } from '@/i18n/routing';
import { VoiceInput } from '@/components/VoiceInput';

interface CheckApiResponse {
  band: RiskBand;
  archetype: { top: Archetype; prob: number };
  confidence: number;
  flags: RuleResult[];
  signals: Array<{ id: string; label: string; value: string }>;
  unverified: string[];
  explanation: string;
  citations: Array<{ title: string; url: string }>;
  nextSteps: Array<{ id: string; label: string; url: string }>;
  engine: 'jev' | 'llm-fallback' | 'rules-only';
}

export default function CheckPage() {
  const t = useTranslations('placeholders');
  const tResults = useTranslations('results');
  const tRules = useTranslations('rules');
  const tCommon = useTranslations('common');
  const locale = useLocale();

  const [rawInput, setRawInput] = useState('');
  const [maskedPreview, setMaskedPreview] = useState<MaskResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CheckApiResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleInputChange = (text: string) => {
    setRawInput(text);
    if (text.trim().length > 0) {
      setMaskedPreview(maskPII(text));
    } else {
      setMaskedPreview(null);
    }
  };

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawInput.trim()) return;

    setErrorMsg(null);
    setIsLoading(true);

    // Ensure client-side masking is executed before payload creation
    const clientMasked = maskPII(rawInput);
    setMaskedPreview(clientMasked);

    try {
      const response = await fetch('/api/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maskedText: clientMasked.masked,
          lang: locale,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error?.message || 'Check request failed');
      }

      const data: CheckApiResponse = await response.json();
      setResult(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to scan offer.';
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  const getBandBadge = (band: RiskBand) => {
    switch (band) {
      case 'HIGH':
        return {
          label: tResults('band_HIGH'),
          icon: '🚨',
          badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
          bgCard: 'border-rose-300 bg-rose-50/40',
        };
      case 'MEDIUM':
        return {
          label: tResults('band_MEDIUM'),
          icon: '⚠️',
          badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
          bgCard: 'border-amber-300 bg-amber-50/40',
        };
      case 'LOW_SIGNALS':
        return {
          label: tResults('band_LOW_SIGNALS'),
          icon: '🛡️',
          badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          bgCard: 'border-emerald-300 bg-emerald-50/40',
        };
      case 'CANNOT_VERIFY':
      default:
        return {
          label: tResults('band_CANNOT_VERIFY'),
          icon: '❓',
          badgeClass: 'bg-slate-100 text-slate-800 border-slate-300',
          bgCard: 'border-slate-300 bg-slate-50/40',
        };
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {t('checkTitle')}
        </h1>
        <p className="mt-1 text-sm text-slate-600">{t('checkDesc')}</p>
      </div>

      {/* Input Form */}
      <form onSubmit={handleScan} className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-slate-700">
              Paste suspicious message, WhatsApp forward, or offer text:
            </label>
            <VoiceInput
              onTranscript={(txt) => handleInputChange(`${rawInput} ${txt}`)}
              lang={locale as Lang}
              disabled={isLoading}
            />
          </div>
          <textarea
            rows={5}
            maxLength={4000}
            value={rawInput}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="e.g. Double your money in 30 days! Guaranteed 2x returns, limited slots. Join our VIP Telegram channel..."
            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            required
          />
          <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1">
            <span>Client-side PII masking active. Never send raw phone numbers or bank accounts.</span>
            <span>{rawInput.length}/4000</span>
          </div>
        </div>

        {/* Client-side Masked Preview */}
        {maskedPreview && (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
              <span>🔒 Masked Data Sent to Server:</span>
              <span className="text-emerald-700">
                {maskedPreview.counts.phone +
                  maskedPreview.counts.upi +
                  maskedPreview.counts.email +
                  maskedPreview.counts.pan +
                  maskedPreview.counts.accountOrId >
                0
                  ? `Masked: ${maskedPreview.counts.phone} phones, ${maskedPreview.counts.upi} UPI, ${maskedPreview.counts.accountOrId} IDs`
                  : 'No personal identifiers detected'}
              </span>
            </div>
            <p className="font-mono text-slate-700 bg-white p-2 rounded border border-slate-200 break-words">
              {maskedPreview.masked}
            </p>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-md">
            {errorMsg}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !rawInput.trim()}
          className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-medium text-sm rounded-md transition shadow-sm"
        >
          {isLoading ? 'Scanning Offer...' : 'Scan for Red Flags'}
        </button>
      </form>

      {/* Result Card (FSD M3) */}
      {result && (
        <div className={`p-6 rounded-xl border shadow-sm space-y-6 bg-white ${getBandBadge(result.band).bgCard}`}>
          {/* Limited Mode Banner if rules-only */}
          {result.engine === 'rules-only' && (
            <div className="p-2.5 bg-slate-100 border border-slate-300 rounded text-xs text-slate-700 font-medium">
              ℹ️ {tResults('limitedModeBanner')}
            </div>
          )}

          {/* Risk Band Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-4 gap-2">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Offer Assessment
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl">{getBandBadge(result.band).icon}</span>
                <span className="text-lg font-extrabold text-slate-900">
                  {getBandBadge(result.band).label}
                </span>
              </div>
            </div>
            <div className="text-xs text-slate-600 bg-white/80 px-3 py-1.5 rounded-lg border border-slate-200">
              <span className="font-semibold">{tResults('archetypeLikely')}</span>{' '}
              <span className="font-bold text-slate-900">{result.archetype.top}</span>{' '}
              <span className="text-slate-500">
                ({Math.round(result.archetype.prob * 100)}%)
              </span>
            </div>
          </div>

          {/* Red Flags List */}
          {result.flags.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900">
                🚩 {tResults('redFlagsTitle')} ({result.flags.length})
              </h3>
              <div className="space-y-2">
                {result.flags.map((flag) => {
                  const ruleKey = flag.ruleId as keyof typeof tRules;
                  const reason = tRules(ruleKey) || flag.reasonKey;
                  return (
                    <div
                      key={flag.ruleId}
                      className="p-3 bg-white/90 border border-slate-200 rounded-lg text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between font-bold text-slate-800">
                        <span>{flag.ruleId}</span>
                        <span className="text-[10px] uppercase font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          {flag.severity}
                        </span>
                      </div>
                      <p className="text-slate-600">{reason}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        {/* Verified Technical Signals (Phase 2) */}
        {result.signals && result.signals.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900">
              ⚡ {tResults('signalsTitle')} ({result.signals.length})
            </h3>
            <div className="space-y-2">
              {result.signals.map((sig, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg text-xs space-y-1"
                >
                  <div className="flex items-center justify-between font-bold text-blue-950">
                    <span>{sig.label}</span>
                    <span className="text-[10px] uppercase font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded border border-blue-300">
                      Signal
                    </span>
                  </div>
                  <p className="text-slate-700">{sig.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Explanation */}
        <div className="p-4 bg-slate-50/80 rounded-lg border border-slate-200 text-xs text-slate-700 space-y-2">
          <p className="font-semibold text-slate-900">Analysis Summary:</p>
          <p className="whitespace-pre-line">{result.explanation}</p>
        </div>

          {/* Could Not Verify Section */}
          <div className="space-y-2 pt-2 border-t border-slate-200/80">
            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wide">
              {tResults('couldNotVerifyTitle')}:
            </h4>
            <ul className="list-disc list-inside text-xs text-slate-500 space-y-1">
              {result.unverified.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>

          {/* Next Steps Actions */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              {tResults('nextSteps')}
            </h4>
            <div className="flex flex-col sm:flex-row gap-3">
              {result.nextSteps.map((step) => (
                <Link
                  key={step.id}
                  href={step.url}
                  className={`px-4 py-2.5 rounded-lg text-xs font-bold text-center transition shadow-sm ${
                    step.id === 'calculator'
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  {step.label} →
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Privacy & Disclaimers */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500 space-y-2">
        <p className="font-bold text-slate-700">🔒 Privacy Notice (G6):</p>
        <p>{tCommon('privacyNotice')}</p>
        <p className="font-bold text-slate-700 pt-1">⚖️ Disclaimer (G3):</p>
        <p>{tCommon('disclaimer')}</p>
      </div>
    </div>
  );
}
