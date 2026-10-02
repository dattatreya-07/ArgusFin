import { describe, it, expect } from 'vitest';
import { maskPII } from '../mask';
import { extractClaims } from '../extract';
import { evaluateRegisteredRules } from '../rules';
import { RulesOnlyDecisionEngine } from './rulesOnly';
import { fuseDecisionAndRules } from '../fuse';
import { DecisionInput } from '../types';

describe('Decision Calibration & Archetype Precedence Regression Tests', () => {
  const engine = new RulesOnlyDecisionEngine();

  it('correctly classifies Hindi copy-trading collision case as COPY_TRADING (HIGH)', async () => {
    // Known collision case: has copy trading + daily 10% return + UPI fee request + app download prompt
    const text = 'कॉपी ट्रेडिंग से रोजाना 10% मुनाफा कमाएं। फीस [UPI] पर भेजें और ऐप डाउनलोड करें।';
    const masked = maskPII(text);
    const claims = extractClaims(masked.masked, 'hi');

    const input: DecisionInput = {
      maskedText: masked.masked,
      claims,
      signals: [],
      lang: 'hi',
    };

    const flags = evaluateRegisteredRules(input);
    const decision = await engine.decide(input);
    const fusion = fuseDecisionAndRules(flags, decision);

    // Verifies that COPY_TRADING wins as primary vector while maintaining HIGH risk band
    expect(fusion.topArchetype.top).toBe('COPY_TRADING');
    expect(fusion.finalBand).toBe('HIGH');
    expect(flags.some((f) => f.ruleId === 'ASKS_OTP_OR_APP_INSTALL')).toBe(true);
    expect(flags.some((f) => f.ruleId === 'RETURN_TOO_HIGH')).toBe(true);
  });

  it('correctly classifies English copy-trading bot with fee and OTP as COPY_TRADING (HIGH)', async () => {
    const text = 'Connect with our automated copy trading bot. Send fee to [UPI] and share OTP for registration.';
    const masked = maskPII(text);
    const claims = extractClaims(masked.masked, 'en');

    const input: DecisionInput = {
      maskedText: masked.masked,
      claims,
      signals: [],
      lang: 'en',
    };

    const flags = evaluateRegisteredRules(input);
    const decision = await engine.decide(input);
    const fusion = fuseDecisionAndRules(flags, decision);

    expect(fusion.topArchetype.top).toBe('COPY_TRADING');
    expect(fusion.finalBand).toBe('HIGH');
  });

  it('correctly classifies Tamil copy-trading with APK download as COPY_TRADING (HIGH)', async () => {
    const text = 'காப்பி டிரேடிங் மூலம் லாபம் ஈட்டுங்கள். கட்டணத்தை [UPI] மூலம் செலுத்தி செயலியை பதிவிறக்குங்கள்.';
    const masked = maskPII(text);
    const claims = extractClaims(masked.masked, 'ta');

    const input: DecisionInput = {
      maskedText: masked.masked,
      claims,
      signals: [],
      lang: 'ta',
    };

    const flags = evaluateRegisteredRules(input);
    const decision = await engine.decide(input);
    const fusion = fuseDecisionAndRules(flags, decision);

    expect(fusion.topArchetype.top).toBe('COPY_TRADING');
    expect(fusion.finalBand).toBe('HIGH');
  });

  it('does not false-alarm on benign financial education text across languages', async () => {
    const benignTexts = [
      { text: 'Diversification across index funds and fixed deposits helps manage portfolio volatility.', lang: 'en' as const },
      { text: 'म्यूचुअल फंड में निवेश बाजार जोखिमों के अधीन है, कृपया सभी योजना संबंधी दस्तावेजों को ध्यान से पढ़ें।', lang: 'hi' as const },
      { text: 'பங்குச்சந்தை முதலீடுகள் சந்தை அபாயங்களுக்கு உட்பட்டவை. நீண்ட கால கூட்டு வட்டி பலனை புரிந்து முதலீடு செய்யுங்கள்.', lang: 'ta' as const },
    ];

    for (const b of benignTexts) {
      const masked = maskPII(b.text);
      const claims = extractClaims(masked.masked, b.lang);
      const input: DecisionInput = {
        maskedText: masked.masked,
        claims,
        signals: [],
        lang: b.lang,
      };

      const flags = evaluateRegisteredRules(input);
      const decision = await engine.decide(input);
      const fusion = fuseDecisionAndRules(flags, decision);

      expect(fusion.finalBand).not.toBe('HIGH');
      expect(fusion.finalBand).not.toBe('MEDIUM');
      expect(['LOW_SIGNALS', 'CANNOT_VERIFY']).toContain(fusion.finalBand);
      expect(fusion.topArchetype.top).toBe('OTHER_OR_NONE');
    }
  });
});
