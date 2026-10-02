import { describe, it, expect } from 'vitest';
import { extractClaims } from './extract';
import { RulesOnlyDecisionEngine } from './decision/rulesOnly';
import { askRag, retrieveEvidence } from './rag';
import { routeAuthorities, getAuthorityById } from './authorities';
import { validateEvidenceFile } from './evidence';
import { validateIncidentConsistency } from './incident';
import { withTimeout } from './observability';

describe('P3-06 Reliability & Failure Injection Suite', () => {
  describe('LLM Degradation & Rules-Only Fallback', () => {
    it('gracefully degrades to deterministic rules when LLM fails or times out', async () => {
      // Simulating a failed/offline LLM call wrapped with timeout fallback
      const simulatedLlmError = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('LLM Provider Gateway Timeout')), 50)
      );

      const res = await withTimeout(
        simulatedLlmError,
        100,
        { fallback: true },
        'LLM_Decision'
      );

      expect(res.result).toEqual({ fallback: true });

      // Ensure deterministic engine functions independently
      const engine = new RulesOnlyDecisionEngine();
      const input = {
        maskedText: 'Invest 10000 get 20000 in 30 days. Guaranteed profit.',
        claims: extractClaims('Invest 10000 get 20000 in 30 days. Guaranteed profit.', 'en'),
        signals: [],
        lang: 'en' as const,
      };

      const decision = await engine.decide(input);
      expect(decision.engine).toBe('rules-only');
      expect(decision.riskBand.HIGH).toBeGreaterThan(0.5);
    });
  });

  describe('RAG Empty Retrieval & Out-of-Corpus Query Fallback', () => {
    it('returns localized NO_SOURCE status without hallucinating answers for out-of-corpus queries', async () => {
      const outOfScopeQuery = 'What is the stock price target for XYZ Company next week?';
      const res = await askRag(outOfScopeQuery, 'en');

      expect(res.status).toBe('NO_SOURCE');
      expect(res.verified).toBe(false);
      expect(res.citations.length).toBe(0);
      expect(res.answer).toContain("can't verify this");
    });

    it('returns empty evidence array on empty or whitespace query', () => {
      const chunks = retrieveEvidence('   ', 'en');
      expect(chunks).toEqual([]);
    });
  });

  describe('Authority Outage & Missing Data Handling', () => {
    it('returns null safely when non-existent authority ID is queried', () => {
      const auth = getAuthorityById('non_existent_regulator_123');
      expect(auth).toBeUndefined();
    });

    it('returns NO_MATCH disclaimer without hallucinating fake helplines when input is empty', () => {
      const res = routeAuthorities({});
      expect(res.status).toBe('NO_MATCH');
      expect(res.routes.length).toBe(0);
      expect(res.reasons.length).toBeGreaterThan(0);
    });
  });

  describe('Incident Validation & Conflicting Data', () => {
    it('flags conflicting transaction sums against total claimed loss without failing silently', () => {
      const consistency = validateIncidentConsistency({
        language: 'en',
        amount: 100000,
        when: '2026-09-01',
        platform: 'Telegram',
        whatHappened: 'Transferred money in two batches.',
        transactions: [
          { date: '2026-09-01', amount: 20000, paymentMethod: 'UPI' },
          { date: '2026-09-01', amount: 30000, paymentMethod: 'UPI' },
        ],
      });

      expect(consistency.consistent).toBe(false);
      expect(consistency.issues.some((i) => i.field === 'amount')).toBe(true);
      expect(consistency.warnings[0]).toContain('differs from transaction sum');
    });
  });

  describe('Evidence Intake & Malformed Payload Rejection', () => {
    it('rejects corrupt or empty files deterministically', () => {
      const emptyCheck = validateEvidenceFile('TEXT', 'text/plain', 0, 'zero.txt');
      expect(emptyCheck.valid).toBe(false);
      expect(emptyCheck.error?.code).toBe('MALFORMED_PAYLOAD');
    });

    it('rejects unsupported or spoofed media formats', () => {
      const unsupported = validateEvidenceFile('IMAGE', 'application/x-msdownload', 5000, 'setup.exe');
      expect(unsupported.valid).toBe(false);
      expect(unsupported.error?.code).toBe('SECURITY_RISK');
    });
  });
});
