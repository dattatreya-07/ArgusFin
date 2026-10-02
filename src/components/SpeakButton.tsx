'use client';

import React, { useState, useEffect } from 'react';
import { Lang } from '@/lib/types';
import { selectVoice, LOCALE_MAP } from '@/lib/voice/selectVoice';

interface SpeakButtonProps {
  text: string;
  lang: Lang;
  className?: string;
  stopLabel?: string;
  speakLabel?: string;
  unavailableLabel?: string;
}

import { prepareTextForTTS, segmentSentences } from '@/lib/voice/tts';

export function SpeakButton({
  text,
  lang,
  className = '',
  stopLabel,
  speakLabel,
  unavailableLabel,
}: SpeakButtonProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasVoice, setHasVoice] = useState<boolean>(true);
  const [voicesLoaded, setVoicesLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setHasVoice(false);
      return;
    }

    const checkVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        setVoicesLoaded(true);
        const match = selectVoice({ language: lang, voices });
        setHasVoice(match !== null);
      }
    };

    checkVoice();

    window.speechSynthesis.onvoiceschanged = () => {
      checkVoice();
    };

    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [lang]);

  const toggleSpeak = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const voices = window.speechSynthesis.getVoices();
    const voice = selectVoice({ language: lang, voices });

    // Strict invariant: If Tamil is requested and no Tamil voice exists, refuse to speak in English/Hindi
    if (!voice && lang === 'ta') {
      setHasVoice(false);
      return;
    }

    const chunks = segmentSentences(text, lang);
    if (chunks.length === 0) return;

    window.speechSynthesis.cancel(); // Cancel any existing audio
    setIsSpeaking(true);

    let currentIdx = 0;

    const playNext = () => {
      if (currentIdx >= chunks.length) {
        setIsSpeaking(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(chunks[currentIdx]);
      utterance.lang = LOCALE_MAP[lang] || 'en-IN';
      if (voice) {
        utterance.voice = voice;
      }
      utterance.rate = lang === 'ta' || lang === 'hi' ? 0.92 : 1.0;
      utterance.pitch = 1.0;

      utterance.onend = () => {
        currentIdx++;
        playNext();
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
    };

    playNext();
  };

  const defaultSpeakLabel =
    lang === 'ta' ? 'தமிழில் படிக்க (Listen in Tamil)' : lang === 'hi' ? 'बोलकर सुनें' : 'Read Aloud';
  const defaultStopLabel =
    lang === 'ta' ? 'நிறுத்து (Stop)' : lang === 'hi' ? 'रोकें' : 'Stop Reading';
  const defaultUnavailableLabel =
    lang === 'ta'
      ? 'தமிழ் குரல் சாதனத்தில் கிடைக்கவில்லை (Tamil voice unavailable)'
      : 'Voice unavailable';

  if (!hasVoice && lang === 'ta' && voicesLoaded) {
    return (
      <span
        title={unavailableLabel || defaultUnavailableLabel}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 border border-zinc-800 text-zinc-500 cursor-not-allowed"
      >
        <span>🔇</span>
        <span>{unavailableLabel || defaultUnavailableLabel}</span>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleSpeak}
      title={isSpeaking ? stopLabel || defaultStopLabel : speakLabel || defaultSpeakLabel}
      aria-label={isSpeaking ? stopLabel || defaultStopLabel : speakLabel || defaultSpeakLabel}
      className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer shadow-xs ${
        isSpeaking
          ? 'bg-rose-950 border border-rose-700 text-rose-300 ring-1 ring-rose-500 animate-pulse'
          : 'bg-zinc-800 border border-zinc-700 text-zinc-200 hover:bg-zinc-700 hover:text-white'
      } ${className}`}
    >
      <span>{isSpeaking ? '⏹' : '🔊'}</span>
      <span>{isSpeaking ? stopLabel || defaultStopLabel : speakLabel || defaultSpeakLabel}</span>
    </button>
  );
}
