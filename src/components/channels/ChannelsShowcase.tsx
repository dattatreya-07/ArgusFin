'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Lang } from '@/lib/types';

interface ChannelsShowcaseProps {
  locale: Lang;
}

export function ChannelsShowcase({ locale }: ChannelsShowcaseProps) {
  const isTelegramConfigured = Boolean(process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME);
  const telegramBotUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'ArgusFinBot';

  const [activeTestChannel, setActiveTestChannel] = useState<'telegram' | 'whatsapp' | null>(null);
  const [testResult, setTestResult] = useState<{ status: number; data: any } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const runChannelDiagnostic = async (channel: 'telegram' | 'whatsapp') => {
    setActiveTestChannel(channel);
    setIsTesting(true);
    setTestResult(null);

    try {
      const endpoint = `/api/integrations/n8n/analyze`;
      const res = await fetch(endpoint, { method: 'GET' });
      const data = await res.json();
      setTestResult({ status: res.status, data });
    } catch (err: any) {
      setTestResult({
        status: 500,
        data: { error: 'Network test failed', details: err?.message || 'Unknown' },
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-soft">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="flex items-center space-x-3">
          <Image
            src="/argus-fin-logo.png"
            alt="Argus Fin"
            width={120}
            height={32}
            className="h-8 w-auto object-contain"
          />
          <div>
            <h2 className="text-xl font-bold text-ink flex items-center gap-2">
              <span>🇮🇳</span> Bharat-First Forwarding Channels
            </h2>
            <p className="text-xs sm:text-sm text-ink-muted mt-0.5">
              Argus Fin thin-channel architecture: Verify suspicious messages directly from WhatsApp, Telegram, or Android Share.
            </p>
          </div>
        </div>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-accent-soft text-accent border border-border self-start font-mono">
          Zero-PII Privacy Shield
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Channel 1: PWA Android Share Target */}
        <div className="bg-surface-sunken p-5 rounded-xl border border-border flex flex-col justify-between space-y-4 hover:border-accent transition-all">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl">📲</span>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-surface text-accent border border-border">
                AVAILABLE
              </span>
            </div>
            <h3 className="font-bold text-ink text-base">Android Share Target</h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Install Argus Fin as a PWA on Android. Highlight any suspicious message in WhatsApp or Chrome, tap <strong>Share</strong>, and select Argus Fin for instant client-side masking and evaluation.
            </p>
          </div>
          <Link
            href={`/${locale}/check?ref=share_target`}
            className="text-xs font-bold text-accent hover:underline flex items-center gap-1 transition"
          >
            Launch Share Target <span>→</span>
          </Link>
        </div>

        {/* Channel 2: Telegram Bot Adapter */}
        <div className="bg-surface-sunken p-5 rounded-xl border border-border flex flex-col justify-between space-y-4 hover:border-accent transition-all">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl">🤖</span>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-surface text-accent border border-border">
                ACTIVE BOT
              </span>
            </div>
            <h3 className="font-bold text-ink text-base">Telegram Assistant</h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Forward suspicious messages directly to our official Telegram bot (@{telegramBotUsername}) for instant risk analysis, reality ladder checks, and official helpline directions.
            </p>
          </div>
          <div className="space-y-2">
            <a
              href="https://t.me/ArgusFin_bot"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#229ED9] hover:bg-[#1d8cb8] text-white rounded-lg font-bold text-xs transition shadow-soft w-full justify-center"
            >
              <span>Open @ArgusFin_bot in Telegram</span>
              <span>↗</span>
            </a>
            <button
              type="button"
              onClick={() => runChannelDiagnostic('telegram')}
              className="text-[11px] font-bold text-ink bg-surface px-3 py-1.5 rounded-lg border border-border hover:border-accent w-full text-center transition font-mono"
            >
              🧪 Test Telegram Webhook Status →
            </button>
          </div>
        </div>

        {/* Channel 3: WhatsApp Cloud API (Demo Sandbox) */}
        <div className="bg-surface-sunken p-5 rounded-xl border border-border flex flex-col justify-between space-y-4 hover:border-accent transition-all">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl">💬</span>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-surface text-ink-muted border border-border">
                DEMO SANDBOX
              </span>
            </div>
            <h3 className="font-bold text-ink text-base">WhatsApp (Demo Sandbox)</h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Real WhatsApp Cloud API webhook handler for demo testing. Operates on Meta developer test tier with pre-registered test recipient numbers. Public rollout pending Meta business verification.
            </p>
          </div>
          <button
            type="button"
            onClick={() => runChannelDiagnostic('whatsapp')}
            className="text-[11px] font-bold text-ink bg-surface px-3 py-1.5 rounded-lg border border-border hover:border-accent w-full text-left transition font-mono"
          >
            🧪 Test WhatsApp Webhook Status →
          </button>
        </div>
      </div>

      {/* Interactive Channel Test Results Inspector */}
      {activeTestChannel && (
        <div className="p-4 bg-surface-sunken rounded-xl border border-accent/40 space-y-2 text-xs">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <span className="font-bold text-ink uppercase tracking-wider font-mono">
              Live Webhook Diagnostic Response: /{activeTestChannel}
            </span>
            <span
              className={`font-bold font-mono px-2 py-0.5 rounded ${
                testResult?.status === 200
                  ? 'bg-accent-soft text-accent'
                  : 'bg-risk-med-bg text-risk-med-text'
              }`}
            >
              HTTP {isTesting ? '...' : testResult?.status}
            </span>
          </div>

          {isTesting ? (
            <p className="text-ink-muted italic py-1">Pinging channel endpoint...</p>
          ) : (
            <pre className="p-3 bg-surface rounded-lg border border-border font-mono text-[11px] text-ink overflow-x-auto">
              {JSON.stringify(testResult?.data, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}

