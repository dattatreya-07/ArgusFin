import { Lang } from '../types';
import { selectVoice, LOCALE_MAP, VoiceLike } from './selectVoice';

export type SpeechState = 'IDLE' | 'SPEAKING' | 'PAUSED' | 'UNAVAILABLE';

/**
 * Prepares clean plain text for TTS while preserving Tamil Unicode characters,
 * currency figures, percentages, and punctuation.
 */
export function prepareTextForTTS(rawText: string): string {
  if (!rawText) return '';

  return rawText
    // Remove masked token brackets like [PHONE], [EMAIL], etc.
    .replace(/\[(PHONE|EMAIL|UPI|PAN|ACCOUNT_OR_ID)\]/g, '')
    // Remove Markdown formatting like asterisks, hashes, backticks, blockquotes
    .replace(/[*#_`>]/g, '')
    // Replace markdown links [label](url) with just label
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Normalize repeated whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Splits text into natural sentence boundaries for smooth TTS playback.
 * Does not split in the middle of currency numbers (₹10,000), percentages (10%), or decimals.
 */
export function segmentSentences(text: string): string[] {
  const prepared = prepareTextForTTS(text);
  if (!prepared) return [];

  // Match sentences ending in punctuation or line breaks
  // Handles Indic danda (।), period, exclamation, question mark
  const rawSegments = prepared.split(/(?<=[.!?।\n])\s+/);

  const cleanSegments = rawSegments
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  return cleanSegments.length > 0 ? cleanSegments : [prepared];
}

/**
 * Custom hook or controller interface for Browser Speech Synthesis
 */
export class BrowserTTSController {
  private voices: SpeechSynthesisVoice[] = [];
  private state: SpeechState = 'IDLE';
  private listeners: Set<(state: SpeechState) => void> = new Set();
  private currentUtteranceIndex = 0;
  private sentenceQueue: string[] = [];
  private currentLang: Lang = 'en';

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.initVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        this.initVoices();
      };
    } else {
      this.state = 'UNAVAILABLE';
    }
  }

  private initVoices() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    this.voices = window.speechSynthesis.getVoices();
    this.notifyState();
  }

  public getVoices(): SpeechSynthesisVoice[] {
    if (this.voices.length === 0 && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.voices = window.speechSynthesis.getVoices();
    }
    return this.voices;
  }

  public hasVoiceForLanguage(lang: Lang): boolean {
    const voices = this.getVoices();
    const matched = selectVoice({ language: lang, voices });
    return matched !== null;
  }

  public getSelectedVoice(lang: Lang): SpeechSynthesisVoice | null {
    const voices = this.getVoices();
    return selectVoice({ language: lang, voices });
  }

  public getState(): SpeechState {
    return this.state;
  }

  public addStateListener(listener: (state: SpeechState) => void): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private setState(newState: SpeechState) {
    this.state = newState;
    this.notifyState();
  }

  private notifyState() {
    this.listeners.forEach((fn) => fn(this.state));
  }

  public stop() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.sentenceQueue = [];
    this.currentUtteranceIndex = 0;
    this.setState('IDLE');
  }

  public speak(text: string, lang: Lang) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      this.setState('UNAVAILABLE');
      return;
    }

    this.stop(); // Stop any active speech

    this.currentLang = lang;
    const voices = this.getVoices();
    const voice = selectVoice({ language: lang, voices });

    // Strict Invariant: If Tamil voice is missing, do NOT fallback to English/Hindi
    if (!voice && lang === 'ta') {
      console.warn('[BrowserTTS] No genuine Tamil voice found on this device. Speech synthesis suppressed.');
      this.setState('UNAVAILABLE');
      return;
    }

    this.sentenceQueue = segmentSentences(text);
    if (this.sentenceQueue.length === 0) {
      this.setState('IDLE');
      return;
    }

    this.currentUtteranceIndex = 0;
    this.setState('SPEAKING');
    this.playNextChunk(voice, lang);
  }

  private playNextChunk(voice: SpeechSynthesisVoice | null, lang: Lang) {
    if (this.currentUtteranceIndex >= this.sentenceQueue.length) {
      this.setState('IDLE');
      return;
    }

    const chunk = this.sentenceQueue[this.currentUtteranceIndex];
    const utterance = new SpeechSynthesisUtterance(chunk);
    utterance.lang = LOCALE_MAP[lang] || 'en-IN';

    if (voice) {
      utterance.voice = voice;
    }

    // Set natural rate for Indic pronunciation clarity
    utterance.rate = lang === 'ta' || lang === 'hi' ? 0.92 : 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      this.currentUtteranceIndex++;
      this.playNextChunk(voice, lang);
    };

    utterance.onerror = (e) => {
      console.warn('[BrowserTTS] Utterance error:', e);
      this.setState('IDLE');
    };

    window.speechSynthesis.speak(utterance);
  }
}

// Global singleton controller for consistent speech synthesis across views
export const globalTTS = typeof window !== 'undefined' ? new BrowserTTSController() : null;
