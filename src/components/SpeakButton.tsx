'use client';

import React, { useState, useEffect } from 'react';
import { Lang } from '@/lib/types';
import { speechService, SpeechPlaybackState } from '@/lib/voice/speechService';
import { VoiceLocale } from '@/lib/voice/selectVoice';

interface SpeakButtonProps {
  text: string;
  lang: Lang | VoiceLocale;
  className?: string;
  stopLabel?: string;
  speakLabel?: string;
  unavailableLabel?: string;
}

export function SpeakButton({
  text,
  lang,
  className = '',
  stopLabel,
  speakLabel,
  unavailableLabel,
}: SpeakButtonProps) {
  const [speechState, setSpeechState] = useState<SpeechPlaybackState>('IDLE');
  const [hasVoice, setHasVoice] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = speechService.addStateListener((s) => setSpeechState(s));

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setHasVoice(speechService.hasVoiceForLocale(lang as VoiceLocale));
    } else {
      setHasVoice(false);
    }

    return () => {
      unsubscribe();
      speechService.stop();
    };
  }, [lang]);

  const isSpeaking = speechState === 'SPEAKING' || speechState === 'PAUSED';

  const toggleSpeak = () => {
    if (isSpeaking) {
      speechService.stop();
    } else {
      speechService.speak(text, lang as VoiceLocale);
    }
  };

  const defaultSpeakLabel =
    lang === 'ta'
      ? 'தமிழில் படிக்க (Listen in Tamil)'
      : lang === 'ml'
      ? 'മലയാളത്തിൽ കേൾക്കുക (Listen in Malayalam)'
      : lang === 'hi'
      ? 'बोलकर सुनें (Listen in Hindi)'
      : 'Read Aloud';

  const defaultStopLabel =
    lang === 'ta'
      ? 'நிறுத்து (Stop)'
      : lang === 'ml'
      ? 'നിർത്തുക (Stop)'
      : lang === 'hi'
      ? 'रोकें (Stop)'
      : 'Stop Reading';

  if (!hasVoice && speechState === 'UNAVAILABLE') {
    return (
      <span className="text-[11px] font-mono text-ink-muted italic">
        {unavailableLabel || '(Voice unavailable on device)'}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleSpeak}
      title={isSpeaking ? stopLabel || defaultStopLabel : speakLabel || defaultSpeakLabel}
      aria-label={isSpeaking ? stopLabel || defaultStopLabel : speakLabel || defaultSpeakLabel}
      className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer shadow-soft border ${
        isSpeaking
          ? 'bg-risk-high-bg border-risk-high-border text-risk-high-text ring-1 ring-risk-high-border animate-pulse'
          : 'bg-surface border-border text-ink hover:border-accent hover:text-accent'
      } ${className}`}
    >
      <span>{isSpeaking ? '⏹' : '🔊'}</span>
      <span>{isSpeaking ? stopLabel || defaultStopLabel : speakLabel || defaultSpeakLabel}</span>
    </button>
  );
}

