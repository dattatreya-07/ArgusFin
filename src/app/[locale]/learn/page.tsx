import React from 'react';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { LESSONS, FINANCIAL_INSTRUMENTS, REGULATORS, SCAM_MODULES, GLOSSARY_TERMS, RESILIENCE_CARDS } from '@/lib/education/data';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Chip,
  SectionHeading,
} from '@/components/ui';
import {
  IconBook,
} from '@/components/icons';

export default function LearnPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);

  const langKey = (locale === 'hi' || locale === 'ta' ? locale : 'en') as 'en' | 'hi' | 'ta';

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      {/* Page Heading */}
      <div className="space-y-4 text-center sm:text-left">
        <SectionHeading
          badge="Investor Resilience Academy"
          title="Learn Financial Literacy &amp; Investor Protection"
          subtitle="Plain-language education on CAGR, market risk, statutory regulators (SEBI, RBI, NSE, BSE, NSDL), and scam prevention."
        />

        {/* TWO CLEARLY VISIBLE DOORS: CHECK IT vs LEARN IT */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <Link
            href="/check"
            className="p-5 rounded-2xl border-2 border-accent bg-accent-soft text-ink hover:scale-[1.01] transition-all shadow-md group flex flex-col justify-between"
          >
            <div className="space-y-1">
              <span className="text-2xl block">🔍</span>
              <h2 className="text-lg font-bold text-ink group-hover:text-accent transition-colors">
                DOOR 1: CHECK IT
              </h2>
              <p className="text-xs text-ink-muted leading-relaxed">
                Received a suspicious investment message or promise? Scan text, screenshots, or voice notes for immediate open-world risk evaluation.
              </p>
            </div>
            <span className="text-xs font-bold text-accent mt-3 block font-mono">
              Launch Scam Check Scanner →
            </span>
          </Link>

          <Link
            href="#resilience-cards"
            className="p-5 rounded-2xl border-2 border-border bg-surface text-ink hover:border-accent hover:scale-[1.01] transition-all shadow-md group flex flex-col justify-between"
          >
            <div className="space-y-1">
              <span className="text-2xl block">📚</span>
              <h2 className="text-lg font-bold text-ink group-hover:text-accent transition-colors">
                DOOR 2: LEARN IT
              </h2>
              <p className="text-xs text-ink-muted leading-relaxed">
                Build long-term investor resilience. Master market instruments, statutory safeguards, and 10 core verification cards.
              </p>
            </div>
            <span className="text-xs font-bold text-ink mt-3 block font-mono">
              Explore Resilience Cards ↓
            </span>
          </Link>
        </div>
      </div>

      {/* Curriculum Navigation Quick Index Bar */}
      <div className="p-4 bg-surface-sunken rounded-xl border border-border flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <span className="font-bold text-ink">Curriculum Index:</span>
        <div className="flex flex-wrap items-center gap-2">
          <a href="#resilience-cards" className="px-2.5 py-1 rounded bg-accent-soft text-accent border border-accent/40 font-bold">
            🛡️ 10 Resilience Cards
          </a>
          <a href="#lessons" className="px-2.5 py-1 rounded bg-surface border border-border text-ink hover:border-accent">
            📖 Lessons ({LESSONS.length})
          </a>
          <a href="#instruments" className="px-2.5 py-1 rounded bg-surface border border-border text-ink hover:border-accent">
            🏛️ Instruments ({FINANCIAL_INSTRUMENTS.length})
          </a>
          <a href="#regulators" className="px-2.5 py-1 rounded bg-surface border border-border text-ink hover:border-accent">
            🛡️ Regulators ({REGULATORS.length})
          </a>
          <a href="#scams" className="px-2.5 py-1 rounded bg-surface border border-border text-ink hover:border-accent">
            ⚠️ Scam Modules ({SCAM_MODULES.length})
          </a>
          <Link href="/learn/glossary" className="px-2.5 py-1 rounded bg-surface border border-border text-ink hover:border-accent">
            📘 Glossary ({GLOSSARY_TERMS.length})
          </Link>
        </div>
      </div>

      {/* NEW SECTION: 10 INVESTOR RESILIENCE CARDS */}
      <div id="resilience-cards" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-ink font-inktrap flex items-center gap-2">
            <span>🛡️</span> 20 Investor-Resilience Cards: Tactics to Verify
          </h2>
          <span className="text-xs text-ink-muted font-mono">[ Protection Framework ]</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
          {RESILIENCE_CARDS.map((card) => (
            <Link key={card.id} href={card.link as any} className="block group">
              <Card className="h-full border-border group-hover:border-accent transition-all p-5 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{card.icon}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-surface-sunken text-accent font-mono border border-border">
                      Verification Card
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-ink group-hover:text-accent transition-colors font-mono">
                    {card.title}
                  </h3>
                  <p className="text-xs text-ink-muted leading-relaxed font-sans">
                    {card.concept}
                  </p>
                </div>
                <div className="pt-2 border-t border-border flex justify-between items-center text-xs font-bold text-accent font-mono">
                  <span>{card.action}</span>
                  <span>→</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Module 1: Core Lessons */}
      <div id="lessons" className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-ink font-inktrap flex items-center gap-2">
            <span>📖</span> Core Financial Literacy Lessons
          </h2>
          <span className="text-xs text-ink-muted font-mono">[ 3-Min Reads ]</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {LESSONS.map((lesson) => {
            const title = lesson.title[langKey] || lesson.title.en;
            const summary = lesson.summary[langKey] || lesson.summary.en;

            return (
              <Link
                key={lesson.slug}
                href={`/learn/lessons/${lesson.slug}`}
                className="block group"
              >
                <Card className="h-full border-border group-hover:border-accent transition-all flex flex-col justify-between">
                  <CardHeader className="p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <Chip icon={<IconBook />}>{lesson.estimatedMinutes} min read</Chip>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-surface-sunken text-accent font-mono border border-border">
                        {lesson.category}
                      </span>
                    </div>
                    <CardTitle className="text-base font-bold text-ink group-hover:text-accent transition-colors">
                      {title}
                    </CardTitle>
                    <CardDescription className="text-xs text-ink-muted leading-relaxed">
                      {summary}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="bg-surface-sunken border-t border-border py-2.5 px-5 text-xs text-accent font-bold font-mono flex justify-between items-center">
                    <span>Read Full Lesson</span>
                    <span>→</span>
                  </CardFooter>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Module 2: Know the Instrument Hub */}
      <div id="instruments" className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-ink font-inktrap flex items-center gap-2">
            <span>🏛️</span> Know the Instrument Knowledge Hub
          </h2>
          <span className="text-xs text-ink-muted font-mono">[ Regulated Assets ]</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FINANCIAL_INSTRUMENTS.map((inst) => {
            const name = inst.name[langKey] || inst.name.en;
            const whatIsIt = inst.whatIsIt[langKey] || inst.whatIsIt.en;

            return (
              <Link
                key={inst.slug}
                href={`/learn/instruments/${inst.slug}`}
                className="block group"
              >
                <Card className="h-full border-border group-hover:border-accent transition-all flex flex-col justify-between">
                  <CardHeader className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-bold text-ink group-hover:text-accent transition-colors">
                        {name}
                      </CardTitle>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-accent-soft text-accent">
                        {inst.regulator}
                      </span>
                    </div>
                    <div className="text-[11px] text-ink-muted font-mono">
                      Benchmark: {inst.typicalReturnsBenchmark}
                    </div>
                    <p className="text-xs text-ink-muted leading-relaxed line-clamp-3">
                      {whatIsIt}
                    </p>
                  </CardHeader>
                  <CardFooter className="bg-surface-sunken border-t border-border py-2 px-4 text-[11px] text-accent font-bold font-mono flex justify-between items-center">
                    <span>View Instrument Mechanics</span>
                    <span>→</span>
                  </CardFooter>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Module 3: Regulators Map */}
      <div id="regulators" className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-ink font-inktrap flex items-center gap-2">
            <span>🛡️</span> Statutory Regulators &amp; Market Infrastructure
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {REGULATORS.map((reg) => {
            const whatTheyDo = reg.whatTheyDo[langKey] || reg.whatTheyDo.en;

            return (
              <Link
                key={reg.slug}
                href={`/learn/regulators#${reg.slug}`}
                className="block group"
              >
                <Card className="h-full border-border group-hover:border-accent transition-all p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-ink group-hover:text-accent transition-colors">
                      {reg.name}
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-surface-sunken text-ink-muted font-mono">
                      {reg.role}
                    </span>
                  </div>
                  <p className="text-xs text-ink-muted leading-relaxed">
                    {whatTheyDo}
                  </p>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Module 4: Scam Awareness Modules */}
      <div id="scams" className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-ink font-inktrap flex items-center gap-2 text-risk-high-text">
            <span>⚠️</span> Scam Awareness &amp; Case Studies
          </h2>
          <span className="text-xs text-risk-high-text font-mono font-bold">[ Prevention ]</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SCAM_MODULES.map((scam) => {
            const title = scam.title[langKey] || scam.title.en;
            const summary = scam.summary[langKey] || scam.summary.en;

            return (
              <Link
                key={scam.slug}
                href={`/learn/scams/${scam.slug}`}
                className="block group"
              >
                <Card className="h-full border-risk-high-border/40 group-hover:border-accent transition-all flex flex-col justify-between">
                  <CardHeader className="p-4 space-y-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-risk-high-bg text-risk-high-text font-mono self-start border border-risk-high-border/30">
                      {scam.archetype}
                    </span>
                    <CardTitle className="text-sm font-bold text-ink group-hover:text-accent transition-colors">
                      {title}
                    </CardTitle>
                    <p className="text-xs text-ink-muted leading-relaxed">
                      {summary}
                    </p>
                  </CardHeader>
                  <CardFooter className="bg-surface-sunken border-t border-border py-2 px-4 text-[11px] text-risk-high-text font-bold font-mono flex justify-between items-center">
                    <span>Inspect Warning Signs</span>
                    <span>→</span>
                  </CardFooter>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
