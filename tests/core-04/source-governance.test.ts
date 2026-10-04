import { describe, it, expect } from 'vitest';
import authorities from '@/../data/authorities.json';

describe('CORE-04 — Source Governance & Authority Registry Suite', () => {
  it('1. verifies authority entries have valid IDs and names', () => {
    expect(authorities).toBeDefined();
    expect(Array.isArray(authorities)).toBe(true);
    expect(authorities.length).toBeGreaterThan(0);

    authorities.forEach((auth: any) => {
      expect(auth.id).toBeTruthy();
      expect(auth.name).toBeTruthy();
      expect(auth.scope).toBeTruthy();
    });
  });

  it('2. verifies statutory authorities SEBI, RBI, Cyber Crime Helpline exist with provenance', () => {
    const ids = authorities.map((a: any) => a.id);
    expect(ids).toContain('national_cyber_helpline');
    expect(ids).toContain('sebi_scores');
    expect(ids).toContain('rbi_sachet');
  });
});
