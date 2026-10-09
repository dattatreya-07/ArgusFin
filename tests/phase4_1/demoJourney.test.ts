import { describe, it, expect } from 'vitest';
import { runRepeatableDemoJourney } from '@/../scripts/demo-journey-60s';

describe('FinanceX Repeatable 60-90s Demo Journey', () => {
  it('successfully executes the 5-pillar demo flow within latency budget', async () => {
    const result = await runRepeatableDemoJourney();

    expect(result.success).toBe(true);
    expect(result.band).toBe('HIGH');
    expect(result.score).toBeGreaterThanOrEqual(60);
    expect(result.category).toBeDefined();
    expect(result.evidenceHash).toMatch(/^0x[a-f0-9]{64}$/i);
    expect(result.latency).toBeLessThan(1500); // Latency well within fast demo threshold
  });
});
