import { describe, it, expect } from 'vitest';
import { getAllCaseStudies, getCaseStudyBySlug } from '../../src/lib/financeX/academy/caseStudies';

describe('Workstream D — India Scam Case Studies', () => {
  it('should load all verified case studies with required structured schema', () => {
    const cases = getAllCaseStudies();
    expect(cases.length).toBeGreaterThanOrEqual(6);

    for (const cs of cases) {
      expect(cs.slug).toBeTruthy();
      expect(cs.title).toBeTruthy();
      expect(cs.category).toBeTruthy();
      expect(cs.badge).toBeTruthy();
      expect(cs.summary).toBeTruthy();
      expect(cs.whatHappened).toBeTruthy();
      expect(cs.howVictimsApproached).toBeTruthy();
      expect(cs.warningSigns.length).toBeGreaterThanOrEqual(2);
      expect(cs.psychologicalManipulation).toBeTruthy();
      expect(cs.howMoneyLost).toBeTruthy();
      expect(cs.whatUsersShouldHaveChecked.length).toBeGreaterThanOrEqual(2);
      expect(cs.howToReport.length).toBeGreaterThanOrEqual(2);
      expect(cs.lessonsLearned.length).toBeGreaterThanOrEqual(2);
      expect(cs.officialSources.length).toBeGreaterThanOrEqual(1);
      expect(cs.shieldExamplePayload).toBeTruthy();

      for (const src of cs.officialSources) {
        expect(src.authority).toBeTruthy();
        expect(src.advisoryTitle).toBeTruthy();
        expect(src.url).toMatch(/^https?:\/\//);
        expect(src.verifiedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    }
  });

  it('should retrieve individual case study by slug', () => {
    const cs = getCaseStudyBySlug('digital-arrest-customs-parcel');
    expect(cs).toBeDefined();
    expect(cs?.category).toBe('Impersonation & Coercion');
    expect(cs?.shieldExamplePayload).toContain('narcotics');
  });
});
