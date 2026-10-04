import { describe, it, expect } from 'vitest';
import { GET } from '@/app/api/intelligence/route';

describe('CORE-04 — Pattern Intelligence & Privacy Suite', () => {
  it('1. GET /api/intelligence returns 200 OK with privacy-safe JSON structure', async () => {
    const res = await GET();
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.disclaimer).toContain('SANGYAN-Observed');
    expect(data.disclaimer).not.toContain('India\'s Official');
    expect(data.privacyNotice).toContain('Zero raw user messages');
  });

  it('2. verifies signal distribution and top families exist', async () => {
    const res = await GET();
    const data = await res.json();

    expect(data.signalDistribution).toBeDefined();
    expect(Array.isArray(data.signalDistribution)).toBe(true);
    expect(data.signalDistribution.length).toBeGreaterThan(0);

    expect(data.topFamilies).toBeDefined();
    expect(Array.isArray(data.topFamilies)).toBe(true);
    expect(data.topFamilies.length).toBeGreaterThan(0);
  });
});
