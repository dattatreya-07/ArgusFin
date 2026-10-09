'use client';

import React, { useState, useRef } from 'react';
import { Link } from '@/i18n/routing';
import { Button, Card, Chip } from '@/components/ui';
import { FX1_ASSETS } from '@/lib/financeX/fx1';
import { MOCK_COURSES } from '@/lib/financeX/fx1/mockData';

export function FinanceXHomeShowcase() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
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

  return (
    <section className="relative overflow-hidden rounded-3xl border border-accent/40 bg-surface/90 backdrop-blur-md p-6 sm:p-10 shadow-soft space-y-8">
      {/* Background Neon Elements */}
      <div className="absolute top-0 right-1/4 w-72 h-72 bg-accent/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-highlight/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header Row */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/80 pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="tag-bracket text-xs">FEATURED SYSTEM</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[11px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              FINANCEX SUITE
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black font-inktrap text-ink tracking-tight">
            Finance<span className="text-accent">X</span> Live Platform Tour
          </h2>
          <p className="text-ink-muted text-sm sm:text-base max-w-[60ch]">
            Experience how the integrated FX1 curriculum, real-time scam intelligence, and Web3 verification operate together in one seamless platform.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/financex">
            <Button variant="primary" size="md" className="font-extrabold text-accent-ink shadow-soft">
              Open FinanceX Hub →
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Grid: Video Player + Platform Quick Features */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Video Player Column */}
        <div className="lg:col-span-7">
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

            {/* Video Overlay Control Bar */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-black/70 backdrop-blur-md border border-white/20 text-[11px] font-mono text-white">
                  <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  FinanceX Boot Video
                </span>
                <button
                  onClick={toggleMute}
                  className="p-1.5 rounded-lg bg-black/70 hover:bg-black/90 text-white text-xs border border-white/20"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? '🔇 Unmute' : '🔊 Mute'}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={togglePlay}
                  className="px-4 py-1.5 rounded-xl bg-accent text-accent-ink font-bold text-xs shadow-soft hover:scale-105 transition-transform flex items-center gap-1.5"
                >
                  {isPlaying ? '⏸ Pause' : '▶ Play'}
                </button>
                <span className="text-[10px] font-mono text-white/70">
                  Full HD · Click to watch
                </span>
              </div>
            </div>

            {/* Centered Play Button When Paused */}
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
          <div className="flex items-center justify-between text-xs text-ink-muted mt-2 px-1">
            <span className="font-mono">📹 FinanceX Architecture & Walkthrough</span>
            <span className="font-mono text-accent">Status: 1080p Ready</span>
          </div>
        </div>

        {/* Courses & Capabilities Column */}
        <div className="lg:col-span-5 space-y-4">
          <div className="text-xs font-mono font-bold text-ink-muted uppercase tracking-wider">
            Integrated FX1 Tracks Included:
          </div>

          <div className="space-y-3">
            {MOCK_COURSES.slice(0, 3).map((course) => (
              <Link
                key={course.course_id}
                href="/financex"
                className="block p-3.5 rounded-xl border border-border bg-surface hover:border-accent/50 hover:bg-surface-sunken transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-accent uppercase">
                    {course.level || 'INTERMEDIATE'}
                  </span>
                  <span className="text-xs font-mono text-ink-muted">
                    {course.total_lessons || 10} Lessons · ★ {(course.rating ?? 4.8).toFixed(1)}
                  </span>
                </div>
                <h4 className="font-bold text-ink text-sm mt-1 group-hover:text-accent transition-colors">
                  {course.course_title}
                </h4>
                <p className="text-xs text-ink-muted line-clamp-1 mt-0.5">
                  {course.description}
                </p>
              </Link>
            ))}
          </div>

          <div className="pt-2 flex items-center gap-3">
            <Link href="/financex" className="flex-1">
              <Button variant="secondary" size="md" className="w-full justify-center text-xs font-bold">
                View All Courses & Portfolio Lab →
              </Button>
            </Link>
            <Link href="/learn" className="flex-1">
              <Button variant="quiet" size="md" className="w-full justify-center text-xs font-bold">
                Open Academy →
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
