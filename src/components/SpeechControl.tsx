'use client';

import React, { useState, useEffect } from 'react';
import { VoiceLocale } from '@/lib/voice/selectVoice';
import { speechService, SpeechPlaybackState } from '@/lib/voice/speechService';

export interface SpeechControlProps {
  text: string;
  locale?: VoiceLocale;
  className?: string;
  compact?: boolean;
}

export function SpeechControl({
  text,
  locale = 'en',
  className = '',
  compact = false,
}: SpeechControlProps) {
  const [state, setState] = useState<SpeechPlaybackState>('IDLE');
  const [hasVoice, setHasVoice] = useState<boolean>(true);

  useEffect(() => {
    // Attach listener to central speech service state
    const unsubscribe = speechService.addStateListener((s) => setState(s));

    // Check voice support
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setHasVoice(speechService.hasVoiceForLocale(locale));
    } else {
      setHasVoice(false);
    }

    // React Lifecycle Safety: Cancel active speech on component unmount
    return () => {
      unsubscribe();
      speechService.stop();
    };
  }, [locale]);

  const handlePlay = () => {
    speechService.speak(text, locale);
  };

  const handlePause = () => {
    speechService.pause();
  };

  const handleResume = () => {
    speechService.resume();
  };

  const handleStop = () => {
    speechService.stop();
  };

  const isSpeaking = state === 'SPEAKING';
  const isPaused = state === 'PAUSED';
  const isIdle = state === 'IDLE';

  if (!hasVoice && state === 'UNAVAILABLE') {
    return (
      <span className="text-[11px] font-mono text-ink-muted italic">
        (Voice unavailable on this device)
      </span>
    );
  }

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1.5 ${className}`}>
        {isIdle && (
          <button
            type="button"
            onClick={handlePlay}
            aria-label="Listen to explanation"
            title="Listen to explanation"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-surface hover:border-accent text-ink text-xs font-semibold cursor-pointer shadow-soft transition-all"
          >
            <span>🔊</span>
            <span>Listen</span>
          </button>
        )}

        {isSpeaking && (
          <div className="inline-flex items-center gap-1">
            <button
              type="button"
              onClick={handlePause}
              aria-label="Pause speech"
              title="Pause speech"
              className="px-2.5 py-1.5 rounded-lg border border-border bg-surface text-ink text-xs font-semibold hover:border-accent cursor-pointer"
            >
              ⏸ Pause
            </button>
            <button
              type="button"
              onClick={handleStop}
              aria-label="Stop speech"
              title="Stop speech"
              className="px-2.5 py-1.5 rounded-lg border border-risk-high-border bg-risk-high-bg text-risk-high-text text-xs font-bold hover:opacity-90 cursor-pointer animate-pulse"
            >
              ⏹ Stop
            </button>
          </div>
        )}

        {isPaused && (
          <div className="inline-flex items-center gap-1">
            <button
              type="button"
              onClick={handleResume}
              aria-label="Resume speech"
              title="Resume speech"
              className="px-2.5 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20 cursor-pointer"
            >
              ▶ Resume
            </button>
            <button
              type="button"
              onClick={handleStop}
              aria-label="Stop speech"
              title="Stop speech"
              className="px-2.5 py-1.5 rounded-lg border border-border bg-surface text-ink text-xs font-semibold hover:border-accent cursor-pointer"
            >
              ⏹ Stop
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 p-1.5 rounded-xl border border-border bg-surface-sunken ${className}`}>
      {isIdle && (
        <button
          type="button"
          onClick={handlePlay}
          aria-label="Listen"
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-border hover:border-accent text-ink text-xs font-bold cursor-pointer transition shadow-soft"
        >
          <span>🔊</span>
          <span>Listen</span>
        </button>
      )}

      {isSpeaking && (
        <>
          <button
            type="button"
            onClick={handlePause}
            aria-label="Pause"
            className="px-3 py-1.5 rounded-lg bg-surface border border-border hover:border-accent text-ink text-xs font-bold cursor-pointer transition"
          >
            ⏸ Pause
          </button>
          <button
            type="button"
            onClick={handleStop}
            aria-label="Stop"
            className="px-3 py-1.5 rounded-lg bg-risk-high-bg border border-risk-high-border text-risk-high-text text-xs font-bold cursor-pointer transition animate-pulse"
          >
            ⏹ Stop
          </button>
        </>
      )}

      {isPaused && (
        <>
          <button
            type="button"
            onClick={handleResume}
            aria-label="Resume"
            className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold cursor-pointer transition"
          >
            ▶ Resume
          </button>
          <button
            type="button"
            onClick={handleStop}
            aria-label="Stop"
            className="px-3 py-1.5 rounded-lg bg-surface border border-border hover:border-accent text-ink text-xs font-bold cursor-pointer transition"
          >
            ⏹ Stop
          </button>
        </>
      )}
    </div>
  );
}
