'use client';

import React from 'react';

const EMERGENCY_HELPLINES = [
  {
    icon: '🚨',
    label: '1930 Cyber Helpline',
    desc: 'Immediate Financial Fraud Account Freeze',
    badge: '24x7 Toll-Free',
    accent: 'border-rose-500/40 bg-rose-950/40 text-rose-200',
  },
  {
    icon: '🛡️',
    label: 'SEBI SCORES Portal',
    desc: '1800 22 7575 / scores.sebi.gov.in',
    badge: 'Regulated Markets',
    accent: 'border-blue-500/40 bg-blue-950/40 text-blue-200',
  },
  {
    icon: '🏦',
    label: 'RBI Sachet Portal',
    desc: '14440 / sachet.rbi.org.in',
    badge: 'Illegal Deposits',
    accent: 'border-emerald-500/40 bg-emerald-950/40 text-emerald-200',
  },
  {
    icon: '💻',
    label: 'CERT-In Incident Desk',
    desc: '1800-11-4949 / incident@cert-in.org.in',
    badge: 'National Cyber Security',
    accent: 'border-cyan-500/40 bg-cyan-950/40 text-cyan-200',
  },
  {
    icon: '📱',
    label: 'DoT Chakshu Portal',
    desc: 'sancharsaathi.gov.in/sfc',
    badge: 'Suspected Fraud SMS/Calls',
    accent: 'border-amber-500/40 bg-amber-950/40 text-amber-200',
  },
  {
    icon: '🏛️',
    label: 'National Consumer Helpline',
    desc: '1915 / consumerhelpline.gov.in',
    badge: 'Consumer Grievance',
    accent: 'border-indigo-500/40 bg-indigo-950/40 text-indigo-200',
  },
  {
    icon: '⚖️',
    label: 'SEBI SMART ODR',
    desc: 'smartodr.in (Online Dispute Resolution)',
    badge: 'Investor Redressal',
    accent: 'border-purple-500/40 bg-purple-950/40 text-purple-200',
  },
];

const AVAILABILITY_CHANNELS = [
  {
    icon: '📲',
    label: 'Android PWA Share Target',
    desc: 'Direct 1-Tap Share from WhatsApp, Chrome & SMS',
    status: 'Live & Available',
    accent: 'border-emerald-500/40 bg-emerald-950/40 text-emerald-200',
  },
  {
    icon: '🤖',
    label: 'Telegram Bot Adapter',
    desc: '@ArgusFinBot • User-Initiated Verification',
    status: 'Channel Active',
    accent: 'border-sky-500/40 bg-sky-950/40 text-sky-200',
  },
  {
    icon: '🛡️',
    label: 'Zero-Data Privacy Shield',
    desc: '100% Client-Side Masking Before Remote NLP',
    status: 'Privacy Invariant',
    accent: 'border-purple-500/40 bg-purple-950/40 text-purple-200',
  },
  {
    icon: '📊',
    label: 'Yield Reality Ladder',
    desc: 'Compare Claimed Returns vs RBI / PPF / Sensex',
    status: 'Benchmark Engine',
    accent: 'border-blue-500/40 bg-blue-950/40 text-blue-200',
  },
  {
    icon: '💬',
    label: 'WhatsApp Cloud Adapter',
    desc: 'Enterprise Webhook Pipeline (Meta Platform Review)',
    status: 'Planned Roadmap',
    accent: 'border-amber-500/40 bg-amber-950/40 text-amber-200',
  },
  {
    icon: '🇮🇳',
    label: 'Bharat Multilingual NLP',
    desc: 'Native Claim Extraction in English • हिन्दी • தமிழ்',
    status: '3 Languages',
    accent: 'border-orange-500/40 bg-orange-950/40 text-orange-200',
  },
  {
    icon: '🔒',
    label: 'Stateless Core Security',
    desc: '0 Phone Numbers, 0 Passwords, 0 Chats Logged',
    status: 'Security Hardened',
    accent: 'border-rose-500/40 bg-rose-950/40 text-rose-200',
  },
];

export function TickerMarquee() {
  return (
    <div className="space-y-4 py-6 overflow-hidden">
      {/* Ticker 1 Header */}
      <div className="flex items-center justify-between px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
          National Financial Scam Emergency Helplines & Official Redressal
        </span>
        <span className="hidden sm:inline text-slate-400 text-[11px]">Hover to pause</span>
      </div>

      {/* Ticker 1: Helplines (Left to Right / Standard Marquee) */}
      <div className="relative w-full mask-gradient-x overflow-hidden py-1">
        <div className="animate-marquee gap-3">
          {[...EMERGENCY_HELPLINES, ...EMERGENCY_HELPLINES].map((item, idx) => (
            <div
              key={`h-${idx}`}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border ${item.accent} backdrop-blur shadow-sm hover:scale-[1.02] transition-transform cursor-default whitespace-nowrap`}
            >
              <span className="text-xl">{item.icon}</span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold">{item.label}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/40 text-white/90 font-medium">
                    {item.badge}
                  </span>
                </div>
                <p className="text-[11px] opacity-80 font-mono">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ticker 2 Header */}
      <div className="flex items-center justify-between px-2 pt-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
          Where Argus Fin is Available • Thin Channels & Resilience Ecosystem
        </span>
        <span className="hidden sm:inline text-slate-400 text-[11px]">Continuous Protection</span>
      </div>

      {/* Ticker 2: Channels / Availability (Opposite Scroll / Marquee Reverse) */}
      <div className="relative w-full mask-gradient-x overflow-hidden py-1">
        <div className="animate-marquee-reverse gap-3">
          {[...AVAILABILITY_CHANNELS, ...AVAILABILITY_CHANNELS].map((item, idx) => (
            <div
              key={`c-${idx}`}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border ${item.accent} backdrop-blur shadow-sm hover:scale-[1.02] transition-transform cursor-default whitespace-nowrap`}
            >
              <span className="text-xl">{item.icon}</span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold">{item.label}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/40 text-white/90 font-medium">
                    {item.status}
                  </span>
                </div>
                <p className="text-[11px] opacity-80">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
