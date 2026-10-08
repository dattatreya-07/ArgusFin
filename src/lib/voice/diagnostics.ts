import { speechService } from './speechService';
import { VoiceLocale } from './selectVoice';

export interface VoiceDiagnosticsReport {
  requestedLocale: string;
  selectedVoice: {
    name: string;
    lang: string;
    default?: boolean;
    localService?: boolean;
  } | null;
  availableVoicesCount: number;
  matchingVoicesCount: number;
  hasNativeVoice: boolean;
  fallbackStatus: 'NATIVE_VOICE_AVAILABLE' | 'NO_VOICE_FOR_LOCALE' | 'SYNTHESIS_UNSUPPORTED';
  speechState: string;
}

/**
 * Diagnostic utility for developer testing and automated validation.
 * Never exposed to end users in production UI.
 */
export function getVoiceDiagnostics(locale: VoiceLocale = 'en'): VoiceDiagnosticsReport {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return {
      requestedLocale: locale,
      selectedVoice: null,
      availableVoicesCount: 0,
      matchingVoicesCount: 0,
      hasNativeVoice: false,
      fallbackStatus: 'SYNTHESIS_UNSUPPORTED',
      speechState: 'UNAVAILABLE',
    };
  }

  const allVoices = speechService.getAvailableVoices();
  const selected = speechService.selectBestVoice(locale);
  const matchingVoices = speechService.getAvailableVoices(locale);

  return {
    requestedLocale: locale,
    selectedVoice: selected
      ? {
          name: selected.name,
          lang: selected.lang,
          default: selected.default,
          localService: selected.localService,
        }
      : null,
    availableVoicesCount: allVoices.length,
    matchingVoicesCount: matchingVoices.length,
    hasNativeVoice: selected !== null,
    fallbackStatus: selected !== null ? 'NATIVE_VOICE_AVAILABLE' : 'NO_VOICE_FOR_LOCALE',
    speechState: speechService.getState(),
  };
}
