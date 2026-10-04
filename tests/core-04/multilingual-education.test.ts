import { describe, it, expect } from 'vitest';
import { analyzeScam } from '@/lib/scam/analyze';

describe('CORE-04 — Multilingual & Code-Switched Education Suite', () => {
  const cases = [
    { text: 'Invest ₹10,000 to get ₹20,000 in 30 days guaranteed.', lang: 'EN', expected: ['HIGH', 'MEDIUM'] },
    { text: '30 दिनों में पैसा दोगुना करने की गारंटी। अभी ₹10,000 ट्रांसफर करें।', lang: 'HI', expected: ['HIGH', 'MEDIUM'] },
    { text: '30 நாட்களில் முதலீடு இரட்டிப்பாகும். ₹10,000 உடனடியாக UPI மூலம் அனுப்புங்கள்.', lang: 'TA', expected: ['HIGH', 'MEDIUM'] },
    { text: 'Daily 2% fixed return guaranteed hai. Minimum deposit ₹5000 karke join karo.', lang: 'Hinglish', expected: ['HIGH', 'MEDIUM'] },
    { text: 'Daily 2% fixed return guaranteed pa. ₹5000 UPI panunga உடனே join panalam.', lang: 'Tanglish', expected: ['HIGH', 'MEDIUM'] },
    { text: 'What is the formula for calculating Compound Annual Growth Rate CAGR?', lang: 'EN', expected: ['LOW_SIGNALS', 'CANNOT_VERIFY'] },
    { text: 'म्यूचुअल फंड में सीएजीआर की गणना कैसे की जाती है?', lang: 'HI', expected: ['LOW_SIGNALS', 'CANNOT_VERIFY'] },
    { text: 'மியூச்சுவல் ஃபண்டில் CAGR எவ்வாறு கணக்கிடப்படுகிறது?', lang: 'TA', expected: ['LOW_SIGNALS', 'CANNOT_VERIFY'] },
    { text: 'Mutual fund me CAGR calculation kaise hota hai?', lang: 'Hinglish', expected: ['LOW_SIGNALS', 'CANNOT_VERIFY'] },
    { text: 'Mutual fund la CAGR epdi calculate panறாங்க?', lang: 'Tanglish', expected: ['LOW_SIGNALS', 'CANNOT_VERIFY'] }
  ];

  cases.forEach((item, idx) => {
    it(`multilingual case #${idx + 1} (${item.lang}) produces expected risk band`, async () => {
      const result = await analyzeScam({ source: 'WEB_TEXT', text: item.text });
      expect(item.expected).toContain(result.decision.band);
    });
  });
});
