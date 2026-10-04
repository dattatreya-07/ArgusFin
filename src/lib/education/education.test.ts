import { describe, expect, it } from 'vitest';
import { LESSONS, FINANCIAL_INSTRUMENTS, GLOSSARY_TERMS, REGULATORS, SCAM_MODULES } from './data';

describe('Education Data Architecture', () => {
  it('contains at least 8 core lessons with required en/hi/ta translations & source provenance', () => {
    expect(LESSONS.length).toBeGreaterThanOrEqual(8);

    LESSONS.forEach((lesson) => {
      expect(lesson.slug).toBeTruthy();
      expect(lesson.title.en).toBeTruthy();
      expect(lesson.title.hi).toBeTruthy();
      expect(lesson.title.ta).toBeTruthy();
      expect(lesson.explanation.en).toBeTruthy();
      expect(lesson.sourceTitle).toBeTruthy();
      expect(lesson.sourceUrl).toMatch(/^https:\/\//);
      expect(lesson.publisher).toBeTruthy();
      expect(lesson.asOf).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  it('contains at least 6 financial instruments under SEBI, RBI, NSDL, NSE/BSE', () => {
    expect(FINANCIAL_INSTRUMENTS.length).toBeGreaterThanOrEqual(6);

    FINANCIAL_INSTRUMENTS.forEach((inst) => {
      expect(inst.slug).toBeTruthy();
      expect(inst.name.en).toBeTruthy();
      expect(inst.name.hi).toBeTruthy();
      expect(inst.name.ta).toBeTruthy();
      expect(inst.regulator).toBeTruthy();
      expect(inst.typicalReturnsBenchmark).toBeTruthy();
      expect(inst.sourceUrl).toMatch(/^https:\/\//);
    });
  });

  it('contains at least 40 glossary terms with valid definitions', () => {
    expect(GLOSSARY_TERMS.length).toBeGreaterThanOrEqual(40);

    const slugSet = new Set<string>();
    GLOSSARY_TERMS.forEach((term) => {
      expect(term.slug).toBeTruthy();
      expect(slugSet.has(term.slug)).toBe(false);
      slugSet.add(term.slug);

      expect(term.term).toBeTruthy();
      expect(term.definition.en).toBeTruthy();
      expect(term.definition.hi).toBeTruthy();
      expect(term.definition.ta).toBeTruthy();
    });
  });

  it('contains statutory regulators map (SEBI, RBI, NSDL/CDSL, NSE/BSE)', () => {
    expect(REGULATORS.length).toBeGreaterThanOrEqual(4);

    REGULATORS.forEach((reg) => {
      expect(reg.slug).toBeTruthy();
      expect(reg.name).toBeTruthy();
      expect(reg.fullName.en).toBeTruthy();
      expect(reg.whatTheyDo.en).toBeTruthy();
      expect(reg.whatTheyDoNotDo.en).toBeTruthy();
      expect(reg.officialSourceUrl).toMatch(/^https:\/\//);
    });
  });

  it('contains scam awareness modules including Crypto and Copy Trading', () => {
    expect(SCAM_MODULES.length).toBeGreaterThanOrEqual(3);

    const cryptoModule = SCAM_MODULES.find((m) => m.slug === 'crypto');
    expect(cryptoModule).toBeDefined();

    const copyTradingModule = SCAM_MODULES.find((m) => m.slug === 'copy-trading');
    expect(copyTradingModule).toBeDefined();

    const tnCryptoModule = SCAM_MODULES.find((m) => m.slug === 'crypto-southern-tn');
    expect(tnCryptoModule).toBeDefined();
  });
});
