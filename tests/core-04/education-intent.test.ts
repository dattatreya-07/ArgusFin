import { describe, it, expect } from 'vitest';
import { analyzeScam } from '@/lib/scam/analyze';

describe('CORE-04 — Educational Intent False Positive Suite', () => {
  const educationalQueries = [
    'What is NAV in mutual funds?',
    'How does copy trading work?',
    'What is crypto staking?',
    'Why do scams ask for OTPs?',
    'Can an IPO guarantee allotment?',
    'What is a futures contract?',
    'What is a withdrawal fee in tax terms?'
  ];

  educationalQueries.forEach((query, index) => {
    it(`educational intent #${index + 1}: "${query}" produces LOW_SIGNALS risk band`, async () => {
      const result = await analyzeScam({ source: 'WEB_TEXT', text: query });
      expect(result.decision.band).toBe('LOW_SIGNALS');
      expect(result.decision.band).not.toBe('HIGH');
    });
  });
});
