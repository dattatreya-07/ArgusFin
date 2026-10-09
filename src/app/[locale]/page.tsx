'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';
import {
  Button,
  Chip,
  Card,
  CardContent,
} from '@/components/ui';
import {
  IconPaste,
  IconGlobe,
  IconPhone,
  IconShield,
  IconLock,
} from '@/components/icons';
import { RealityLadderHero } from '@/components/RealityLadderHero';
import { CyberFraudMap } from '@/components/CyberFraudMap';
import { TickerMarquee } from '@/components/TickerMarquee';
import { ChannelsShowcase } from '@/components/channels/ChannelsShowcase';
import { ScrambleText } from '@/components/ScrambleText';
import { FinanceXHomeShowcase } from '@/components/FinanceXHomeShowcase';

interface HomePageProps {
  params: { locale: string };
}

const FAQ_ITEMS = [
  {
    q: 'How does ArgusFin Shield detect suspicious financial claims?',
    a: 'ArgusFin Shield combines deterministic pattern matching (detecting double-money promises, task fraud, fake IPO allocations, and suspicious short links) with mathematical compound interest reality checks calibrated against official SEBI and RBI benchmark ceilings.',
  },
  {
    q: 'Is my personal data or message stored on any server?',
    a: 'No. FinanceX follows strict Privacy by Design. All phone numbers, account numbers, UPI IDs, and personal names are masked directly in your browser using client-side regular expressions before any processing. Zero user data is logged or stored.',
  },
  {
    q: 'How does Web3 evidence anchoring work without breaking privacy?',
    a: 'Only a cryptographic SHA-256 fingerprint of your serialized incident report is recorded on Polygon Amoy testnet. Your original report and private details remain 100% off-chain.',
  },
  {
    q: 'What should I do immediately if I have already sent money to a fraudster?',
    a: 'Call the National Cyber Crime Helpline at 1930 immediately (Golden Hour) to request an emergency transaction freeze with your bank, and use our Victim Incident Record tool to prepare a structured report for cybercrime.gov.in.',
  },
  {
    q: 'Are the benchmark interest rates official?',
    a: 'Yes. All comparison rates (PPF, 10-Year Government Securities, RBI Repo Rate, EPF, and Nifty 50 historical rolling returns) come directly from official government gazettes and regulatory portals with verified source citations.',
  },
];

