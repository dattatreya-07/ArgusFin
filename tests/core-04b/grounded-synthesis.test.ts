import { describe, it, expect } from 'vitest';
import { askRag } from '@/lib/rag';

describe('CORE-04B — Grounded Educational AI & Q&A Synthesis Suite', () => {
  it('1. synthesizes answers across expanded Fixed Income domain', async () => {
    const res = await askRag('How does bond yield relate to bond price in fixed income?', 'en');
    expect(res.status).toBe('ANSWERED');
    expect(res.citations.length).toBeGreaterThan(0);
    expect(res.answer).toContain('yield');
  });

  it('2. synthesizes answers across Mutual Funds domain (NAV & Expense Ratio)', async () => {
    const res = await askRag('How is Net Asset Value NAV calculated in mutual funds?', 'en');
    expect(res.status).toBe('ANSWERED');
    expect(res.answer.toLowerCase()).toContain('nav');
  });

  it('3. synthesizes answers across Equities & Share Settlement (T+1)', async () => {
    const res = await askRag('What does T+1 settlement mean in equity stock markets?', 'en');
    expect(res.status).toBe('ANSWERED');
    expect(res.answer).toContain('settlement');
  });

  it('4. synthesizes answers across F&O Derivatives & Leverage Risks', async () => {
    const res = await askRag('Why is leverage dangerous in futures and options F&O trading?', 'en');
    expect(res.status).toBe('ANSWERED');
    expect(res.answer.toLowerCase()).toContain('leverage');
  });

  it('5. synthesizes answers across Crypto & Virtual Digital Assets', async () => {
    const res = await askRag('Why are cryptocurrency blockchain transactions irreversible?', 'en');
    expect(res.status).toBe('ANSWERED');
    expect(res.answer.toLowerCase()).toContain('irreversible');
  });
});
