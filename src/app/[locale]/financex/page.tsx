'use client';

import React, { useState, useRef } from 'react';
import { Link } from '@/i18n/routing';
import {
  Button,
  Chip,
  Card,
} from '@/components/ui';
import { FX1_ASSETS } from '@/lib/financeX/fx1';
import {
  MOCK_COURSES,
  MOCK_DEMO_HOLDINGS,
  MOCK_INSTRUMENTS,
} from '@/lib/financeX/fx1/mockData';
import {
  TAMIL_COURSES,
  TAMIL_TOPICS,
  TAMIL_LESSONS,
} from '@/lib/financeX/fx1/tamilContent';

export default function FinanceXHubPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'ta'>('en');
  const [activeCourseId, setActiveCourseId] = useState<number>(1);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const activeCourse = MOCK_COURSES.find((c) => c.course_id === activeCourseId) || MOCK_COURSES[0];
  const activeTamilCourse = TAMIL_COURSES[activeCourseId] || TAMIL_COURSES[1];

  const holdingsWithDetails = MOCK_DEMO_HOLDINGS.map((h) => {
    const inst = MOCK_INSTRUMENTS.find((i) => i.instrument_id === h.instrument_id);
    const currentPrice = inst ? inst.simulated_price : h.avg_buy_price;
    const pnl = (currentPrice - h.avg_buy_price) * h.quantity;
    return {
      ...h,
      symbol: inst?.symbol ?? `INST-${h.instrument_id}`,
      name: inst?.name ?? 'Demo Instrument',
      currentPrice,
      pnl,
      categoryTag: inst?.category_tag ?? 'Asset',
    };
  });

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-8 space-y-16">
      {/* 1. HERO PLATFORM SHOWCASE */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-surface via-surface-sunken to-surface border border-accent/30 p-6 sm:p-10 shadow-soft">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-highlight/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left: Headline & Core Identity */}
          <div className="lg:col-span-6 space-y-5 text-left">
            <div className="flex flex-wrap items-center gap-2">
              <span className="tag-bracket text-xs">
                FINANCEX UNIFIED PLATFORM
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[11px] font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                FX1 INTEGRATED
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black font-inktrap tracking-tight text-ink leading-[1.08]">
              Finance<span className="text-accent">X</span> Experience.
            </h1>

            <p className="text-ink-muted text-base sm:text-lg leading-relaxed max-w-[50ch]">
              Welcome to the complete FinanceX ecosystem: interactive financial education, real-time ArgusFin Shield fraud defense, and cryptographic Web3 verification.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Button
                variant="primary"
                size="lg"
                onClick={togglePlay}
                className="font-extrabold text-accent-ink shadow-soft flex items-center gap-2"
              >
                <span>{isPlaying ? '⏸ Pause Tour' : '▶ Watch FinanceX Tour'}</span>
              </Button>
              <Link href="/learn">
                <Button variant="secondary" size="lg" className="font-bold">
                  Browse FX Academy →
                </Button>
              </Link>
              <Link href="/check">
                <Button variant="quiet" size="lg" className="font-bold">
                  Launch Shield →
                </Button>
              </Link>
            </div>

            {/* Platform Highlights */}
            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border">
              <div>
                <span className="block text-2xl font-black font-mono text-ink">4+</span>
                <span className="text-xs text-ink-muted">FX1 Core Tracks</span>
              </div>
              <div>
                <span className="block text-2xl font-black font-mono text-accent">7</span>
                <span className="text-xs text-ink-muted">AI Threat Shields</span>
              </div>
              <div>
                <span className="block text-2xl font-black font-mono text-emerald-400">100%</span>
                <span className="text-xs text-ink-muted">In-Browser Privacy</span>
              </div>
            </div>
          </div>

          {/* Right: Embedded Interactive Video Player */}
          <div className="lg:col-span-6">
            <div className="relative rounded-2xl overflow-hidden border-2 border-accent/40 bg-black shadow-glow group">
              <video
                ref={videoRef}
                src={FX1_ASSETS.bootVideoUrl}
                playsInline
                loop
                muted={isMuted}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                className="w-full h-auto aspect-video object-cover"
              />

              {/* Video Overlay Controls */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-black/60 backdrop-blur-md border border-white/20 text-[11px] font-mono text-white">
                    <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                    <span>FinanceX Boot Video</span>
                  </div>
                  <button
                    onClick={toggleMute}
                    className="p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white text-xs border border-white/20"
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? '🔇 Unmute' : '🔊 Mute'}
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <button
                    onClick={togglePlay}
                    className="px-4 py-2 rounded-xl bg-accent text-accent-ink font-bold text-xs shadow-soft hover:scale-105 transition-transform flex items-center gap-2"
                  >
                    {isPlaying ? '⏸ Pause' : '▶ Play'}
                  </button>
                  <span className="text-[11px] font-mono text-white/80">
                    Resolution: Full HD · MP4
                  </span>
                </div>
              </div>

              {/* Floating Play Button When Paused */}
              {!isPlaying && (
                <button
                  onClick={togglePlay}
                  className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-accent/90 hover:bg-accent text-accent-ink flex items-center justify-center text-2xl shadow-glow transition-transform hover:scale-110 cursor-pointer"
                  aria-label="Play FinanceX Platform Video"
                >
                  ▶
                </button>
              )}
            </div>
            <p className="text-center text-xs text-ink-muted mt-2 font-mono">
              ⚡ FinanceX Official Overview & Architecture Demo
            </p>
          </div>
        </div>
      </section>

      {/* 2. FX1 INTERACTIVE COURSE CATALOG */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="tag-bracket">INTERACTIVE CURRICULUM</span>
            <h2 className="text-3xl font-black font-inktrap text-ink tracking-tight mt-1">
              FX1 Masterclass Tracks
            </h2>
            <p className="text-ink-muted text-sm mt-1">
              Step-by-step masterclasses directly integrated from the FX1 curriculum.
            </p>
          </div>
          <Link href="/learn">
            <Button variant="secondary" size="sm">
              Explore All 26 Lessons →
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {MOCK_COURSES.map((course) => {
            const isSelected = course.course_id === activeCourseId;
            return (
              <div
                key={course.course_id}
                onClick={() => setActiveCourseId(course.course_id)}
                className={`cursor-pointer rounded-2xl border p-5 transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-accent bg-accent-soft/30 shadow-soft scale-[1.02]'
                    : 'border-border bg-surface hover:border-accent/50 hover:bg-surface-sunken'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-surface-sunken border border-border text-accent">
                      {course.level || 'INTERMEDIATE'}
                    </span>
                    <span className="text-xs font-mono text-ink-muted">
                      ★ {(course.rating ?? 4.8).toFixed(1)}
                    </span>
                  </div>
                  <h3 className="font-bold text-ink text-base font-inktrap leading-snug">
                    {course.course_title}
                  </h3>
                  <p className="text-xs text-ink-muted line-clamp-3 leading-relaxed">
                    {course.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-border/60 mt-4 flex items-center justify-between text-xs font-mono text-ink-muted">
                  <span>{course.total_lessons || 10} Lessons</span>
                  <span className="text-accent font-bold">
                    {isSelected ? 'Selected ✓' : 'View →'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Course Deep-Dive Card */}
        <Card className="border-accent/40 bg-surface-sunken p-6 rounded-2xl">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-8 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-accent font-bold uppercase">
                  ACTIVE SYLLABUS SPOTLIGHT
                </span>
                <span className="text-xs font-mono text-ink-muted">
                  · Instructor: {activeCourse.author || 'FinanceX Faculty'}
                </span>
              </div>
              <h3 className="text-2xl font-black font-inktrap text-ink">
                {selectedLanguage === 'ta' && activeTamilCourse ? activeTamilCourse.course_title : activeCourse.course_title}
              </h3>
              <p className="text-sm text-ink-muted leading-relaxed">
                {selectedLanguage === 'ta' && activeTamilCourse ? activeTamilCourse.description : activeCourse.description}
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <Chip>Hours: {activeCourse.estimated_hours || 10}h</Chip>
                <Chip>Lessons: {activeCourse.total_lessons || 12}</Chip>
                <Chip>Rating: {(activeCourse.rating ?? 4.8).toFixed(1)} / 5.0</Chip>
              </div>
            </div>
            <div className="md:col-span-4 flex flex-col gap-2">
              <Link href="/learn">
                <Button variant="primary" size="lg" className="w-full justify-center font-extrabold text-accent-ink">
                  Launch Interactive Course
                </Button>
              </Link>
              <Link href="/learn/simulators/sip">
                <Button variant="secondary" size="md" className="w-full justify-center">
                  Try Accompanying Simulator
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </section>

      {/* 3. BILINGUAL TAMIL & ENGLISH KNOWLEDGE SPOTLIGHT */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="tag-bracket">VERNACULAR EMPOWERMENT</span>
            <h2 className="text-3xl font-black font-inktrap text-ink tracking-tight mt-1">
              Bilingual Knowledge Engine (தமிழ் & English)
            </h2>
            <p className="text-ink-muted text-sm mt-1">
              FinanceX bridges language barriers with verified vernacular financial education.
            </p>
          </div>
          <div className="inline-flex rounded-lg border border-border bg-surface p-1">
            <button
              onClick={() => setSelectedLanguage('en')}
              className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                selectedLanguage === 'en'
                  ? 'bg-accent text-accent-ink shadow-xs'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setSelectedLanguage('ta')}
              className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                selectedLanguage === 'ta'
                  ? 'bg-accent text-accent-ink shadow-xs'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              தமிழ் (Tamil)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Tamil Topic 1 */}
          <Card className="bg-surface p-5 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">📜</span>
              <h3 className="font-bold text-ink font-inktrap text-sm">
                {selectedLanguage === 'ta' ? TAMIL_TOPICS[1].topic_name : 'Securities Markets Overview'}
              </h3>
            </div>
            <p className="text-xs text-ink-muted leading-relaxed">
              {selectedLanguage === 'ta'
                ? TAMIL_TOPICS[1].description
                : 'Primary and secondary markets, exchanges, depositories, and SEBI regulatory frameworks.'}
            </p>
            <div className="pt-2 border-t border-border/60 text-[11px] font-mono text-accent">
              Lesson: {selectedLanguage === 'ta' ? TAMIL_LESSONS[1]?.title : 'Fundamentals of Futures'}
            </div>
          </Card>

          {/* Card 2: Tamil Topic 2 */}
          <Card className="bg-surface p-5 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">💡</span>
              <h3 className="font-bold text-ink font-inktrap text-sm">
                {selectedLanguage === 'ta' ? TAMIL_TOPICS[3].topic_name : 'Options & Risk Greeks'}
              </h3>
            </div>
            <p className="text-xs text-ink-muted leading-relaxed">
              {selectedLanguage === 'ta'
                ? TAMIL_TOPICS[3].description
                : 'Delta, Gamma, Theta, Vega, Rho, Bull Call Spreads, and Iron Condors.'}
            </p>
            <div className="pt-2 border-t border-border/60 text-[11px] font-mono text-accent">
              Lesson: {selectedLanguage === 'ta' ? TAMIL_LESSONS[3]?.title : 'Options Greeks Mechanics'}
            </div>
          </Card>

          {/* Card 3: Tamil Topic 3 */}
          <Card className="bg-surface p-5 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">🛡️</span>
              <h3 className="font-bold text-ink font-inktrap text-sm">
                {selectedLanguage === 'ta' ? TAMIL_TOPICS[5].topic_name : 'SEBI Regulations & Compliance'}
              </h3>
            </div>
            <p className="text-xs text-ink-muted leading-relaxed">
              {selectedLanguage === 'ta'
                ? TAMIL_TOPICS[5].description
                : 'Insider trading laws, Takeover Code, PFUTP regulations, and investor grievance channels.'}
            </p>
            <div className="pt-2 border-t border-border/60 text-[11px] font-mono text-emerald-400">
              {selectedLanguage === 'ta' ? 'அதிகாரப்பூர்வ SEBI விதிகள்' : 'Verified SEBI Standards'}
            </div>
          </Card>
        </div>
      </section>

      {/* 4. FX1 PORTFOLIO RISK & HOLDINGS ARENA */}
      <section className="space-y-6">
        <div className="space-y-2">
          <span className="tag-bracket">PRACTICE ARENA</span>
          <h2 className="text-3xl font-black font-inktrap text-ink tracking-tight">
            FX1 Portfolio Simulation Lab
          </h2>
          <p className="text-ink-muted text-sm">
            Experience risk diversification and asset tracking with realistic paper market portfolios.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-surface overflow-hidden">
          <div className="p-4 sm:p-6 bg-surface-sunken border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono text-ink-muted block uppercase">DEMO VIRTUAL PORTFOLIO</span>
              <span className="text-2xl font-black font-mono text-ink">₹ 14,82,450.00</span>
              <span className="text-xs font-mono text-emerald-400 ml-2 font-bold">+12.4% Overall Gain</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-surface border border-border text-xs font-mono text-ink-muted">
                Status: Paper Trade Simulation
              </span>
              <Link href="/calculator">
                <Button variant="secondary" size="sm">
                  CAGR Reality Check →
                </Button>
              </Link>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-surface-sunken/50 border-b border-border text-ink-muted font-mono uppercase text-[11px]">
                <tr>
                  <th className="p-4">Instrument</th>
                  <th className="p-4">Qty</th>
                  <th className="p-4">Avg Buy</th>
                  <th className="p-4">Current Price</th>
                  <th className="p-4">Simulated P&L</th>
                  <th className="p-4">Asset Class</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {holdingsWithDetails.map((h, i) => {
                  const isPositive = h.pnl >= 0;
                  return (
                    <tr key={i} className="hover:bg-surface-sunken/40 transition-colors">
                      <td className="p-4 font-bold text-ink font-mono">{h.symbol}</td>
                      <td className="p-4 font-mono text-ink-muted">{h.quantity}</td>
                      <td className="p-4 font-mono text-ink-muted">₹{h.avg_buy_price.toLocaleString()}</td>
                      <td className="p-4 font-mono text-ink font-bold">₹{h.currentPrice.toLocaleString()}</td>
                      <td className={`p-4 font-mono font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isPositive ? '+' : ''}₹{h.pnl.toLocaleString()}
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded bg-surface-sunken border border-border text-[10px] font-mono text-ink-muted">
                          {h.categoryTag}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 5. UNIFIED THREE-PILLAR ACTION LAUNCHER */}
      <section className="rounded-3xl border border-accent/40 bg-gradient-to-r from-accent/10 via-surface to-highlight/10 p-8 sm:p-12 text-center space-y-6">
        <div className="max-w-2xl mx-auto space-y-3">
          <span className="tag-bracket">EXPERIENCE THE COMPLETE PLATFORM</span>
          <h2 className="text-3xl sm:text-4xl font-black font-inktrap text-ink tracking-tight">
            Ready to Explore FinanceX?
          </h2>
          <p className="text-ink-muted text-sm sm:text-base leading-relaxed">
            From interactive learning tracks to deterministic scam shields and tamper-proof Web3 certificates, FinanceX protects and empowers every investor.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link href="/learn">
            <Button variant="primary" size="lg" className="font-extrabold text-accent-ink shadow-glow">
              01 · Start Learning (Academy)
            </Button>
          </Link>
          <Link href="/check">
            <Button variant="secondary" size="lg" className="font-bold">
              02 · Check Suspicious Offer (Shield)
            </Button>
          </Link>
          <Link href="/prove">
            <Button variant="quiet" size="lg" className="font-bold">
              03 · Verify Credentials (Web3)
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
