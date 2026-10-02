'use client';

import React from 'react';
import Link from 'next/link';
import { Lang } from '@/lib/types';

interface ChannelsShowcaseProps {
  locale: Lang;
}

export function ChannelsShowcase({ locale }: ChannelsShowcaseProps) {
  const isTelegramConfigured = Boolean(process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME);
  const telegramBotUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'SangyanBot';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>🇮🇳</span> Bharat-First Access Channels
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Access SANGYAN directly from WhatsApp, Telegram, or your Android share drawer.
          </p>
        </div>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800 self-start">
          Zero-PII Privacy Shield
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Channel 1: PWA Android Share Target */}
        <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl">📲</span>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-900/60 text-blue-300 border border-blue-700">
                AVAILABLE
              </span>
            </div>
            <h3 className="font-bold text-slate-100 text-base">Android Share Target</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Install SANGYAN as a PWA on Android. Highlight any suspicious message in WhatsApp or Chrome, tap <strong>Share</strong>, and select SANGYAN for instant evaluation.
            </p>
          </div>
          <Link
            href={`/${locale}/share`}
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition"
          >
            Try Share Target <span>→</span>
          </Link>
        </div>

        {/* Channel 2: Telegram Bot Adapter */}
        <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl">✈️</span>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-900/60 text-blue-300 border border-blue-700">
                AVAILABLE
              </span>
            </div>
            <h3 className="font-bold text-slate-100 text-base">Telegram Assistant</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Forward suspicious scheme messages directly to our official Telegram bot for concise analysis, mathematical reality checks, and reporting steps.
            </p>
          </div>
          {isTelegramConfigured ? (
            <a
              href={`https://t.me/${telegramBotUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition"
            >
              Open @{telegramBotUsername} <span>↗</span>
            </a>
          ) : (
            <span className="text-xs font-medium text-slate-500">
              Configurable via Webhook API
            </span>
          )}
        </div>

        {/* Channel 3: WhatsApp Bot (Roadmap) */}
        <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800/80 flex flex-col justify-between space-y-4 opacity-80">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl">💬</span>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                PLANNED
              </span>
            </div>
            <h3 className="font-bold text-slate-300 text-base">WhatsApp Official Bot</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              WhatsApp Business Cloud API integration is planned for a future milestone pending official Meta Business Verification and policy onboarding.
            </p>
          </div>
          <span className="text-xs font-medium text-slate-500">
            Enterprise Verification Roadmap
          </span>
        </div>
      </div>
    </div>
  );
}
