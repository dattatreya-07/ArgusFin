import { describe, it, expect } from 'vitest';
import { ALL_CORPUS_CHUNKS, VERIFIED_CORPUS_DOCS } from '@/lib/rag/corpus';

describe('CORE-04B — Expanded Corpus Coverage Suite', () => {
  it('1. verifies corpus includes all 10 domain topics', () => {
    const topics = new Set(VERIFIED_CORPUS_DOCS.map((d) => d.topic));

    expect(topics.has('copy_trading')).toBe(true);
    expect(topics.has('fake_ipo_allotment')).toBe(true);
    expect(topics.has('helpline_reporting')).toBe(true);
    expect(topics.has('unrealistic_returns')).toBe(true);
    expect(topics.has('phishing_links')).toBe(true);
    expect(topics.has('fixed_income')).toBe(true);
    expect(topics.has('mutual_funds')).toBe(true);
    expect(topics.has('equity_shares')).toBe(true);
    expect(topics.has('futures_and_options')).toBe(true);
    expect(topics.has('crypto_digital_assets')).toBe(true);
  });

  it('2. verifies all corpus documents have valid provenance metadata', () => {
    VERIFIED_CORPUS_DOCS.forEach((doc) => {
      expect(doc.id).toBeDefined();
      expect(doc.publisher).toBeDefined();
      expect(doc.sourceUrl).toContain('https://');
      expect(doc.verifiedAt).toBe('2026-10-01');
      expect(doc.trustTier).toBe('TIER_1_PRIMARY');
    });
  });

  it('3. verifies corpus chunks are correctly generated from documents', () => {
    expect(ALL_CORPUS_CHUNKS.length).toBeGreaterThan(15);
    ALL_CORPUS_CHUNKS.forEach((chunk) => {
      expect(chunk.text.length).toBeGreaterThan(20);
      expect(chunk.docId).toBeDefined();
    });
  });
});
