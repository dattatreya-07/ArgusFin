'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import {
  Button,
  Chip,
  Card,
  CardContent,
} from '@/components/ui';
import {
  IconPaste,
  IconCalculator,
  IconGlobe,
  IconPhone,
  IconShield,
  IconLock,
  IconCheck,
} from '@/components/icons';
import { RealityLadderHero } from '@/components/RealityLadderHero';
import { CyberFraudMap } from '@/components/CyberFraudMap';
import { TickerMarquee } from '@/components/TickerMarquee';
import { ChannelsShowcase } from '@/components/channels/ChannelsShowcase';
import { ScrambleText } from '@/components/ScrambleText';

interface HomePageProps {
  params: { locale: string };
}

const FAQ_ITEMS = [
  {
    q: 'How does ArgusFin detect financial scam claims and fraud promises?',
    a: 'ArgusFin combines deterministic pattern matching (detecting double-money promises, task fraud, fake IPO allocations, and suspicious short links) with mathematical compound interest reality checks calibrated against official SEBI and RBI benchmark ceilings.',
  },
  {
    q: 'Is my personal data, phone number, or message stored on any server?',
    a: 'No. ArgusFin follows strict Privacy by Design. All phone numbers, account numbers, UPI IDs, and personal names are masked directly in your browser using client-side regular expressions before any processing. Zero user data is logged or stored.',
  },
  {
    q: 'How does client-side screenshot verification work?',
    a: 'Uploaded images are processed directly on your device using local WebAssembly OCR (Tesseract.js). The extracted text is screened for financial claims and red flags locally without sending unmasked raw screenshots to cloud databases.',
  },
  {
    q: 'What should I do immediately if I have already sent money to a fraudster?',
    a: 'Call the National Cyber Crime Helpline at 1930 immediately (Golden Hour) to request an emergency transaction freeze with your bank, and use our Victim Incident Record tool to prepare a structured report for cybercrime.gov.in.',
  },
  {
    q: 'Are the benchmark rates official and regularly updated?',
    a: 'Yes. All comparison rates (PPF, 10-Year Government Securities, RBI Repo Rate, EPF, and Nifty 50 historical rolling returns) come directly from official government gazettes and regulatory portals with verified source citations.',
  },
];

