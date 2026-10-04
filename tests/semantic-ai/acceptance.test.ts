import { describe, it, expect } from 'vitest';
import { analyzeScam } from '@/lib/scam/analyze';
import { CanonicalInput } from '@/lib/scam/types';
import { getSemanticProvider } from '@/lib/semantic';
import { askRag } from '@/lib/rag';

describe('Generic Semantic AI Acceptance Suite (Sections 26 - 30)', () => {
  const provider = getSemanticProvider();

  it('Acceptance Test 1 (Section 26): Analyzes stock earnings claim + secrecy + group link + download free without RAG', async () => {
    const text = `By investing in stocks, you can earn 100k a month.
Why are your stocks always in loss?
While others are consistently profiting from their stocks,
do you want to know their secret?
Add CHAT GROUP LINK.
Download for free!`;

    const input: CanonicalInput = {
      source: 'WEB_TEXT',
      language: 'en',
      text,
      privacyStatus: 'MASKED',
    };

    const result = await analyzeScam(input);

    // Expected risk: HIGH
    expect(result.decision.band).toBe('HIGH');

    // Semantic evidence verification
    expect(result.semanticEvidence).toBeDefined();
    if (result.semanticEvidence) {
      expect(result.semanticEvidence.claims.length).toBeGreaterThan(0);
      expect(
        result.semanticEvidence.socialEngineering.some((s) => ['SOCIAL_PROOF', 'SECRECY', 'CURIOSITY_HOOK', 'EXCLUSIVITY'].includes(s.tactic))
      ).toBe(true);
      expect(
        result.semanticEvidence.requests.some((r) => ['JOIN_GROUP', 'DOWNLOAD_APPLICATION', 'INSTALL_APK'].includes(r.type))
      ).toBe(true);
    }

    // RAG requirement should be NOT_REQUIRED
    expect(result.statuses.rag).toBe('RAG_NOT_REQUIRED');

    // Structured 5-part explanation check
    expect(result.explanation.summary).toContain('### Risk Analysis Summary');
    expect(result.explanation.summary).toContain('### What we detected');
    expect(result.explanation.summary).toContain('### Why this matters');
    expect(result.explanation.summary).toContain('### What we cannot verify');
    expect(result.explanation.summary).toContain('### What to do');
  });

  it('Acceptance Test 2 (Section 27): Novel paraphrase without matching keywords or dataset entries', async () => {
    const text = `My cousin says his private trading circle can turn a small amount
into huge monthly income. Everyone posts profit screenshots and says
the method is secret. He wants me to install their app.`;

    const input: CanonicalInput = {
      source: 'WEB_TEXT',
      language: 'en',
      text,
      privacyStatus: 'MASKED',
    };

    const result = await analyzeScam(input);

    expect(result.decision.band).toBe('HIGH');
    expect(result.semanticEvidence).toBeDefined();
    if (result.semanticEvidence) {
      expect(
        result.semanticEvidence.socialEngineering.some((s) => ['SOCIAL_PROOF', 'SECRECY'].includes(s.tactic))
      ).toBe(true);
      expect(
        result.semanticEvidence.requests.some((r) => ['INSTALL_APK', 'DOWNLOAD_APPLICATION'].includes(r.type))
      ).toBe(true);
    }
  });

  it('Acceptance Test 3 (Section 28): Regulatory inquiry requires authoritative RAG', async () => {
    const text = 'What does SEBI say about guaranteed investment returns?';

    const evidence = await provider.analyze({
      sanitizedText: text,
      source: 'USER_TEXT',
      language: 'en',
    });

    expect(evidence.intent).toBe('EDUCATIONAL_QA');
    expect(evidence.knowledgeRequired.type).toBe('REGULATORY_SOURCE_REQUIRED');

    // Verify Grounded RAG can answer it with verified corpus citations
    const ragRes = await askRag(text, 'en');
    expect(ragRes.status).toBe('ANSWERED');
    expect(ragRes.citations.length).toBeGreaterThan(0);
    expect(ragRes.citations[0].sourceUrl).toContain('sebi.gov.in');
  });

  it('Acceptance Test 4 (Section 29): General numeric return question is not automatically labeled a scam', async () => {
    const text = 'Can a stock investment really make 1 lakh per month?';

    const input: CanonicalInput = {
      source: 'WEB_TEXT',
      language: 'en',
      text,
      privacyStatus: 'MASKED',
    };

    const result = await analyzeScam(input);

    // Safeguard: Educational queries without active malicious solicitation should not be HIGH risk
    expect(result.decision.band).not.toBe('HIGH');
    expect(result.explanation.summary).toBeTruthy();
  });

  it('Acceptance Test 5 (Section 30): 5x money promise in secret group is detected without needing RAG', async () => {
    const text = 'Join my secret group and make 5x your money every month.';

    const input: CanonicalInput = {
      source: 'WEB_TEXT',
      language: 'en',
      text,
      privacyStatus: 'MASKED',
    };

    const result = await analyzeScam(input);

    expect(result.decision.band).toBe('HIGH');
    expect(result.statuses.rag).toBe('RAG_NOT_REQUIRED');
    expect(result.semanticEvidence).toBeDefined();
    if (result.semanticEvidence) {
      expect(
        result.semanticEvidence.claims.some((c) => ['RETURN_OR_PROFIT', 'DOUBLING_MULTIPLICATION', 'GUARANTEED_RETURN'].includes(c.type))
      ).toBe(true);
      expect(
        result.semanticEvidence.requests.some((r) => r.type === 'JOIN_GROUP')
      ).toBe(true);
    }
  });
});
