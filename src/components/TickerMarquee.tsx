'use client';

import React from 'react';
import Link from 'next/link';

const EMERGENCY_HELPLINES = [
  {
    icon: '🚨',
    label: '1930 Cyber Helpline',
    desc: 'Immediate Financial Fraud Account Freeze',
    badge: '24x7 Toll-Free',
    href: '/authorities',
  },
  {
    icon: '🛡️',
    label: 'SEBI SCORES Portal',
    desc: '1800 22 7575 / scores.sebi.gov.in',
    badge: 'Regulated Markets',
    href: 'https://scores.sebi.gov.in',
    external: true,
  },
  {
    icon: '🏦',
    label: 'RBI Sachet Portal',
    desc: '14440 / sachet.rbi.org.in',
    badge: 'Illegal Deposits',
    href: 'https://sachet.rbi.org.in',
    external: true,
  },
  {
    icon: '💻',
    label: 'CERT-In Incident Desk',
    desc: '1800-11-4949 / cert-in.org.in',
    badge: 'National Cyber Security',
    href: '/authorities',
  },
  {
    icon: '📱',
    label: 'DoT Chakshu Portal',
    desc: 'sancharsaathi.gov.in/sfc',
    badge: 'Suspected Fraud SMS/Calls',
    href: 'https://sancharsaathi.gov.in/sfc',
    external: true,
  },
  {
    icon: '🏛️',
    label: 'National Consumer Helpline',
    desc: '1915 / consumerhelpline.gov.in',
    badge: 'Consumer Grievance',
    href: '/authorities',
  },
  {
    icon: '⚖️',
    label: 'SEBI SMART ODR',
    desc: 'smartodr.in (Online Dispute Resolution)',
    badge: 'Investor Redressal',
    href: 'https://smartodr.in',
    external: true,
  },
];

const AVAILABILITY_CHANNELS = [
  {
    icon: '📲',
    label: 'Android PWA Share Target',
    desc: 'Direct 1-Tap Share from WhatsApp, Chrome & SMS',
    status: 'Live & Available',
    href: '/share',
  },
  {
    icon: '🤖',
    label: 'Telegram Bot Adapter',
    desc: '@ArgusFinBot • User-Initiated Verification',
    status: 'Channel Active',
    href: '/share',
  },
  {
    icon: '🛡️',
    label: 'Zero-Data Privacy Shield',
    desc: '100% Client-Side Masking Before Remote NLP',
    status: 'Privacy Invariant',
    href: '/check',
  },
  {
    icon: '📊',
    label: 'Yield Reality Ladder',
    desc: 'Compare Claimed Returns vs RBI / PPF / Sensex',
    status: 'Benchmark Engine',
    href: '/calculator',
  },
  {
    icon: '👁️',
    label: 'Client-Side OCR Extraction',
    desc: 'Tesseract.js In-Browser Screenshot Analysis',
    status: 'Zero Cloud Upload',
    href: '/check',
  },
  {
    icon: '🇮🇳',
    label: 'Bharat Multilingual NLP',
    desc: 'Native Claim Extraction in English • हिन्दी • தமிழ்',
    status: '3 Languages',
    href: '/learn',
  },
  {
    icon: '🔒',
    label: 'Stateless Core Security',
    desc: '0 Phone Numbers, 0 Passwords, 0 Chats Logged',
    status: 'Security Hardened',
    href: '/report',
  },
];

export function TickerMarquee() {
  return (
    <div className="space-y-4 py-8 overflow-hidden bg-transparent">
      {/* Ticker 1 Header */}
      <div className="flex items-center justify-between px-2 text-xs font-semibold text-ink-muted uppercase tracking-wider font-mono">
        <span className="flex items-center gap-2 text-ink">
          <span className="inline-block w-2 h-2 rounded-full bg-accent animate-ping"></span>
          Emergency Fraud Redressal & Official Helplines
        </span>
        <span className="hidden sm:inline text-ink-muted/80 text-[11px] font-mono">[ Hover to pause / Click to open ]</span>
      </div>

      {/* Ticker 1: Helplines (Left to Right / Standard Marquee) */}
      <div className="relative w-full mask-gradient-x overflow-hidden py-1">
        <div className="animate-marquee gap-3.5">
          {[...EMERGENCY_HELPLINES, ...EMERGENCY_HELPLINES].map((item, idx) => {
            const isExternal = item.external;
            return isExternal ? (
              <a
                key={`h-${idx}`}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg border border-border bg-surface text-ink hover:border-accent hover:bg-surface-sunken hover:scale-[1.02] transition-all cursor-pointer whitespace-nowrap shadow-soft group"
              >
                <span className="text-xl group-hover:scale-110 transition-transform">{item.icon}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-ink group-hover:text-accent transition-colors">{item.label}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-sunken text-ink-muted font-mono font-medium border border-border">
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-ink-muted font-mono">{item.desc}</p>
                </div>
              </a>
            ) : (
              <Link
                key={`h-${idx}`}
                href={item.href}
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg border border-border bg-surface text-ink hover:border-accent hover:bg-surface-sunken hover:scale-[1.02] transition-all cursor-pointer whitespace-nowrap shadow-soft group"
              >
                <span className="text-xl group-hover:scale-110 transition-transform">{item.icon}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-ink group-hover:text-accent transition-colors">{item.label}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-sunken text-ink-muted font-mono font-medium border border-border">
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-ink-muted font-mono">{item.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Ticker 2 Header */}
      <div className="flex items-center justify-between px-2 pt-3 text-xs font-semibold text-ink-muted uppercase tracking-wider font-mono">
        <span className="flex items-center gap-2 text-ink">
          <span className="inline-block w-2 h-2 rounded-full bg-accent"></span>
          Core Resilience Suite & Channels
        </span>
        <span className="hidden sm:inline text-ink-muted/80 text-[11px] font-mono">[ Continuous Shield ]</span>
      </div>

      {/* Ticker 2: Channels / Availability (Opposite Scroll / Marquee Reverse) */}
      <div className="relative w-full mask-gradient-x overflow-hidden py-1">
        <div className="animate-marquee-reverse gap-3.5">
          {[...AVAILABILITY_CHANNELS, ...AVAILABILITY_CHANNELS].map((item, idx) => (
            <Link
              key={`c-${idx}`}
              href={item.href}
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg border border-border bg-surface text-ink hover:border-accent hover:bg-surface-sunken hover:scale-[1.02] transition-all cursor-pointer whitespace-nowrap shadow-soft group"
            >
              <span className="text-xl group-hover:scale-110 transition-transform">{item.icon}</span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-ink group-hover:text-accent transition-colors">{item.label}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-sunken text-ink-muted font-mono font-medium border border-border">
                    {item.status}
                  </span>
                </div>
                <p className="text-[11px] text-ink-muted font-mono">{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

