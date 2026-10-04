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

  const playFallbackAudio = (chunks: string[]) => {
    if (chunks.length === 0) return;
    setIsSpeaking(true);

    let idx = 0;
    const playChunk = () => {
      if (idx >= chunks.length) {
        setIsSpeaking(false);
        return;
      }

      const chunkText = chunks[idx];
      const encoded = encodeURIComponent(chunkText.substring(0, 200));
      const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encoded}&tl=${lang === 'ta' ? 'ta' : lang === 'hi' ? 'hi' : 'en'}&client=tw-ob`;

      const audio = new Audio(ttsUrl);
      audio.onended = () => {
        idx++;
        playChunk();
      };
      audio.onerror = () => {
        setIsSpeaking(false);
      };
      audio.play().catch(() => {
        setIsSpeaking(false);
      });
    };

    playChunk();
  };

  const toggleSpeak = () => {
    if (isSpeaking) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
      return;
    }

    const chunks = segmentSentences(text, lang);
    if (chunks.length === 0) return;

    const voices = typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis.getVoices() : [];
    const voice = selectVoice({ language: lang, voices });

    // If local system voice is available, use SpeechSynthesis
    if (voice && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(true);

      let currentIdx = 0;
      const playNext = () => {
        if (currentIdx >= chunks.length) {
          setIsSpeaking(false);
          return;
        }

        const utterance = new SpeechSynthesisUtterance(chunks[currentIdx]);
        utterance.lang = LOCALE_MAP[lang] || 'en-IN';
        utterance.voice = voice;
        utterance.rate = lang === 'ta' || lang === 'hi' ? 0.92 : 1.0;
        utterance.pitch = 1.0;

        utterance.onend = () => {
          currentIdx++;
          playNext();
        };

        utterance.onerror = () => {
          // Fall back to Audio TTS on utterance error
          playFallbackAudio(chunks.slice(currentIdx));
        };

        window.speechSynthesis.speak(utterance);
      };

      playNext();
    } else {
      // Fall back to universal online TTS Audio player (guarantees Tamil speech on any browser)
      playFallbackAudio(chunks);
    }
  };

  const defaultSpeakLabel =
    lang === 'ta' ? 'தமிழில் படிக்க (Listen in Tamil)' : lang === 'hi' ? 'बोलकर सुनें' : 'Read Aloud';
  const defaultStopLabel =
    lang === 'ta' ? 'நிறுத்து (Stop)' : lang === 'hi' ? 'रोकें' : 'Stop Reading';
  const defaultUnavailableLabel =
    lang === 'ta'
      ? 'தமிழ் குரல் சாதனத்தில் கிடைக்கவில்லை (Tamil voice unavailable)'
      : 'Voice unavailable';



  return (
    <button
      type="button"
      onClick={toggleSpeak}
      title={isSpeaking ? stopLabel || defaultStopLabel : speakLabel || defaultSpeakLabel}
      aria-label={isSpeaking ? stopLabel || defaultStopLabel : speakLabel || defaultSpeakLabel}
      className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer shadow-soft border ${
        isSpeaking
          ? 'bg-risk-high-bg border-risk-high-border text-risk-high-ink ring-1 ring-risk-high-border animate-pulse'
          : 'bg-surface border-border text-ink hover:border-accent hover:text-accent'
      } ${className}`}
    >
      <span>{isSpeaking ? '⏹' : '🔊'}</span>
      <span>{isSpeaking ? stopLabel || defaultStopLabel : speakLabel || defaultSpeakLabel}</span>
    </button>
  );
}
