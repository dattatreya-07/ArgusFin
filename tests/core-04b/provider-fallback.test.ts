import { describe, it, expect } from 'vitest';
import { ExtractiveEducationalProvider, GroqGroundedSynthesizerProvider } from '@/lib/rag/provider';
import { EvidencePack } from '@/lib/rag/types';

describe('CORE-04B — Provider Fallback & Output Contract Suite', () => {
  const dummyPack: EvidencePack = {
    query: 'What is NAV in mutual funds?',
    language: 'en',
    status: 'FOUND',
    retrieved: [
      {
        id: 'chk-1',
        docId: 'doc-mf',
        sourceId: 'src-mf',
        title: 'SEBI Mutual Fund Guide',
        publisher: 'SEBI',
        sourceUrl: 'https://investor.sebi.gov.in/mf.html',
        verifiedAt: '2026-10-01',
        language: 'en',
        text: 'Net Asset Value (NAV) represents the market value of one fund unit, calculated daily after subtracting expense ratio.',
        similarityScore: 0.85,
      },
    ],
  };

  it('1. verifies ExtractiveEducationalProvider produces structured citation output', async () => {
    const provider = new ExtractiveEducationalProvider();
    const res = await provider.generateAnswer('What is NAV?', dummyPack, 'en');

    expect(res.answer).toContain('According to verified regulatory');
    expect(res.answer).toContain('Net Asset Value');
    expect(res.citations.length).toBe(1);
    expect(res.citations[0].publisher).toBe('SEBI');
  });

  it('2. verifies GroqGroundedSynthesizerProvider falls back seamlessly when API key is missing', async () => {
    const provider = new GroqGroundedSynthesizerProvider();
    const res = await provider.generateAnswer('What is NAV?', dummyPack, 'en');

    expect(res.answer).toBeDefined();
    expect(res.citations.length).toBeGreaterThan(0);
  });
});
