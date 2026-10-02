import { describe, it, expect } from 'vitest';
import { selectVoice, isTamilCompatible, isHindiCompatible, isEnglishCompatible, normalizeLangTag } from './selectVoice';
import { prepareTextForTTS, segmentSentences } from './tts';

describe('Voice Subsystem & Strict Tamil TTS Quality Guardrails', () => {
  const mockVoices = [
    { name: 'Google US English', lang: 'en-US' },
    { name: 'Google UK English Female', lang: 'en-GB' },
    { name: 'Google हिन्दी', lang: 'hi-IN' },
    { name: 'Lekha Hindi', lang: 'hi-IN' },
    { name: 'Google தமிழ்', lang: 'ta-IN' },
    { name: 'Valluvar Tamil', lang: 'ta_IN' },
    { name: 'Sri Lankan Tamil', lang: 'ta-LK' },
    { name: 'Generic Tamil', lang: 'ta' },
  ];

  describe('Language Tag Normalization', () => {
    it('normalizes case and underscores to standard BCP-47 lowercase dashes', () => {
      expect(normalizeLangTag('ta_IN')).toBe('ta-in');
      expect(normalizeLangTag('TA-IN')).toBe('ta-in');
      expect(normalizeLangTag('hi_IN')).toBe('hi-in');
      expect(normalizeLangTag('en-US')).toBe('en-us');
    });
  });

  describe('Tamil Voice Selection', () => {
    it('selects exact ta-IN voice when available', () => {
      const selected = selectVoice({
        language: 'ta',
        voices: mockVoices,
      });

      expect(selected).toBeDefined();
      expect(selected?.name).toBe('Google தமிழ்');
      expect(normalizeLangTag(selected?.lang || '')).toBe('ta-in');
    });

    it('selects regional ta-LK variant if ta-IN is absent', () => {
      const voicesNoTaIn = [
        { name: 'Google US English', lang: 'en-US' },
        { name: 'Sri Lankan Tamil', lang: 'ta-LK' },
      ];

      const selected = selectVoice({
        language: 'ta',
        voices: voicesNoTaIn,
      });

      expect(selected).toBeDefined();
      expect(selected?.name).toBe('Sri Lankan Tamil');
    });

    it('selects generic ta if regional variants are absent', () => {
      const voicesOnlyGeneric = [
        { name: 'Google US English', lang: 'en-US' },
        { name: 'Generic Tamil', lang: 'ta' },
      ];

      const selected = selectVoice({
        language: 'ta',
        voices: voicesOnlyGeneric,
      });

      expect(selected).toBeDefined();
      expect(selected?.name).toBe('Generic Tamil');
    });

    it('NEVER falls back to English when Tamil is requested and no Tamil voice exists', () => {
      const englishOnlyVoices = [
        { name: 'Google US English', lang: 'en-US' },
        { name: 'Microsoft David', lang: 'en-US' },
        { name: 'Google UK English', lang: 'en-GB' },
      ];

      const selected = selectVoice({
        language: 'ta',
        voices: englishOnlyVoices,
      });

      expect(selected).toBeNull();
    });

    it('NEVER falls back to Hindi when Tamil is requested and only Hindi voice exists', () => {
      const hindiOnlyVoices = [
        { name: 'Google हिन्दी', lang: 'hi-IN' },
        { name: 'Kalpana Hindi', lang: 'hi-IN' },
      ];

      const selected = selectVoice({
        language: 'ta',
        voices: hindiOnlyVoices,
      });

      expect(selected).toBeNull();
    });

    it('returns null on empty voice list', () => {
      expect(selectVoice({ language: 'ta', voices: [] })).toBeNull();
    });
  });

  describe('Hindi & English Voice Selection', () => {
    it('selects exact hi-IN for Hindi and en-IN/en for English', () => {
      const hiSelected = selectVoice({ language: 'hi', voices: mockVoices });
      expect(hiSelected?.lang).toBe('hi-IN');

      const enSelected = selectVoice({ language: 'en', voices: mockVoices });
      expect(enSelected?.lang.startsWith('en')).toBe(true);
    });

    it('does not select Tamil voice for Hindi or English', () => {
      const taOnly = [{ name: 'Google தமிழ்', lang: 'ta-IN' }];

      expect(selectVoice({ language: 'hi', voices: taOnly })).toBeNull();
      expect(selectVoice({ language: 'en', voices: taOnly })).toBeNull();
    });
  });

  describe('Tamil Text Integrity and Sentence Segmentation', () => {
    it('preserves genuine Tamil Unicode characters without transliteration', () => {
      const tamilText = 'இந்த முதலீட்டில் அதிக வருமானம் கிடைக்கும் என்று உறுதி அளிக்கப்படுகிறது.';
      const prepared = prepareTextForTTS(tamilText);

      expect(prepared).toBe(tamilText);
      expect(prepared).toContain('முதலீட்டில்');
      expect(prepared).not.toContain('mudaleettil');
    });

    it('preserves currency figures, percentages, and timeframes without corrupting numbers', () => {
      const financialTamil = '₹10,000 முதலீடு செய்தால் 30 நாட்களில் 100% உத்தரவாத லாபம் அல்லது 2 மடங்கு கிடைக்கும்.';
      const prepared = prepareTextForTTS(financialTamil);

      expect(prepared).toContain('₹10,000');
      expect(prepared).toContain('30 நாட்களில்');
      expect(prepared).toContain('100%');
      expect(prepared).toContain('2 மடங்கு');
    });

    it('cleans markdown symbols and masked brackets before TTS delivery', () => {
      const markdownTamil = '**எச்சரிக்கை:** [PHONE] எண்ணை தொடர்பு கொள்ள வேண்டாம். [விவரங்கள்](https://sebi.gov.in)';
      const prepared = prepareTextForTTS(markdownTamil);

      expect(prepared).toBe('எச்சரிக்கை: எண்ணை தொடர்பு கொள்ள வேண்டாம். விவரங்கள்');
      expect(prepared).not.toContain('**');
      expect(prepared).not.toContain('[PHONE]');
      expect(prepared).not.toContain('https://sebi.gov.in');
    });

    it('segments long text into clean sentences without breaking numbers', () => {
      const longText = 'முதல் வாக்கியம் ₹50,000 ஆகும். இரண்டாவது வாக்கியம் 15% லாபம் தருகிறது! மூன்றாவது வாக்கியம் என்ன?';
      const segments = segmentSentences(longText);

      expect(segments.length).toBe(3);
      expect(segments[0]).toBe('முதல் வாக்கியம் ₹50,000 ஆகும்.');
      expect(segments[1]).toBe('இரண்டாவது வாக்கியம் 15% லாபம் தருகிறது!');
      expect(segments[2]).toBe('மூன்றாவது வாக்கியம் என்ன?');
    });
  });
});
