import { describe, it, expect } from 'vitest';
import { getLessonForArchetype } from '@/lib/financeX/academy/shieldLessonMap';

describe('ArgusFin Shield to FinanceX Academy Lesson Mapping', () => {
  it('1. Maps DOUBLING_SCHEME to guaranteed-return-claims lesson', () => {
    const lesson = getLessonForArchetype('DOUBLING_SCHEME');
    expect(lesson).toBeDefined();
    expect(lesson?.slug).toBe('guaranteed-return-claims');
  });

  it('2. Maps PRE_APPROVED_LOAN_SCAM to advance-fee-scams lesson', () => {
    const lesson = getLessonForArchetype('PRE_APPROVED_LOAN_SCAM');
    expect(lesson).toBeDefined();
    expect(lesson?.slug).toBe('advance-fee-scams');
  });

  it('3. Maps FAKE_TRADING_APP_OR_PORTAL to fake-investment-apps lesson', () => {
    const lesson = getLessonForArchetype('FAKE_TRADING_APP_OR_PORTAL');
    expect(lesson).toBeDefined();
    expect(lesson?.slug).toBe('fake-investment-apps');
  });

  it('4. Maps REMOTE_ACCESS_SCAM to remote-access-scams lesson', () => {
    const lesson = getLessonForArchetype('REMOTE_ACCESS_SCAM');
    expect(lesson).toBeDefined();
    expect(lesson?.slug).toBe('remote-access-scams');
  });

  it('5. Handles unknown/unrecognized archetype safely', () => {
    const lesson = getLessonForArchetype('OTHER_OR_NONE');
    expect(lesson).toBeDefined();
  });
});
