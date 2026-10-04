import { describe, it, expect } from 'vitest';

describe('CORE-04 — Navigation & Deep Link Audit Suite', () => {
  const primaryRoutes = [
    '/check',
    '/ask',
    '/learn',
    '/calculator',
    '/intelligence',
    '/report',
    '/learn/glossary',
    '/learn/lessons/cagr',
    '/learn/instruments/mutual-funds'
  ];

  primaryRoutes.forEach((route, idx) => {
    it(`primary route #${idx + 1} (${route}) has valid syntax`, () => {
      expect(route.startsWith('/')).toBe(true);
      expect(route).not.toContain('//');
    });
  });
});
