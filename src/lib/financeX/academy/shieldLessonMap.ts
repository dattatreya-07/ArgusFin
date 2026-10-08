import { Archetype } from '@/lib/types';
import { Lesson, curriculumService } from './curriculum';

export const ARCHETYPE_LESSON_SLUG_MAP: Record<Archetype, string> = {
  DOUBLING_SCHEME: 'guaranteed-return-claims',
  PRE_APPROVED_LOAN_SCAM: 'advance-fee-scams',
  COPY_TRADING: 'copy-trading-pressure',
  PUMP_AND_DUMP_GROUP: 'copy-trading-pressure',
  COURSE_FINFLUENCER: 'copy-trading-pressure',
  FAKE_TRADING_APP_OR_PORTAL: 'fake-investment-apps',
  FAKE_ADVISORY_OR_REG_CLAIM: 'official-regulators-verification',
  REMOTE_ACCESS_SCAM: 'remote-access-scams',
  CRYPTO_STAKING_MINING: 'crypto-investment-scams',
  FAKE_IPO_OR_ALLOTMENT: 'ipos-and-allotment',
  OTHER_SUSPICIOUS_FINANCIAL_PATTERN: 'guaranteed-return-claims',
  OTHER_OR_NONE: 'guaranteed-return-claims',
};

/**
 * Returns the relevant FinanceX Academy lesson mapped to a given ArgusFin Shield scam archetype.
 */
export function getLessonForArchetype(archetype: Archetype): Lesson | undefined {
  const targetSlug = ARCHETYPE_LESSON_SLUG_MAP[archetype] || 'guaranteed-return-claims';
  return curriculumService.getLessonBySlug(targetSlug);
}
