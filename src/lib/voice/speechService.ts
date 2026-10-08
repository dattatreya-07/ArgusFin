import { selectVoice, LOCALE_MAP, VoiceLike, VoiceLocale } from './selectVoice';

export type SpeechPlaybackState = 'IDLE' | 'SPEAKING' | 'PAUSED' | 'UNAVAILABLE';

export interface SpeechOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
  onStateChange?: (state: SpeechPlaybackState) => void;
}

/**
 * Prepares clean plain text for TTS while preserving native Indic Unicode characters,
 * currency figures, percentages, and punctuation.
 * Expands currency symbol ₹ to natural words (ரூபாய் / रुपये / രൂപ) to prevent speech engine stumbling.
 */
export function prepareTextForSpeech(rawText: string, locale: VoiceLocale = 'en'): string {
  if (!rawText) return '';

  let cleaned = rawText
    // Remove masked token brackets like [PHONE], [EMAIL], etc.
    .replace(/\[(PHONE|EMAIL|UPI|PAN|ACCOUNT_OR_ID|NAME)\]/g, '')
    // Remove Markdown formatting like asterisks, hashes, backticks, blockquotes, bullets
    .replace(/[*#_`>•]/g, '')
    // Replace markdown links [label](url) with just label
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  const loc = (locale || 'en').toLowerCase();
  if (loc.startsWith('ta')) {
    cleaned = cleaned.replace(/₹\s*([0-9,]+)/g, 'ரூபாய் $1');
  } else if (loc.startsWith('hi')) {
    cleaned = cleaned.replace(/₹\s*([0-9,]+)/g, 'रुपये $1');
  } else if (loc.startsWith('ml')) {
    cleaned = cleaned.replace(/₹\s*([0-9,]+)/g, 'രൂപ $1');
  } else {
    cleaned = cleaned.replace(/₹\s*([0-9,]+)/g, 'Rupees $1');
  }

  return cleaned.replace(/\s+/g, ' ').trim();
}

/**
 * Splits text into natural sentence boundaries for smooth TTS playback.
 * Does not split in the middle of currency numbers, percentages, or decimals.
 */
export function segmentSpeechChunks(text: string, locale: VoiceLocale = 'en'): string[] {
  const prepared = prepareTextForSpeech(text, locale);
  if (!prepared) return [];

  // Split on sentence ending punctuation (., !, ?, ।, \n)
  const rawSegments = prepared.split(/(?<=[.!?।\n])\s+/);

  const cleanSegments = rawSegments
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  return cleanSegments.length > 0 ? cleanSegments : [prepared];
}

/**
 * Centralized, robust Speech Synthesis Service.
 * Ensures immediate cancellation on stop(), session token locking, and intelligent voice selection.
 */
export class SpeechService {
  private voices: SpeechSynthesisVoice[] = [];
  private state: SpeechPlaybackState = 'IDLE';
  private listeners: Set<(state: SpeechPlaybackState) => void> = new Set();
  private currentSessionId = 0;
  private currentChunkIndex = 0;
  private chunkQueue: string[] = [];
  private currentLocale: VoiceLocale = 'en';

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
  }

  public getAvailableVoices(locale?: VoiceLocale): SpeechSynthesisVoice[] {
    if (this.voices.length === 0 && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.voices = window.speechSynthesis.getVoices();
    }
    if (!locale) return this.voices;
    return this.voices.filter((v) => {
      const match = selectVoice({ language: locale, voices: [v] });
      return match !== null;
    });
  }

  public selectBestVoice(locale: VoiceLocale): SpeechSynthesisVoice | null {
    const voices = this.getAvailableVoices();
    return selectVoice({ language: locale, voices });
  }

  public hasVoiceForLocale(locale: VoiceLocale): boolean {
    return this.selectBestVoice(locale) !== null;
  }

  public getState(): SpeechPlaybackState {
    return this.state;
  }

  public isSpeaking(): boolean {
    return this.state === 'SPEAKING';
  }

  public isPaused(): boolean {
    return this.state === 'PAUSED';
  }

  public addStateListener(listener: (state: SpeechPlaybackState) => void): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private setState(newState: SpeechPlaybackState) {
    this.state = newState;
    this.listeners.forEach((fn) => {
      try {
        fn(this.state);
      } catch (_) {
        // Ignore subscriber errors
      }
    });
  }

  /**
   * Immediately stops all active speech synthesis.
   * Cancels browser queue, invalidates session counter, and clears chunk buffers.
   */
  public stop() {
    this.currentSessionId++; // Invalidate active session to prevent any subsequent chunks
    this.chunkQueue = [];
    this.currentChunkIndex = 0;

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (_) {
        // ignore
      }
    }

    this.setState('IDLE');
  }

  /**
   * Pauses active speech synthesis.
   */
  public pause() {
    if (this.state === 'SPEAKING' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.pause();
        this.setState('PAUSED');
      } catch (_) {
        // ignore
      }
    }
  }

  /**
   * Resumes paused speech synthesis.
   */
  public resume() {
    if (this.state === 'PAUSED' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.resume();
        this.setState('SPEAKING');
      } catch (_) {
        // ignore
      }
    }
  }

  /**
   * Plays speech for the given text in the requested locale.
   */
  public speak(text: string, locale: VoiceLocale = 'en', options: SpeechOptions = {}) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      this.setState('UNAVAILABLE');
      options.onError?.(new Error('Speech synthesis is not supported on this browser/device.'));
      return;
    }

    // Stop and invalidate previous session
    this.stop();

    const sessionId = ++this.currentSessionId;
    this.currentLocale = locale;

    const chunks = segmentSpeechChunks(text, locale);
    if (chunks.length === 0) {
      this.setState('IDLE');
      options.onEnd?.();
      return;
    }

    this.chunkQueue = chunks;
    this.currentChunkIndex = 0;

    const voice = this.selectBestVoice(locale);

    // Invariant: If requested Indic voice is completely unavailable, do NOT speak in an arbitrary wrong language
    if (!voice && (locale === 'ta' || locale === 'ml' || locale === 'hi')) {
      console.warn(`[SpeechService] Genuine voice for locale "${locale}" not found on device.`);
      this.setState('UNAVAILABLE');
      options.onError?.(new Error(`Voice for ${locale} is unavailable on this device.`));
      return;
    }

    this.setState('SPEAKING');
    options.onStart?.();

    this.playChunk(sessionId, voice, locale, options);
  }

  private playChunk(
    sessionId: number,
    voice: SpeechSynthesisVoice | null,
    locale: VoiceLocale,
    options: SpeechOptions
  ) {
    // Session token check: If user called stop() or triggered a new speech, abort immediately
    if (this.currentSessionId !== sessionId) {
      return;
    }

    if (this.currentChunkIndex >= this.chunkQueue.length) {
      this.setState('IDLE');
      options.onEnd?.();
      return;
    }

    const chunkText = this.chunkQueue[this.currentChunkIndex];
    const utterance = new SpeechSynthesisUtterance(chunkText);

    utterance.lang = LOCALE_MAP[locale] || 'en-IN';
    if (voice) {
      utterance.voice = voice;
    }

    // Natural cadence for Indic phonetics
    const isIndic = locale === 'ta' || locale === 'hi' || locale === 'ml';
    utterance.rate = options.rate ?? (isIndic ? 0.92 : 1.0);
    utterance.pitch = options.pitch ?? 1.0;
    utterance.volume = options.volume ?? 1.0;

    utterance.onend = () => {
      if (this.currentSessionId !== sessionId) return; // Abort if cancelled
      this.currentChunkIndex++;
      this.playChunk(sessionId, voice, locale, options);
    };

    utterance.onerror = (e) => {
      // If error is due to cancellation, do not continue queue
      if (this.currentSessionId !== sessionId || e.error === 'canceled' || e.error === 'interrupted') {
        return;
      }
      console.warn('[SpeechService] Utterance error:', e);
      this.currentChunkIndex++;
      if (this.currentChunkIndex < this.chunkQueue.length && this.currentSessionId === sessionId) {
        this.playChunk(sessionId, voice, locale, options);
      } else {
        this.setState('IDLE');
        options.onError?.(e);
      }
    };

    try {
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      if (this.currentSessionId === sessionId) {
        this.setState('IDLE');
        options.onError?.(err);
      }
    }
  }
}

export const speechService = new SpeechService();
