'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { maskPII, MaskResult } from '@/lib/mask';
import { Archetype, Lang, RiskBand } from '@/lib/types';
import { RuleResult } from '@/lib/rules';
import { Link } from '@/i18n/routing';
import { VoiceInput } from '@/components/VoiceInput';
import { SpeakButton } from '@/components/SpeakButton';
import { SpeechControl } from '@/components/SpeechControl';
import { WhatsAppConnectModal } from '@/components/WhatsAppConnectModal';
import { RiskGauge } from '@/components/RiskGauge';
import { validateEvidenceFile } from '@/lib/evidence/validate';
import { defaultOcrProvider } from '@/lib/evidence/ocr';
import { ClaimSource } from '@/lib/evidence/types';
import { getLessonForArchetype } from '@/lib/financeX/academy/shieldLessonMap';
import { RiskAnalysisExplanation } from '@/lib/scam/explanation';
import {
  Button,
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  BandBadge,
  Banner,
  SkeletonBlock,
  Chip,
} from '@/components/ui';
import {
  IconPaste,
  IconCalculator,
  IconPhone,
  IconQuestion,
  IconBook,
} from '@/components/icons';

interface CheckApiResponse {
  band: RiskBand;
  archetype: { top: Archetype; prob: number };
  confidence: number;
  flags: RuleResult[];
  signals: Array<{ id: string; label: string; value: string }>;
  unverified: string[];
  explanation: string;
  structuredExplanation?: RiskAnalysisExplanation;
  citations: Array<{ title: string; url: string }>;
  nextSteps: Array<{ id: string; label: string; url: string }>;
  engine: 'jev' | 'llm-fallback' | 'rules-only';
}

const PRESET_EXAMPLES = [
  {
    id: 'fql-app',
    icon: '💼',
    label: 'Part-time Job / FQL App',
    text: `1. அந்தந்த நாட்டின் பிரத்யேக டொமைன் இணைப்பு: https://fqlexin.com https://fqlin.com\n2. உலாவியைத் திறந்து இணைப்பை ஒட்டவும், FQL அதிகாரப்பூர்வப் பக்கத்திற்குள் நுழையவும். “APP-ஐ பதிவிறக்குக” என்பதைக் கிளிக் செய்யவும்.\n3. உங்கள் மொபைல் சிஸ்டத்தை (ஆண்ட்ராய்டு / ஆப்பிள்) தேர்ந்தெடுத்து பதிவிறக்கம் செய்து நிறுவவும்.`,
  },
  {
    id: 'utility-bill',
    icon: '⚡',
    label: 'Utility Bill Cut',
    text: 'Dear Customer, Your Electricity power line will be disconnected tonight at 9:30 PM due to unpaid bill. Pay ₹450 immediately or call electricity desk at +919876543210.',
  },
  {
    id: 'kbc-lottery',
    icon: '🏆',
    label: 'KBC Lottery Win',
    text: 'Congratulations! You won ₹25,00,000 in KBC All-India Lucky Draw. Transfer ₹12,500 advance processing fee to release prize money immediately.',
  },
  {
    id: 'kyc-block',
    icon: '🏦',
    label: 'Bank KYC Block',
    text: 'Your HDFC Bank account is blocked due to pending KYC update. Click http://hdfc-kyc-update.xyz/login to enter net banking password and OTP to unblock.',
  },
  {
    id: 'daily-yield',
    icon: '📈',
    label: 'Daily 10% Yield',
    text: 'Exclusive VIP Wealth Scheme: Guaranteed 10% daily return on deposit. Transfer ₹10,000 to our registered trading bot account now.',
  },
];

