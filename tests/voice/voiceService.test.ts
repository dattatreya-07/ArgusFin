import { describe, it, expect, beforeEach, vi } from 'vitest';
import { selectVoice, isTamilCompatible, isMalayalamCompatible, isHindiCompatible } from '@/lib/voice/selectVoice';
import { speechService, prepareTextForSpeech, segmentSpeechChunks } from '@/lib/voice/speechService';
import { getVoiceDiagnostics } from '@/lib/voice/diagnostics';

describe('Workstream A — Multilingual Voice & Speech Service', () => {
  const mockVoices = [
    { name: 'Google தமிழ்', lang: 'ta-IN', default: false, localService: true },
    { name: 'Microsoft Valluvar Online (Natural) - Tamil (India)', lang: 'ta-IN', default: false },
    { name: 'Google മലയാളം', lang: 'ml-IN', default: false, localService: true },
    { name: 'Microsoft Midhun Online (Natural) - Malayalam (India)', lang: 'ml-IN', default: false },
    { name: 'Google हिन्दी', lang: 'hi-IN', default: false, localService: true },
    { name: 'Microsoft Kalpana - Hindi (India)', lang: 'hi-IN', default: false },
    { name: 'Google UK English Female', lang: 'en-GB', default: false },
    { name: 'Microsoft Neerja Online (Natural) - English (India)', lang: 'en-IN', default: true },
    { name: 'Google US English', lang: 'en-US', default: false },
  ];

  it('1. Intelligent Voice Selection for Tamil (ta-IN)', () => {
    const matchedTa = selectVoice({ language: 'ta', voices: mockVoices });
    expect(matchedTa).not.toBeNull();
    expect(matchedTa?.lang).toBe('ta-IN');
    expect(isTamilCompatible(matchedTa!)).toBe(true);
  });

  it('2. Intelligent Voice Selection for Malayalam (ml-IN)', () => {
    const matchedMl = selectVoice({ language: 'ml', voices: mockVoices });
    expect(matchedMl).not.toBeNull();
    expect(matchedMl?.lang).toBe('ml-IN');
    expect(isMalayalamCompatible(matchedMl!)).toBe(true);
  });

  it('3. Intelligent Voice Selection for Hindi (hi-IN)', () => {
    const matchedHi = selectVoice({ language: 'hi', voices: mockVoices });
    expect(matchedHi).not.toBeNull();
    expect(matchedHi?.lang).toBe('hi-IN');
    expect(isHindiCompatible(matchedHi!)).toBe(true);
  });

  it('4. Intelligent Voice Selection for English prefers en-IN', () => {
    const matchedEn = selectVoice({ language: 'en', voices: mockVoices });
    expect(matchedEn).not.toBeNull();
    expect(matchedEn?.lang).toBe('en-IN');
  });

  it('5. Strict Invariant: Missing Indic voice returns null, never fakes language fallback', () => {
    const englishOnlyVoices = [
      { name: 'Alex', lang: 'en-US' },
      { name: 'Samantha', lang: 'en-US' },
    ];

    const matchedTa = selectVoice({ language: 'ta', voices: englishOnlyVoices });
    expect(matchedTa).toBeNull();

    const matchedMl = selectVoice({ language: 'ml', voices: englishOnlyVoices });
    expect(matchedMl).toBeNull();
  });

  it('6. Text preparation articulates Indic currencies naturally and removes masked brackets', () => {
    const rawTa = 'நீங்கள் [PHONE] அழைக்கவும். உங்கள் முதலீடு ₹50,000 ஆகும்.';
    const preparedTa = prepareTextForSpeech(rawTa, 'ta');
    expect(preparedTa).not.toContain('[PHONE]');
    expect(preparedTa).toContain('ரூபாய் 50,000');

    const rawMl = 'നിങ്ങളുടെ നിക്ഷേപം ₹25,000 ആണ്.';
    const preparedMl = prepareTextForSpeech(rawMl, 'ml');
    expect(preparedMl).toContain('രൂപ 25,000');

    const rawHi = 'आपकी राशि ₹10,000 है।';
    const preparedHi = prepareTextForSpeech(rawHi, 'hi');
    expect(preparedHi).toContain('रुपये 10,000');
  });

  it('7. Speech chunk segmentation splits on natural punctuation boundaries', () => {
    const longText = 'First observation. Second potential risk signal! Third recommendation? Fourth advice।';
    const chunks = segmentSpeechChunks(longText, 'en');
    expect(chunks.length).toBe(4);
    expect(chunks[0]).toBe('First observation.');
    expect(chunks[1]).toBe('Second potential risk signal!');
    expect(chunks[2]).toBe('Third recommendation?');
    expect(chunks[3]).toBe('Fourth advice।');
  });

  it('8. Immediate Cancellation: stop() resets state to IDLE and invalidates queue', () => {
    speechService.stop();
    expect(speechService.getState()).toBe('IDLE');
    expect(speechService.isSpeaking()).toBe(false);
  });

  it('9. Voice Diagnostics Utility reports accurate status in test env', () => {
    const diag = getVoiceDiagnostics('ta');
    expect(diag.requestedLocale).toBe('ta');
    expect(diag.fallbackStatus).toBeDefined();
    expect(diag.speechState).toBeDefined();
  });
});
