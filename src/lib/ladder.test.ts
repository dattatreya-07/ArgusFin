import { describe, it, expect } from 'vitest';
import { computeLadderPosition, transformLadderToDisplay, LadderDataRaw } from './ladder';

describe('Reality Ladder Subsystem', () => {
  describe('computeLadderPosition', () => {
    it('handles return within benchmark range (e.g. 10% on a 20% scale)', () => {
      const result = computeLadderPosition(10, 20);
      expect(result.relativePosPct).toBe(50);
      expect(result.isOffScale).toBe(false);
      expect(result.offScaleMultiple).toBeNull();
      expect(result.breakIndicatorLabel).toBeNull();
    });

    it('handles return far above range (e.g. 92,000% annualised return)', () => {
      const result = computeLadderPosition(92000, 20);
      expect(result.relativePosPct).toBe(100);
      expect(result.isOffScale).toBe(true);
      expect(result.offScaleMultiple).toBe(4600);
      expect(result.breakIndicatorLabel).toBe('~4,600× — off this scale');
    });

    it('handles return at FD / savings boundary (e.g. 7% on a 20% scale)', () => {
      const result = computeLadderPosition(7, 20);
      expect(result.relativePosPct).toBe(35);
      expect(result.isOffScale).toBe(false);
      expect(result.offScaleMultiple).toBeNull();
      expect(result.breakIndicatorLabel).toBeNull();
    });

    it('handles zero or negative claims gracefully', () => {
      const result = computeLadderPosition(0, 20);
      expect(result.relativePosPct).toBe(0);
      expect(result.isOffScale).toBe(false);
    });
  });

  describe('transformLadderToDisplay', () => {
    it('correctly partitions unverified null rungs into hiddenRungs', () => {
      const rawNullData: LadderDataRaw = {
        status: 'TODO(verify)',
        rungs: [
          {
            id: 'savings',
            label_key: 'ladder.savings',
            name: 'Savings Account',
            value_low: null,
            value_high: null,
            unit: 'percent_per_year',
            as_of: null,
            source_url: null,
          },
        ],
      };

      const display = transformLadderToDisplay(rawNullData);
      expect(display.activeRungs).toHaveLength(0);
      expect(display.hiddenRungs).toHaveLength(1);
      expect(display.hiddenRungs[0].name).toBe('Savings Account');
      expect(display.hiddenRungs[0].reason).toBe('data being verified');
    });

    it('correctly activates verified rungs with source citations', () => {
      const sampleData: LadderDataRaw = {
        status: 'SAMPLE',
        rungs: [
          {
            id: 'fd',
            label_key: 'ladder.fd',
            name: 'Bank FD',
            value_low: 6.5,
            value_high: 7.5,
            unit: 'percent_per_year',
            as_of: '2024-10-01',
            source_url: 'https://rbi.org.in',
            illustrative: true,
          },
        ],
      };

      const display = transformLadderToDisplay(sampleData);
      expect(display.activeRungs).toHaveLength(1);
      expect(display.hiddenRungs).toHaveLength(0);
      expect(display.activeRungs[0].value_low).toBe(6.5);
      expect(display.activeRungs[0].illustrative).toBe(true);
    });
  });
});