export default function CheckPage() {
  const t = useTranslations('placeholders');
  const tResults = useTranslations('results');
  const tRules = useTranslations('rules');
  const locale = useLocale();

  const [rawInput, setRawInput] = useState('');
  const [evidenceSource, setEvidenceSource] = useState<ClaimSource>('USER_TEXT');
  const [evidenceFilename, setEvidenceFilename] = useState<string | null>(null);
  const [isProcessingEvidence, setIsProcessingEvidence] = useState(false);
  const [evidenceError, setEvidenceError] = useState<string | null>(null);
  const [isFromShareTarget, setIsFromShareTarget] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);

  const [maskedPreview, setMaskedPreview] = useState<MaskResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CheckApiResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Read Share Target query params on initial mount
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const textParam = params.get('text') || '';
      const titleParam = params.get('title') || '';
      const urlParam = params.get('url') || '';

      const combinedText = [textParam, titleParam, urlParam].filter(Boolean).join('\n').trim();

      if (combinedText.length > 0) {
        setIsFromShareTarget(true);
        handleInputChange(combinedText, 'USER_TEXT');
      }
    }
  }, []);

  const handleInputChange = (text: string, source: ClaimSource = 'USER_TEXT') => {
    setRawInput(text);
    setEvidenceSource(source);
    if (text.trim().length > 0) {
      setMaskedPreview(maskPII(text));
    } else {
      setMaskedPreview(null);
    }
  };

  const handleSelectPreset = (presetText: string) => {
    handleInputChange(presetText, 'USER_TEXT');
  };

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        handleInputChange(text, 'USER_TEXT');
      }
    } catch {
      // Clipboard access might be blocked
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
        const ocrRes = await defaultOcrProvider.processImage(base64Data, locale as Lang);

        if (ocrRes.status === 'FOUND' && ocrRes.text && ocrRes.text.trim().length > 0) {
          handleInputChange(ocrRes.text, 'OCR');
        } else {
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

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <WhatsAppConnectModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
      />

      {/* Header with WhatsApp Quick Link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-ink tracking-tight font-inktrap">
            {t('checkTitle')}
          </h1>
          <p className="text-sm sm:text-base text-ink-muted">
            {t('checkDesc')}
          </p>
        </div>

        <button
          onClick={() => setIsWhatsAppModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-xs transition cursor-pointer self-start sm:self-auto"
        >
          <span>💬 Connect on WhatsApp</span>
        </button>
      </div>

      {/* Input Form Card */}
      <Card>
        <form onSubmit={handleScan}>
          <CardContent className="pt-6 space-y-4">
            {/* Action Bar: Paste / OCR Upload / Voice */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border">
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  icon={<IconPaste />}
                  onClick={handlePasteClipboard}
                >
                  Paste
                </Button>

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
                  className="inline-flex items-center justify-center min-h-[48px] px-4 py-2 text-sm font-semibold rounded-pill border border-border bg-surface text-ink hover:bg-surface-sunken cursor-pointer transition focus-within:ring-2 focus-within:ring-accent"
                >
                  📷 Upload Screenshot
                </label>

                {evidenceFilename && (
                  <Chip>
                    <span>📎 {evidenceFilename}</span>
                    <button
                      type="button"
                      onClick={handleRemoveEvidence}
                      className="text-ink-muted hover:text-ink font-bold ml-1"
                      aria-label="Remove uploaded image"
                    >
                      ✕
                    </button>
                  </Chip>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-ink-muted font-medium">Voice:</span>
                <VoiceInput
                  onTranscript={(txt) => handleInputChange(`${rawInput} ${txt}`.trim(), 'STT')}
                  lang={locale as Lang}
                  disabled={isLoading || isProcessingEvidence}
                />
              </div>
            </div>

            {evidenceError && (
              <Banner variant="warning" title="Upload Note" description={evidenceError} />
            )}

            {/* Big Textarea Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="message-input" className="text-xs font-bold uppercase tracking-wider text-ink font-mono">
                  Suspicious Message Box
                </label>
                <div className="flex items-center gap-2">
                  {evidenceSource !== 'USER_TEXT' && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-pill bg-accent-soft text-accent">
                      Source: {evidenceSource === 'OCR' ? 'Screenshot OCR' : 'Voice STT'}
                    </span>
                  )}
                  <span className="text-xs font-mono text-ink-muted">{rawInput.length} characters</span>
                </div>
              </div>

              <textarea
                id="message-input"
                rows={5}
                maxLength={4000}
                value={rawInput}
                onChange={(e) => handleInputChange(e.target.value, evidenceSource)}
                placeholder="Paste any suspicious WhatsApp message, SMS, email text, or investment offer link here..."
                className="w-full px-4 py-3 border border-border bg-surface rounded-xl focus:outline-none focus:ring-2 focus:ring-accent text-base text-ink placeholder:text-ink-muted/50 leading-relaxed resize-y min-h-[140px] font-sans"
                required
              />

              {/* Preset Test Examples Chips */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider block font-mono">
                  Examples to test:
                </span>
                <div className="flex flex-wrap gap-2">
                  {PRESET_EXAMPLES.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectPreset(preset.text)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-surface-sunken hover:bg-surface-elevated text-xs font-semibold text-ink hover:text-accent hover:border-accent/40 transition-all cursor-pointer"
                    >
                      <span>{preset.icon}</span>
                      <span>{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Quiet Masked Preview */}
            {maskedPreview && (
              <div className="p-3 bg-surface-sunken border border-border rounded-xl space-y-1">
                <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider block font-mono">
                  Masked Preview (On-Device Privacy Gate)
                </span>
                <p className="text-xs text-ink font-mono break-all">{maskedPreview.masked}</p>
              </div>
            )}

            {errorMsg && (
              <Banner
                variant="warning"
                title="Could Not Complete Scan"
                description={`${errorMsg}. You can try again or test the figures directly in the calculator.`}
              />
            )}
          </CardContent>

          <CardFooter className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isLoading || isProcessingEvidence}
              disabled={isLoading || !rawInput.trim() || isProcessingEvidence}
              className="w-full sm:w-auto"
            >
              {isLoading
                ? 'Scanning for Scams...'
                : isProcessingEvidence
                ? 'Extracting Text...'
                : 'Scan for Scams'}
            </Button>

            <Link href="/calculator" className="text-xs font-semibold text-accent hover:underline text-center sm:text-right py-2">
              Or test figures in Yield Calculator →
            </Link>
          </CardFooter>
        </form>
      </Card>

      {/* Loading Skeleton */}
      {isLoading && (
        <Card className="space-y-4 p-6 animate-pulse">
          <div className="flex items-center justify-between">
            <SkeletonBlock height="h-8" width="w-48" rounded="pill" />
            <SkeletonBlock height="h-12" width="w-12" rounded="full" />
          </div>
          <SkeletonBlock height="h-4" width="w-3/4" />
          <SkeletonBlock height="h-4" width="w-full" />
          <SkeletonBlock height="h-20" width="w-full" rounded="md" />
        </Card>
      )}

      {/* Results Display Card matching HuggingFace Space Layout */}
      {result && !isLoading && (
        <div className="space-y-6" aria-live="polite">
          {/* Limited Mode Banner if applicable */}
          {result.engine === 'rules-only' && (
            <Banner
              variant="limited"
              title="Limited Mode Active"
              description={tResults('limitedModeBanner')}
            />
          )}

          {/* Main Decision Card */}
          <Card className="border-border shadow-md">
            <CardHeader className="space-y-4 pb-4">
              <div className="flex items-center justify-between flex-wrap gap-4 border-b border-border pb-4">
                <div className="flex items-center gap-3">
                  <BandBadge band={result.band} size="lg" />
                  <span className="text-xs text-ink-muted bg-surface-sunken px-2.5 py-1 rounded-pill border border-border font-mono">
                    Engine: {result.engine}
                  </span>
                  {result.structuredExplanation && (
                    <span className="text-xs font-bold font-mono px-2.5 py-1 rounded-pill bg-surface-elevated text-ink border border-border">
                      Score: {result.structuredExplanation.score}/100
                    </span>
                  )}
                </div>

                {/* Circular Score Gauge & Speech Control */}
                <div className="flex items-center gap-3">
                  <SpeechControl
                    text={`${result.structuredExplanation?.summary || result.explanation}. ${
                      result.structuredExplanation?.detectedSignals?.map((s) => `${s.label}: ${s.explanation}`).join('. ') || ''
                    }`}
                    locale={locale as any}
                    className="p-1.5"
                  />
                  <RiskGauge band={result.band} confidence={result.confidence} size={68} />
                </div>
              </div>

              {/* Analysis Summary */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-base">🎯</span>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-ink font-mono">
                    {tResults('whyFlagged')}
                  </h2>
                </div>
                <p className="text-base sm:text-lg text-ink font-medium leading-relaxed">
                  {result.structuredExplanation?.summary || result.explanation}
                </p>
              </div>
            </CardHeader>

            <CardContent className="space-y-6 border-t border-border pt-6">
              {/* Detected Warning Signs (Itemized with points) */}
              {result.structuredExplanation && result.structuredExplanation.detectedSignals.length > 0 ? (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-ink font-mono flex items-center justify-between border-b border-border pb-1">
                    <span>{tResults('detectedWarningSigns')}</span>
                    <span className="text-[11px] text-ink-muted font-normal">{tResults('deterministicSignals')}</span>
                  </h3>
                  <div className="space-y-2.5">
                    {result.structuredExplanation.detectedSignals.map((sig, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-risk-high-bg/60 border border-risk-high-border/30 text-xs text-ink space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-sm text-risk-high-text flex items-center gap-1.5">
                            <span>🔴</span>
                            <span>{sig.label}</span>
                          </span>
                          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-pill bg-risk-high-text/10 text-risk-high-text border border-risk-high-border/40">
                            +{sig.contribution}
                          </span>
                        </div>
                        {sig.evidence && (
                          <div className="text-xs text-ink-muted font-mono bg-surface/50 p-2 rounded-lg border border-border/40">
                            &ldquo;{sig.evidence}&rdquo;
                          </div>
                        )}
                        <p className="text-xs leading-relaxed text-ink/90">{sig.explanation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : result.flags.length > 0 ? (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-ink font-mono flex items-center gap-1.5 border-b border-border pb-1">
                    <span>{tResults('potentialRiskSignals')}</span>
                  </h3>
                  <div className="space-y-2">
                    {result.flags.map((flag, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-risk-high-bg border border-risk-high-border/30 text-xs text-risk-high-text space-y-1"
                      >
                        <p className="font-bold text-sm">{tResults('potentialRiskSignals')}: {flag.ruleId}</p>
                        <p className="leading-relaxed">{tRules(flag.ruleId as any)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* How The Score Works (Score Calculation Breakdown) */}
              {result.structuredExplanation && (
                <div className="p-4 bg-surface-sunken border border-border rounded-xl space-y-2.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-ink font-mono flex items-center gap-1.5">
                    <span>{tResults('howScoreCalculated')}</span>
                  </h3>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-2.5 bg-surface rounded-lg border border-border">
                      <span className="text-[10px] uppercase font-mono text-ink-muted block">{tResults('baseRisk')}</span>
                      <span className="text-sm font-bold font-mono text-ink">
                        {result.structuredExplanation.calculation.baseScore}
                      </span>
                    </div>
                    <div className="p-2.5 bg-surface rounded-lg border border-border">
                      <span className="text-[10px] uppercase font-mono text-ink-muted block">{tResults('signalsScore')}</span>
                      <span className="text-sm font-bold font-mono text-amber-600 dark:text-amber-400">
                        +{result.structuredExplanation.calculation.contributions.reduce((a, b) => a + b, 0)}
                      </span>
                    </div>
                    <div className="p-2.5 bg-surface rounded-lg border border-border">
                      <span className="text-[10px] uppercase font-mono text-ink-muted block">{tResults('finalScore')}</span>
                      <span className="text-sm font-bold font-mono text-risk-high-text">
                        {result.structuredExplanation.score} / 100
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* What We Observed */}
              {result.signals && result.signals.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-ink font-mono flex items-center gap-1.5 border-b border-border pb-1">
                    <span>{tResults('observedClaims')}</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {result.signals.map((sig, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-surface-sunken rounded-xl border border-border text-xs space-y-1"
                      >
                        <span className="font-bold text-ink block">{tResults('observedClaims')}: {sig.label}</span>
                        <span className="text-ink-muted font-mono text-[11px] block break-all">{sig.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* What We Cannot Verify */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-ink font-mono flex items-center gap-1.5 border-b border-border pb-1">
                  <span>{tResults('whatCannotVerify')}</span>
                </h3>
                <div className="p-3 bg-surface-sunken rounded-xl border border-border text-xs text-ink-muted leading-relaxed">
                  {result.structuredExplanation?.limitations && result.structuredExplanation.limitations.length > 0 ? (
                    <ul className="list-disc pl-5 space-y-1 text-xs text-ink">
                      {result.structuredExplanation.limitations.map((lim, i) => (
                        <li key={i}>{lim}</li>
                      ))}
                    </ul>
                  ) : result.unverified && result.unverified.length > 0 ? (
                    <ul className="list-disc pl-5 space-y-1 text-xs text-ink">
                      {result.unverified.map((unv, i) => (
                        <li key={i}>{unv}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>{tResults('defaultCannotVerify')}</p>
                  )}
                </div>
              </div>

              {/* What You Can Do Now */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-ink font-mono flex items-center gap-1.5 border-b border-border pb-1">
                  <span>{tResults('whatToDoNow')}</span>
                </h3>
                <ul className="space-y-2 text-xs sm:text-sm text-ink leading-relaxed list-disc list-inside">
                  {(result.structuredExplanation?.actionSteps && result.structuredExplanation.actionSteps.length > 0
                    ? result.structuredExplanation.actionSteps
                    : [
                        'Do not send money, OTPs, or passwords to unverified contacts.',
                        'Do not click unverified link extensions or install external APK screen-sharing tools.',
                        'Verify any investment entity directly on official SEBI SCORES or RBI Sachet portals.',
                        'Block the sender and prepare an official incident report for 1930 / cybercrime.gov.in.',
                      ]
                  ).map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ul>
              </div>

              {/* 5. Learn More (Shield → Learn Loop) */}
              <div className="p-4 bg-accent/10 border border-accent/30 rounded-xl space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-accent font-mono">
                  {tResults('learnMoreAcademy')}
                </h3>
                <p className="text-xs text-ink">
                  {tResults('learnMoreDesc')}
                </p>
                <Link
                  href={`/learn/${
                    getLessonForArchetype(result.archetype.top)?.trackId === 'track_resilience'
                      ? 'investor-resilience'
                      : 'investing-basics'
                  }/${getLessonForArchetype(result.archetype.top)?.slug || 'guaranteed-return-claims'}`}
                  className="inline-block"
                >
                  <Button variant="primary" size="sm" icon={<IconBook />}>
                    {tResults('learnWhySuspicious')}
                  </Button>
                </Link>
              </div>

              {/* 6. Prepare Report (Report → Prove Loop) */}
              <div className="p-4 bg-surface-sunken border border-border rounded-xl space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-ink font-mono">
                  {tResults('prepareReportAnchor')}
                </h3>
                <p className="text-xs text-ink-muted">
                  {tResults('prepareReportDesc')}
                </p>
                <Link href="/report" className="inline-block">
                  <Button variant="secondary" size="sm" icon={<IconPhone />}>
                    {tResults('prepareReportBtn')}
                  </Button>
                </Link>
              </div>
            </CardContent>

            {/* Next Steps Footer */}
            <CardFooter className="bg-surface-sunken flex-col items-start gap-4 border-t border-border pt-4 rounded-b-xl">
              <div className="flex flex-wrap items-center justify-between gap-3 w-full">
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                  {result && (
                    <Link
                      href={`/learn/${
                        getLessonForArchetype(result.archetype.top)?.trackId === 'track_resilience'
                          ? 'investor-resilience'
                          : 'investing-basics'
                      }/${getLessonForArchetype(result.archetype.top)?.slug || 'guaranteed-return-claims'}`}
                    >
                      <Button variant="secondary" size="md" icon={<IconBook />}>
                        Learn why this is suspicious →
                      </Button>
                    </Link>
                  )}
                  <Link href="/calculator">
                    <Button variant="secondary" size="md" icon={<IconCalculator />}>
                      {tResults('actionCalculator')}
                    </Button>
                  </Link>
                  <Link href="/report">
                    <Button variant="primary" size="md" icon={<IconPhone />}>
                      {tResults('actionReport')}
                    </Button>
                  </Link>
                  <Link href="/authorities">
                    <Button variant="quiet" size="md" icon={<IconQuestion />}>
                      Authority Router
                    </Button>
                  </Link>
                </div>

                <button
                  onClick={() => setIsWhatsAppModalOpen(true)}
                  className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>💬 Connect on WhatsApp for daily scans →</span>
                </button>
              </div>
            </CardFooter>
          </Card>
        </div>
      )}

    </div>
  );
}


