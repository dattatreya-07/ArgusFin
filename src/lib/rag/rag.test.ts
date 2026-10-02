import { describe, it, expect } from 'vitest';
import { retrieveEvidence } from './retrieve';
import { validateAndExtractCitations, UNVERIFIED_FALLBACK_MESSAGES } from './citations';
import { askRag } from './index';

describe('RAG Subsystem', () => {
  describe('Evidence Retrieval', () => {
    it('retrieves relevant SEBI chunks for copy trading queries', () => {
      const results = retrieveEvidence('Is copy trading legal in India according to SEBI?', 'en', 3);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].publisher).toContain('SEBI');
      expect(results[0].sourceUrl).toContain('sebi.gov.in');
    });

    it('retrieves MHA 1930 helpline for UPI fraud complaint queries', () => {
      const results = retrieveEvidence('How to report UPI fraud immediately within golden hour 1930?', 'en', 3);
      expect(results.length).toBeGreaterThan(0);
      expect(results.some((r) => r.text.includes('1930'))).toBe(true);
    });

    it('retrieves relevant documents for Hindi queries', () => {
      const results = retrieveEvidence('क्या टेलीग्राम पर कॉपी ट्रेडिंग सेबी द्वारा मान्य है?', 'hi', 3);
      expect(results.length).toBeGreaterThan(0);
    });

    it('returns empty array when query is gibberish or unrelated', () => {
      const results = retrieveEvidence('xyzabcdefghijk 99999 random words quantum physics', 'en', 3, 0.4);
      expect(results.length).toBe(0);
    });
  });

  describe('Citation Validation & Enforcement', () => {
    it('validates citations matching retrieved evidence chunks', () => {
      const retrieved = retrieveEvidence('SEBI copy trading', 'en', 2);
      const res = validateAndExtractCitations(
        `SEBI cautions against unregistered copy trading [${retrieved[0].id}].`,
        retrieved,
        'en'
      );
      expect(res.valid).toBe(true);
      expect(res.citations.length).toBeGreaterThan(0);
      expect(res.citations[0].sourceUrl).toContain('sebi.gov.in');
    });

    it('returns safe fallback when evidence is missing', () => {
      const res = validateAndExtractCitations('Some fabricated statement.', [], 'en');
      expect(res.valid).toBe(false);
      expect(res.sanitizedAnswer).toContain(UNVERIFIED_FALLBACK_MESSAGES.en);
    });
  });

  describe('Main askRag Pipeline', () => {
    it('successfully answers verified regulatory questions with citations', async () => {
      const response = await askRag('What should I do if I lost money to a financial cyber fraud?', 'en');
      expect(response.verified).toBe(true);
      expect(response.citations.length).toBeGreaterThan(0);
      expect(response.answer).toContain('1930');
    });

    it('returns "I can\'t verify this" for unsupported or out-of-scope questions', async () => {
      const response = await askRag('What will be the price of Reliance stock tomorrow?', 'en');
      expect(response.verified).toBe(false);
      expect(response.answer).toContain("I can't verify this");
      expect(response.citations).toEqual([]);
    });
  });
});
