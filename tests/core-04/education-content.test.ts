import { describe, it, expect } from 'vitest';
import { LESSONS, FINANCIAL_INSTRUMENTS, REGULATORS, SCAM_MODULES, GLOSSARY_TERMS, RESILIENCE_CARDS } from '@/lib/education/data';

describe('CORE-04 — Education Content & Resilience Taxonomy Suite', () => {
  it('1. verifies that exactly 20 Investor-Resilience Cards are exported and defined', () => {
    expect(RESILIENCE_CARDS).toBeDefined();
    expect(RESILIENCE_CARDS.length).toBe(20);
    
    // Check Card 20 explicitly teaches novel/unknown patterns
    const card20 = RESILIENCE_CARDS.find(c => c.id === 'res-20');
    expect(card20).toBeDefined();
    expect(card20?.concept).toContain('does not fit a traditional scam name');
  });

  it('2. verifies all 20 cards have required properties (title, concept, action, link, mathExplanation)', () => {
    RESILIENCE_CARDS.forEach(card => {
      expect(card.id).toBeTruthy();
      expect(card.title).toBeTruthy();
      expect(card.icon).toBeTruthy();
      expect(card.concept).toBeTruthy();
      expect(card.action).toBeTruthy();
      expect(card.link).toBeTruthy();
      expect(card.commonPattern).toBeTruthy();
      expect(card.mathExplanation).toBeTruthy();
      expect(card.safeNextStep).toBeTruthy();
    });
  });

  it('3. verifies that all 10 core financial literacy domain instruments are covered', () => {
    const slugs = FINANCIAL_INSTRUMENTS.map(i => i.slug);
    expect(slugs).toContain('fixed-deposits');
    expect(slugs).toContain('government-securities');
    expect(slugs).toContain('corporate-bonds');
    expect(slugs).toContain('mutual-funds');
    expect(slugs).toContain('equity-stocks-shares');
    expect(slugs).toContain('futures-and-options');
    expect(slugs).toContain('ipo-allotment');
    expect(slugs).toContain('commodities');
    expect(slugs).toContain('crypto-digital-assets');
    expect(slugs).toContain('copy-trading-accounts');
  });

  it('4. verifies statutory regulators (SEBI, RBI, NSDL/CDSL, NSE/BSE) are defined', () => {
    const regNames = REGULATORS.map(r => r.name);
    expect(regNames).toContain('SEBI');
    expect(regNames).toContain('RBI');
    expect(regNames).toContain('NSDL / CDSL');
    expect(regNames).toContain('NSE / BSE');
  });

  it('5. verifies every educational lesson has statutory source provenance', () => {
    LESSONS.forEach(lesson => {
      expect(lesson.sourceTitle).toBeTruthy();
      expect(lesson.sourceUrl).toBeTruthy();
      expect(lesson.publisher).toBeTruthy();
    });
  });
});
