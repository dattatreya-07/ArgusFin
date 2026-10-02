'use client';

import { useState, useRef } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { maskPII, MaskResult } from '@/lib/mask';
import { Archetype, Lang, RiskBand } from '@/lib/types';
import { RuleResult } from '@/lib/rules';
import { Link } from '@/i18n/routing';
import { VoiceInput } from '@/components/VoiceInput';
import { SpeakButton } from '@/components/SpeakButton';
import { validateEvidenceFile } from '@/lib/evidence/validate';
import { defaultOcrProvider } from '@/lib/evidence/ocr';
import { ClaimSource } from '@/lib/evidence/types';

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
  const [evidenceSource, setEvidenceSource] = useState<ClaimSource>('USER_TEXT');
  const [evidenceFilename, setEvidenceFilename] = useState<string | null>(null);
  const [isProcessingEvidence, setIsProcessingEvidence] = useState(false);
  const [evidenceError, setEvidenceError] = useState<string | null>(null);

  const [maskedPreview, setMaskedPreview] = useState<MaskResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CheckApiResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (text: string, source: ClaimSource = 'USER_TEXT') => {
    setRawInput(text);
    setEvidenceSource(source);
    if (text.trim().length > 0) {
      setMaskedPreview(maskPII(text));
    } else {
      setMaskedPreview(null);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setEvidenceError(null);
    setIsProcessingEvidence(true);

    const validation = validateEvidenceFile('IMAGE', file.type, file.size, file.name);
    if (!validation.valid) {
      setEvidenceError(validation.error?.message || 'Unsupported file format or size.');
      setIsProcessingEvidence(false);
      return;
    }

    setEvidenceFilename(file.name);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;
        // In local/browser processing, invoke OCR extraction abstraction
        const ocrRes = await defaultOcrProvider.processImage(base64Data, locale as Lang);

        if (ocrRes.status === 'FOUND' && ocrRes.text && ocrRes.text.trim().length > 0) {
          handleInputChange(ocrRes.text, 'OCR');
        } else {
          // If no embedded OCR string or binary without client worker:
          // Set placeholder prompt for user verification
          const sampleExtracted = `[Uploaded Image: ${file.name}]\nReview text manually or edit message here.`;
          handleInputChange(sampleExtracted, 'OCR');
        }
        setIsProcessingEvidence(false);
      };
      reader.onerror = () => {
        setEvidenceError('Failed to read image file.');
        setIsProcessingEvidence(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setEvidenceError('Error processing evidence image.');
      setIsProcessingEvidence(false);
    }
  };

  const handleRemoveEvidence = () => {
    setRawInput('');
    setEvidenceFilename(null);
    setEvidenceSource('USER_TEXT');
    setMaskedPreview(null);
    setEvidenceError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
        {/* Upload and Voice Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/png, image/jpeg, image/webp"
              className="hidden"
              id="screenshot-upload"
            />
            <label
              htmlFor="screenshot-upload"
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-700 text-xs font-semibold hover:bg-slate-100 cursor-pointer flex items-center gap-1.5 transition-all shadow-sm"
            >
              📷 Upload Screenshot (OCR)
            </label>
            {evidenceFilename && (
              <span className="text-xs text-blue-600 font-medium flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                <span>📎</span> {evidenceFilename}
                <button
                  type="button"
                  onClick={handleRemoveEvidence}
                  className="text-slate-400 hover:text-rose-600 font-bold ml-1"
                >
                  ✕
                </button>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Voice Input:</span>
            <VoiceInput
              onTranscript={(txt) => handleInputChange(`${rawInput} ${txt}`.trim(), 'STT')}
              lang={locale as Lang}
              disabled={isLoading || isProcessingEvidence}
            />
          </div>
        </div>

        {evidenceError && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
            ⚠️ {evidenceError}
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-slate-700">
              Message text or OCR extracted claims:
            </label>
            {evidenceSource !== 'USER_TEXT' && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                Source: {evidenceSource === 'OCR' ? 'Screenshot OCR' : 'Voice STT'}
              </span>
            )}
          </div>
          <textarea
            rows={5}
            maxLength={4000}
            value={rawInput}
            onChange={(e) => handleInputChange(e.target.value, evidenceSource)}
            placeholder="Double your money in 30 days! Guaranteed 2x returns, limited slots. Join our VIP Telegram channel..."
            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            required
          />
          <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1">
            <span>Client-side privacy masking active. Never send raw phone numbers or bank accounts.</span>
            <span>{rawInput.length}/4000</span>
          </div>
        </div>

        {maskedPreview && (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-md space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Client-Side Masked Preview (Sent to Server)
            </span>
            <p className="text-xs text-slate-700 font-mono break-all">{maskedPreview.masked}</p>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-md">
            {errorMsg}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !rawInput.trim() || isProcessingEvidence}
          className={`w-full py-2.5 px-4 rounded-md font-semibold text-sm text-white transition-colors cursor-pointer ${
            isLoading || isProcessingEvidence
              ? 'bg-blue-300 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isLoading ? 'Scanning Offer...' : isProcessingEvidence ? 'Extracting Text...' : 'Scan for Red Flags'}
        </button>
      </form>

      {/* Result Display */}
      {result && (
        <div className="space-y-6">
          <div className={`p-6 rounded-xl border shadow-sm space-y-4 ${getBandBadge(result.band).bgCard}`}>
            <div className="flex items-center justify-between">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                  getBandBadge(result.band).badgeClass
                }`}
              >
                <span>{getBandBadge(result.band).icon}</span>
                <span>{getBandBadge(result.band).label}</span>
              </span>
              <div className="flex items-center gap-2">
                <SpeakButton
                  text={`${result.explanation} ${result.flags.map(f => f.ruleId).join('. ')}`}
                  lang={locale as Lang}
                />
                <span className="text-xs text-slate-500">
                  Engine: <code className="font-mono bg-white/70 px-1 py-0.5 rounded">{result.engine}</code>
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                {tResults('archetypeLikely')}{' '}
                <span className="text-blue-700">{result.archetype.top.replace(/_/g, ' ')}</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">{result.explanation}</p>
            </div>

            {/* Red Flag Rules */}
            {result.flags.length > 0 && (
              <div className="space-y-2 pt-3 border-t border-slate-200">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  {tResults('redFlagsTitle')} ({result.flags.length})
                </h4>
                <ul className="space-y-1.5">
                  {result.flags.map((flag, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-rose-900">
                      <span className="text-rose-600 font-bold">•</span>
                      <span>
                        <strong className="font-semibold">{flag.ruleId}:</strong> {tRules(flag.ruleId as any)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Technical Signals */}
            {result.signals && result.signals.length > 0 && (
              <div className="space-y-2 pt-3 border-t border-slate-200">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  {tResults('signalsTitle')} ({result.signals.length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {result.signals.map((sig, idx) => (
                    <div key={idx} className="p-2.5 bg-white/80 rounded-lg border border-slate-200 text-xs">
                      <span className="font-bold text-slate-700 block">{sig.label}</span>
                      <span className="text-slate-600 font-mono text-[11px]">{sig.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Unverified Items (Limitation disclosure) */}
            {result.unverified && result.unverified.length > 0 && (
              <div className="space-y-1.5 pt-3 border-t border-slate-200">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  {tResults('couldNotVerifyTitle')}
                </h4>
                <ul className="space-y-1 text-xs text-slate-500 list-disc list-inside">
                  {result.unverified.map((item, idx) => (
                    <li key={idx}>{tResults(item as any)}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Next Steps CTA */}
          <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900">{tResults('nextSteps')}</h3>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/calculator"
                className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
              >
                🧮 {tResults('actionCalculator')}
              </Link>
              <Link
                href="/report"
                className="px-4 py-2 bg-rose-600 text-white text-xs font-semibold rounded-lg hover:bg-rose-500 transition-colors shadow-sm"
              >
                📋 {tResults('actionReport')}
              </Link>
              <Link
                href="/authorities"
                className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-500 transition-colors shadow-sm"
              >
                🛡️ Authority Router
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
