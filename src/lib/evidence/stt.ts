import { TranscriptResult } from './types';
import { normalizeEvidenceText } from './normalize';
import { maskPii } from '../privacy';
import { detectLanguage } from '../detect-lang';

export interface SttProvider {
  id: string;
  transcribe(
    audioDataOrTranscript: string,
    lang?: 'en' | 'hi' | 'ta'
  ): Promise<TranscriptResult>;
}

export class WebSpeechSttProvider implements SttProvider {
  id = 'web-speech-stt';

  async transcribe(
    transcriptInput: string,
    targetLang?: 'en' | 'hi' | 'ta'
  ): Promise<TranscriptResult> {
    if (!transcriptInput || transcriptInput.trim().length === 0) {
      return {
        status: 'EMPTY',
        warnings: ['No speech transcript was captured.'],
        provider: this.id,
      };
    }

    const normalized = normalizeEvidenceText(transcriptInput);
    const masked = maskPii(normalized);
    const detected = targetLang || detectLanguage(masked);

    return {
      status: 'FOUND',
      text: masked,
      normalizedText: normalized,
      language: detected,
      confidence: 0.9,
      warnings: [],
      provider: this.id,
    };
  }
}

export const defaultSttProvider = new WebSpeechSttProvider();