export default function HomePage({ params: { locale } }: HomePageProps) {
  const tHome = useTranslations('home');
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Quick Home -> Shield Input State
  const [quickText, setQuickText] = useState('');

  const handleQuickCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickText.trim()) {
      router.push(`/check?q=${encodeURIComponent(quickText.trim())}`);
    } else {
      router.push('/check');
    }
  };

  return (
    <div className="space-y-20 sm:space-y-28">
      {/* 1. HERO SECTION */}
      <section className="relative pt-6 sm:pt-14 pb-8 background-lines">
        {/* Ambient Radial Glow */}
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
                FINANCEX · LEARN + PROTECT + PROVE
              </span>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-sunken border border-border text-[11px] font-mono text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>UNIFIED TRUST PLATFORM</span>
              </div>
            </div>

            {/* Inktrap H1 Headline */}
            <h1
              className="reveal text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] text-ink font-inktrap"
              data-reveal-delay="200"
            >
              FinanceX. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-highlight to-emerald-400 block">
                Learn. Protect. Prove.
              </span>
            </h1>

            {/* Supporting Statement */}
            <p
              className="reveal text-base sm:text-xl text-ink-muted leading-relaxed max-w-[56ch]"
              data-reveal-delay="400"
            >
              Build financial confidence, check suspicious financial content, and create verifiable proof of learning and evidence integrity.
            </p>

            {/* Primary CTAs */}
            <div
              className="reveal flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2"
              data-reveal-delay="600"
            >
              <Link href="/learn" className="w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full justify-center text-accent-ink shadow-soft font-extrabold"
                >
                  Start Learning
                </Button>
              </Link>
              <Link href="/check" className="w-full sm:w-auto">
                <Button
                  variant="secondary"
                  size="lg"
                  icon={<IconPaste />}
                  className="w-full justify-center font-bold"
                >
                  Check Something
                </Button>
              </Link>
              <Link href="/prove" className="w-full sm:w-auto">
                <Button
                  variant="quiet"
                  size="lg"
                  className="w-full justify-center font-bold"
                >
                  Explore Credentials
                </Button>
              </Link>
            </div>

            {/* Quick Home -> Shield Input Box */}
            <form
              onSubmit={handleQuickCheck}
              className="reveal pt-2 max-w-xl"
              data-reveal-delay="700"
            >
              <div className="flex flex-col sm:flex-row gap-2 p-1.5 bg-surface-sunken border border-border rounded-xl focus-within:ring-2 focus-within:ring-accent">
                <input
                  type="text"
                  value={quickText}
                  onChange={(e) => setQuickText(e.target.value)}
                  placeholder="Paste a suspicious offer message, link, or UPI ID..."
                  className="flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm text-ink placeholder-ink-muted focus:outline-none"
                />
                <Button type="submit" variant="primary" size="md" className="shrink-0">
                  Quick Check →
                </Button>
              </div>
            </form>

            {/* Legal Disclosures */}
            <div
              className="reveal text-[11px] text-ink-muted leading-relaxed font-mono border-t border-border pt-3"
              data-reveal-delay="800"
            >
              FinanceX is an independent investor education and fraud resilience platform. It does not provide stock tips, price predictions, or investment advice. Data is masked directly on your device.
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

      {/* 2. FINANCEX INTEGRATED PLATFORM SPOTLIGHT & BOOT TOUR */}
      <FinanceXHomeShowcase />

      {/* 3. THREE-PILLAR PRODUCT CARDS */}
      <section className="space-y-6">
        <div className="reveal space-y-2 text-center max-w-2xl mx-auto" data-reveal-delay="100">
          <span className="tag-bracket">THE THREE PILLARS</span>
          <h2 className="text-3xl sm:text-4xl font-black text-ink font-inktrap tracking-tight">
            Learn. Protect. Prove.
          </h2>
          <p className="text-sm sm:text-base text-ink-muted">
            Three interconnected capabilities working as one unified system.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: LEARN */}
          <Card className="bg-surface hover:border-accent/40 transition-all flex flex-col justify-between">
            <div className="p-6 space-y-4">
              <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent font-bold font-mono">
                01
              </div>
              <div className="space-y-1">
                <span className="text-xs font-mono font-bold text-accent uppercase tracking-wider block">
                  LEARN
                </span>
                <h3 className="text-xl font-bold text-ink font-inktrap">FinanceX Academy</h3>
              </div>
              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                Learn financial concepts, investing basics, and scam resilience through 26 interactive lessons, simulators, and AI Tutor.
              </p>
            </div>
            <div className="p-6 pt-0">
              <Link href="/learn" className="w-full">
                <Button variant="primary" size="md" className="w-full">
                  Start Learning →
                </Button>
              </Link>
            </div>
          </Card>

          {/* Card 2: PROTECT */}
          <Card className="bg-surface hover:border-accent/40 transition-all flex flex-col justify-between">
            <div className="p-6 space-y-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold font-mono">
                02
              </div>
              <div className="space-y-1">
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider block">
                  PROTECT
                </span>
                <h3 className="text-xl font-bold text-ink font-inktrap">ArgusFin Shield</h3>
              </div>
              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                Analyze suspicious messages, links, and financial claims using explainable safety intelligence and OCR screenshot scanning.
              </p>
            </div>
            <div className="p-6 pt-0">
              <Link href="/check" className="w-full">
                <Button variant="secondary" size="md" className="w-full">
                  Check Something →
                </Button>
              </Link>
            </div>
          </Card>

          {/* Card 3: PROVE */}
          <Card className="bg-surface hover:border-accent/40 transition-all flex flex-col justify-between">
            <div className="p-6 space-y-4">
              <div className="w-10 h-10 rounded-lg bg-highlight/10 border border-highlight/20 flex items-center justify-center text-highlight font-bold font-mono">
                03
              </div>
              <div className="space-y-1">
                <span className="text-xs font-mono font-bold text-highlight uppercase tracking-wider block">
                  PROVE
                </span>
                <h3 className="text-xl font-bold text-ink font-inktrap">FinanceX Trust Layer</h3>
              </div>
              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                Create verifiable learning credentials and tamper-evident cryptographic evidence fingerprints on Polygon Amoy testnet.
              </p>
            </div>
            <div className="p-6 pt-0">
              <Link href="/prove" className="w-full">
                <Button variant="quiet" size="md" className="w-full">
                  View Proof →
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>

      {/* 3. "WHY FINANCEX?" COMPARISON SECTION */}
      <section className="space-y-8 bg-surface-sunken p-6 sm:p-10 rounded-2xl border border-border">
        <div className="space-y-2 text-center max-w-2xl mx-auto">
          <span className="tag-bracket">WHY FINANCEX?</span>
          <h2 className="text-3xl sm:text-4xl font-black text-ink font-inktrap tracking-tight">
            The Difference is Integration
          </h2>
          <p className="text-sm sm:text-base text-ink-muted">
            Traditional tools isolate learning from protection. FinanceX connects them into a complete trust cycle.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs sm:text-sm">
          <div className="p-5 bg-surface rounded-xl border border-border space-y-2">
            <span className="font-bold text-ink-muted block text-xs uppercase font-mono">TRADITIONAL FINANCIAL ED</span>
            <h4 className="font-bold text-ink text-base">Learn Concepts Alone</h4>
            <p className="text-ink-muted">Teaches theory in isolation without context when you encounter real-world suspicious offers.</p>
          </div>

          <div className="p-5 bg-surface rounded-xl border border-border space-y-2">
            <span className="font-bold text-ink-muted block text-xs uppercase font-mono">TRADITIONAL SCAM DETECT</span>
            <h4 className="font-bold text-ink text-base">Detect Messages Alone</h4>
            <p className="text-ink-muted">Flags messages without explaining the underlying financial math or enabling user understanding.</p>
          </div>

          <div className="p-5 bg-surface rounded-xl border border-accent/40 bg-accent/5 space-y-2">
            <span className="font-bold text-accent block text-xs uppercase font-mono">THE FINANCEX APPROACH</span>
            <h4 className="font-bold text-ink text-base">Learn + Protect + Prove</h4>
            <p className="text-ink-muted">Protection checks trigger relevant learning. Learning unlocks verifiable Web3 credentials. Reports generate anchored evidence proofs.</p>
          </div>
        </div>
      </section>

      {/* 4. MARQUEE TICKER */}
      <section className="relative border-y border-border bg-surface -mx-4 sm:-mx-6 px-4 sm:px-6">
        <TickerMarquee />
      </section>

      {/* 5. INDIA CYBER FRAUD AWARENESS SECTION */}
      <section className="space-y-4">
        <CyberFraudMap locale={locale} />
      </section>

      {/* 6. CHANNELS FORWARDING SHOWCASE */}
      <section className="space-y-4">
        <ChannelsShowcase locale={locale as any} />
      </section>

      {/* 7. FAQ SECTION */}
      <section className="relative background-lines pt-4 pb-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="reveal lg:col-span-5 space-y-4" data-reveal-delay="100">
            <span className="tag-bracket">FREQUENTLY ASKED</span>
            <h2 className="text-3xl sm:text-4xl font-black text-ink font-inktrap tracking-tight">
              Questions? <br />
              We&apos;re Here to Help.
            </h2>
            <p className="text-sm sm:text-base text-ink-muted leading-relaxed">
              Explore our Trust Center for detailed privacy, AI safety, and architectural guarantees.
            </p>
            <div className="pt-2">
              <Link href="/trust">
                <Button variant="secondary" size="md">
                  <ScrambleText text="TRUST CENTER →" />
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

      {/* 8. EMERGENCY ACTION CALLOUT */}
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