export default function HomePage({ params: { locale } }: HomePageProps) {
  const tHome = useTranslations('home');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="space-y-24 sm:space-y-32">
      {/* 1. BITNOMIAL-STYLE HERO SECTION */}
      <section className="relative pt-6 sm:pt-14 pb-8 background-lines">
        {/* Subtle Ambient Radial Glow */}
        <div
          aria-hidden="true"
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-gradient-to-b from-accent/12 via-accent/5 to-transparent rounded-full blur-3xl pointer-events-none"
        />

        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Headline & Action */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Tag Badge */}
            <div className="reveal flex flex-wrap items-center gap-3" data-reveal-delay="100">
              <span className="tag-bracket">
                SEBI · RBI BENCHMARK GROUNDED
              </span>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-sunken border border-border text-[11px] font-mono text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>100% CLIENT-SIDE MASKING</span>
              </div>
            </div>

            {/* Inktrap H1 Headline */}
            <h1
              className="reveal text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] text-ink font-inktrap"
              data-reveal-delay="200"
            >
              Scam Detection. <br className="hidden sm:inline" />
              Mathematical Truth.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-highlight block sm:inline">
                Instant Redressal.
              </span>
            </h1>

            {/* Subtitle */}
            <p
              className="reveal text-base sm:text-lg text-ink-muted leading-relaxed max-w-[56ch]"
              data-reveal-delay="400"
            >
              {tHome('heroSubtitle')}
            </p>

            {/* Action Buttons */}
            <div
              className="reveal flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2"
              data-reveal-delay="600"
            >
              <Link href="/check" className="w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="lg"
                  icon={<IconPaste />}
                  className="w-full justify-center text-accent-ink shadow-soft font-extrabold"
                >
                  {tHome('primaryCta')}
                </Button>
              </Link>
              <Link href="/calculator" className="w-full sm:w-auto">
                <Button
                  variant="secondary"
                  size="lg"
                  icon={<IconCalculator />}
                  className="w-full justify-center font-bold"
                >
                  <ScrambleText text={tHome('secondaryCta')} />
                </Button>
              </Link>
            </div>

            {/* Legal / Disclosures Text */}
            <div
              className="reveal text-[11px] text-ink-muted leading-relaxed font-mono border-t border-border pt-3"
              data-reveal-delay="800"
            >
              Signing up or paying unregistered entities carries substantial capital loss risks. ArgusFin provides educational mathematical verification against sovereign benchmarks and does not provide investment advice or market predictions.
            </div>

            {/* Neutral Info Chips */}
            <div
              className="reveal flex flex-wrap items-center gap-2 pt-1 text-xs"
              data-reveal-delay="900"
            >
              <Chip icon={<IconGlobe />}>{tHome('chipLangs')}</Chip>
              <Chip icon={<IconLock />}>Zero User Storage</Chip>
              <Chip icon={<IconShield />}>{tHome('chipNoAdvice')}</Chip>
            </div>
          </div>

          {/* Right Column: Grounded Reality Ladder */}
          <div className="reveal lg:col-span-5 flex flex-col gap-4" data-reveal-delay="300">
            <RealityLadderHero />
          </div>
        </div>
      </section>

      {/* 2. DUAL DIRECTION INFINITE MARQUEE TICKERS */}
      <section className="relative border-y border-border bg-surface -mx-4 sm:-mx-6 px-4 sm:px-6">
        <TickerMarquee />
      </section>

      {/* 3. INDIA CYBER FRAUD AWARENESS SECTION (Replaces old hero matrix) */}
      <section className="space-y-4">
        <CyberFraudMap locale={locale} />
      </section>

      {/* 4. CHANNELS FORWARDING SUITE (WhatsApp / Telegram / PWA Share Target) */}
      <section className="space-y-4">
        <ChannelsShowcase locale={locale as any} />
      </section>

      {/* 5. BITNOMIAL PRODUCTS SECTION (Full-width Alternating Rows) */}
      <section className="space-y-4 background-lines">
        <div className="reveal flex items-center justify-between pb-4" data-reveal-delay="100">
          <span className="tag-bracket">CORE RESILIENCE SUITE</span>
          <span className="font-mono text-xs text-ink-muted">[ VERIFIED ENGINE ]</span>
        </div>

        {/* Product Row 1: Scam Claim Verification */}
        <div className="product-row underlined group" data-animation-delay="100">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-4 space-y-1">
              <span className="text-[11px] font-mono text-accent uppercase tracking-wider font-bold">
                01 / CLAIM ANALYSIS
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-ink font-inktrap group-hover:text-accent transition-colors">
                Scam Detect & OCR
              </h2>
            </div>
            <div className="md:col-span-5 text-sm sm:text-base text-ink-muted leading-relaxed">
              Scan WhatsApp messages, SMS, or screenshots with client-side Tesseract.js. Instantly breaks down promised returns, short links, and red flag patterns.
            </div>
            <div className="md:col-span-3 flex justify-start md:justify-end">
              <Link href="/check">
                <Button variant="primary" size="md">
                  <ScrambleText text="LAUNCH SCANNER →" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Product Row 2: Promise-to-Reality Calculator */}
        <div className="product-row underlined group" data-animation-delay="200">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-4 space-y-1">
              <span className="text-[11px] font-mono text-accent uppercase tracking-wider font-bold">
                02 / MATHEMATICAL PROOF
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-ink font-inktrap group-hover:text-accent transition-colors">
                Yield Reality Calculator
              </h2>
            </div>
            <div className="md:col-span-5 text-sm sm:text-base text-ink-muted leading-relaxed">
              Converts daily and monthly promises into annualised percentage rates and plots them against sovereign PPF, G-Sec, and Nifty 50 benchmarks.
            </div>
            <div className="md:col-span-3 flex justify-start md:justify-end">
              <Link href="/calculator">
                <Button variant="secondary" size="md">
                  <ScrambleText text="OPEN CALCULATOR →" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Product Row 3: Doubling Simulator */}
        <div className="product-row underlined group" data-animation-delay="300">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-4 space-y-1">
              <span className="text-[11px] font-mono text-accent uppercase tracking-wider font-bold">
                03 / PONZI DYNAMICS
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-ink font-inktrap group-hover:text-accent transition-colors">
                Doubling Simulator
              </h2>
            </div>
            <div className="md:col-span-5 text-sm sm:text-base text-ink-muted leading-relaxed">
              Simulates cashflows in doubling schemes to prove why small initial payouts are bait before withdrawal freeze and total collapse.
            </div>
            <div className="md:col-span-3 flex justify-start md:justify-end">
              <Link href="/simulate">
                <Button variant="secondary" size="md">
                  <ScrambleText text="RUN SIMULATOR →" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Product Row 4: Authority Router & Victim Record */}
        <div className="product-row underlined group" data-animation-delay="400">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-4 space-y-1">
              <span className="text-[11px] font-mono text-accent uppercase tracking-wider font-bold">
                04 / EMERGENCY HELP
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-ink font-inktrap group-hover:text-accent transition-colors">
                Authority Router
              </h2>
            </div>
            <div className="md:col-span-5 text-sm sm:text-base text-ink-muted leading-relaxed">
              Routes victims directly to official portals (1930 Cyber Helpline, SEBI SCORES, RBI Sachet) and drafts an organized incident record.
            </div>
            <div className="md:col-span-3 flex justify-start md:justify-end">
              <Link href="/authorities">
                <Button variant="secondary" size="md">
                  <ScrambleText text="FIND AUTHORITIES →" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. BITNOMIAL NUMBERED FEATURES SECTION (01 - 05) */}
      <section className="space-y-10">
        <div className="reveal space-y-2" data-reveal-delay="100">
          <span className="tag-bracket">ARCHITECTURE</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-ink font-inktrap tracking-tight">
            One Architecture. Defensible Truth.
          </h2>
          <p className="text-base sm:text-lg text-ink-muted max-w-[65ch]">
            Engineered for high-stress situations with zero-storage privacy and verified citations.
          </p>
        </div>

        <div className="divide-y divide-border/60 border-y border-border/60">
          {/* Item 01 */}
          <div className="py-7 sm:py-9 grid grid-cols-1 md:grid-cols-12 gap-4 items-start underlined group" data-animation-delay="100">
            <div className="md:col-span-2 font-mono text-3xl sm:text-4xl font-extrabold text-accent/80 group-hover:text-accent transition-colors">
              01
            </div>
            <div className="md:col-span-4">
              <h3 className="text-lg sm:text-xl font-bold text-ink font-inktrap uppercase tracking-tight">
                REGULATED BENCHMARKS
              </h3>
              <p className="text-xs font-mono text-accent/80 mt-1">SEBI · RBI · EPF · PPF CEILINGS</p>
            </div>
            <div className="md:col-span-6 text-sm sm:text-base text-ink-muted leading-relaxed">
              Every rate, return multiplier, and statistic comes directly from official gazettes and portals with verifiable timestamped source URLs. Never generated from language model memory.
            </div>
          </div>

          {/* Item 02 */}
          <div className="py-7 sm:py-9 grid grid-cols-1 md:grid-cols-12 gap-4 items-start underlined group" data-animation-delay="200">
            <div className="md:col-span-2 font-mono text-3xl sm:text-4xl font-extrabold text-accent/80 group-hover:text-accent transition-colors">
              02
            </div>
            <div className="md:col-span-4">
              <h3 className="text-lg sm:text-xl font-bold text-ink font-inktrap uppercase tracking-tight">
                DETERMINISTIC RULES
              </h3>
              <p className="text-xs font-mono text-accent/80 mt-1">CALIBRATED PATTERN MATCHER</p>
            </div>
            <div className="md:col-span-6 text-sm sm:text-base text-ink-muted leading-relaxed">
              Instantly flags high-risk promises like &quot;double in 30 days&quot;, daily compounding traps, advance-fee clearance charges, suspicious shortened domains (bit.ly/t.co), and pre-approved loan bait.
            </div>
          </div>

          {/* Item 03 */}
          <div className="py-7 sm:py-9 grid grid-cols-1 md:grid-cols-12 gap-4 items-start underlined group" data-animation-delay="300">
            <div className="md:col-span-2 font-mono text-3xl sm:text-4xl font-extrabold text-accent/80 group-hover:text-accent transition-colors">
              03
            </div>
            <div className="md:col-span-4">
              <h3 className="text-lg sm:text-xl font-bold text-ink font-inktrap uppercase tracking-tight">
                IN-BROWSER EVIDENCE OCR
              </h3>
              <p className="text-xs font-mono text-accent/80 mt-1">TESSERACT.JS ZERO-UPLOAD SCAN</p>
            </div>
            <div className="md:col-span-6 text-sm sm:text-base text-ink-muted leading-relaxed">
              Screenshots from WhatsApp, SMS, or Telegram are extracted directly on your device via client-side WebAssembly OCR. No raw user images are stored or transmitted.
            </div>
          </div>

          {/* Item 04 */}
          <div className="py-7 sm:py-9 grid grid-cols-1 md:grid-cols-12 gap-4 items-start underlined group" data-animation-delay="400">
            <div className="md:col-span-2 font-mono text-3xl sm:text-4xl font-extrabold text-accent/80 group-hover:text-accent transition-colors">
              04
            </div>
            <div className="md:col-span-4">
              <h3 className="text-lg sm:text-xl font-bold text-ink font-inktrap uppercase tracking-tight">
                ZERO-STORAGE PRIVACY
              </h3>
              <p className="text-xs font-mono text-accent/80 mt-1">CLIENT-SIDE REGEX MASKING</p>
            </div>
            <div className="md:col-span-6 text-sm sm:text-base text-ink-muted leading-relaxed">
              Strict privacy by design: Never reads SMS or OTPs. All phone numbers, account numbers, and UPI IDs are masked into anonymous placeholders before any remote network call.
            </div>
          </div>
        </div>
      </section>

      {/* 5. QUESTIONS / BITNOMIAL FAQ SECTION */}
      <section className="relative background-lines pt-8 pb-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="reveal lg:col-span-5 space-y-4" data-reveal-delay="100">
            <span className="tag-bracket">FREQUENTLY ASKED</span>
            <h2 className="text-3xl sm:text-4xl font-black text-ink font-inktrap tracking-tight">
              Questions? <br />
              We&apos;re Here to Help.
            </h2>
            <p className="text-sm sm:text-base text-ink-muted leading-relaxed">
              Can&apos;t find what you&apos;re looking for? Explore our cited Q&A assistant or check official grievance channels.
            </p>
            <div className="pt-2">
              <Link href="/ask">
                <Button variant="secondary" size="md">
                  <ScrambleText text="CITED ASSISTANT →" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="reveal lg:col-span-7 space-y-3" data-reveal-delay="300">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-border bg-surface/80 backdrop-blur-sm overflow-hidden transition-all duration-200 hover:border-accent/40"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-ink hover:text-accent transition-colors cursor-pointer"
                  >
                    <span className="text-base sm:text-lg font-inktrap">{item.q}</span>
                    <span className="font-mono text-accent text-xl shrink-0 font-bold">
                      {isOpen ? '−' : '+'}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-sm sm:text-base text-ink-muted leading-relaxed border-t border-border/40 pt-3">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. GET STARTED / EMERGENCY ACTION CALLOUT */}
      <section className="reveal" data-reveal-delay="200">
        <Card className="bg-gradient-to-r from-surface-sunken via-surface to-surface-sunken border-border relative overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-rose-500/8 rounded-full blur-3xl pointer-events-none" />
          <CardContent className="p-7 sm:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2 max-w-[65ch]">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950/60 border border-rose-600/40 text-xs font-mono text-rose-300">
                <IconPhone className="w-3.5 h-3.5 text-rose-400" />
                <span>Immediate Golden Hour Action</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-ink font-inktrap">
                {tHome('emergencyCardTitle')}
              </h3>
              <p className="text-sm sm:text-base text-ink-muted leading-relaxed">
                {tHome('emergencyCardDesc')}
              </p>
            </div>
            <div className="flex-shrink-0">
              <Link href="/report">
                <Button variant="primary" size="lg" className="shadow-glow font-extrabold">
                  <ScrambleText text={tHome('emergencyCta')} /> →
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
