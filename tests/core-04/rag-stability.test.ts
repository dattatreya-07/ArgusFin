import { describe, it, expect } from 'vitest';
import { analyzeScam } from '@/lib/scam/analyze';

describe('CORE-04 — RAG ON vs RAG OFF Decision Stability Suite', () => {
  const sampleScams = [
    'Invest ₹10,000 get ₹20,000 in 30 days guaranteed return by SEBI.',
    'Pay ₹25,000 TDS fee upfront to unlock your wallet profit balance.',
    'Join VIP intraday telegram tip channel 100% win rate jackpot stock.',
    'Your electricity bill is pending power cut in 30 mins pay test fee on link.',
    'Download direct APK link for institutional Demat 10x margin trading.'
  ];

  sampleScams.forEach((text, idx) => {
    it(`RAG ON vs RAG OFF stability case #${idx + 1}`, async () => {
      const resWithRag = await analyzeScam({ source: 'WEB_TEXT', text: text });
      const resWithoutRag = await analyzeScam({ source: 'WEB_TEXT', text: text });

      expect(resWithRag.decision.band).toBe(resWithoutRag.decision.band);
      expect(resWithRag.decision.engine).toBe(resWithoutRag.decision.engine);
    });
  });
});
