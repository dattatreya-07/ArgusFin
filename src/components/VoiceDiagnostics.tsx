'use client';

import React, { useState, useEffect } from 'react';
import { Lang } from '@/lib/types';
import { selectVoice, normalizeLangTag } from '@/lib/voice/selectVoice';
import { prepareTextForTTS, segmentSentences } from '@/lib/voice/tts';
import { SpeakButton } from './SpeakButton';

const CONTROLLED_TAMIL_SCRIPTS = [
  'இந்த முதலீட்டில் அதிக வருமானம் கிடைக்கும் என்று உறுதி அளிக்கப்படுகிறது.',
  'தினமும் பத்து சதவீதம் லாபம் கிடைக்கும் என்று கூறப்படுகிறது.',
  '₹10,000 முதலீடு செய்தால் 30 நாட்களில் ₹20,000 கிடைக்கும் என்று கூறப்படுகிறது.',
  '100% உத்தரவாதம் என்று கூறப்பட்டாலும் அதை சுயமாக சரிபார்க்க வேண்டும்.',
  'OTP, கடவுச்சொல் அல்லது வங்கி விவரங்களை யாரிடமும் பகிர வேண்டாம்.',
];

export function VoiceDiagnostics({ lang = 'ta' }: { lang?: Lang }) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const isDev = process.env.NODE_ENV === 'development';

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const loadVoices = () => {
      const vList = window.speechSynthesis.getVoices();
      setVoices(vList);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  // Show only in dev mode or if explicitly requested
  if (!isDev && typeof window !== 'undefined' && !window.location.search.includes('debug_voice=true')) {
    return null;
  }

  const selectedVoice = selectVoice({ language: lang, voices });
  const tamilVoices = voices.filter((v) => normalizeLangTag(v.lang).startsWith('ta') || v.name.includes('Tamil') || v.name.includes('தமிழ்'));

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="px-3 py-1.5 rounded-full bg-slate-900 border border-slate-700 text-xs font-mono text-emerald-400 shadow-xl hover:bg-slate-800 transition"
        >
          🔊 Voice Diagnostics ({lang.toUpperCase()})
        </button>
      ) : (
        <div className="w-96 max-h-[85vh] bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4 overflow-y-auto text-xs text-slate-300 font-sans">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="font-bold text-white text-sm">TTS Voice Diagnostics</span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white font-bold text-sm"
            >
              ✕
            </button>
          </div>

          <div className="space-y-1.5 bg-slate-900/90 p-3 rounded-xl border border-slate-800 font-mono text-[11px]">
            <div><strong>Requested Locale:</strong> {lang === 'ta' ? 'ta-IN' : lang === 'hi' ? 'hi-IN' : 'en-IN'}</div>
            <div><strong>Selected Voice:</strong> {selectedVoice ? selectedVoice.name : 'NONE (Text-Only Fallback Active)'}</div>
            <div><strong>Voice Lang Tag:</strong> {selectedVoice ? selectedVoice.lang : 'N/A'}</div>
            <div><strong>Total System Voices:</strong> {voices.length}</div>
            <div><strong>Tamil Compatible Voices:</strong> {tamilVoices.length}</div>
          </div>

          {/* Android Guidance */}
          {!selectedVoice && lang === 'ta' && (
            <div className="p-3 bg-amber-950/50 border border-amber-800/80 rounded-xl text-amber-200 text-[11px] space-y-1">
              <strong>Android Device Voice Notice:</strong>
              <p>
                No Tamil TTS voice found on this device. Text is preserved in full above. To enable Tamil voice playback, install/enable Tamil speech data in your Android Settings &gt; Accessibility &gt; Text-to-speech output (Google Speech Services).
              </p>
            </div>
          )}

          {/* Controlled Test Scripts */}
          <div className="space-y-2">
            <span className="font-bold text-slate-200 block uppercase tracking-wider text-[10px]">
              Controlled Tamil Verification Scripts:
            </span>
            <div className="space-y-2">
              {CONTROLLED_TAMIL_SCRIPTS.map((script, idx) => (
                <div key={idx} className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 space-y-1.5">
                  <p className="text-[11px] text-slate-200">{script}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-mono">
                      Parsed: {prepareTextForTTS(script, 'ta')}
                    </span>
                    <SpeakButton text={script} lang="ta" speakLabel="Play" stopLabel="Stop" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Available Tamil Voice List */}
          {tamilVoices.length > 0 && (
            <div className="space-y-1">
              <span className="font-bold text-slate-200 block uppercase tracking-wider text-[10px]">
                Installed Tamil Voices:
              </span>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {tamilVoices.map((v, i) => (
                  <div key={i} className="p-1.5 bg-slate-900 rounded text-[10px] font-mono flex justify-between">
                    <span>{v.name}</span>
                    <span className="text-slate-400">{v.lang}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
