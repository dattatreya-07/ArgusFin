import { describe, expect, it } from 'vitest';
import { evaluateRegisteredRules } from './rules';
import { extractClaims } from './extract';
import { DecisionInput } from './types';

function createInput(text: string): DecisionInput {
  const claims = extractClaims(text, 'en');
  return {
    maskedText: text,
    claims,
    signals: [],
    lang: 'en',
  };
}

describe('Rules Engine', () => {
  it('triggers GUARANTEED_RETURN for promises with assured returns', () => {
    const input = createInput('We provide 100% guaranteed returns with zero risk.');
    const flags = evaluateRegisteredRules(input);
    const flagIds = flags.map((f) => f.ruleId);
    expect(flagIds).toContain('GUARANTEED_RETURN');
  });

  it('triggers RETURN_TOO_HIGH when return exceeds Tier 4 (>100x annualised)', () => {
    const input = createInput('Invest 10000 get 20000 in 30 days.');
    const flags = evaluateRegisteredRules(input);
    const flagIds = flags.map((f) => f.ruleId);
    expect(flagIds).toContain('RETURN_TOO_HIGH');
  });

  it('triggers URGENCY_LIMITED_SLOTS when urgency phrases are present', () => {
    const input = createInput('Offer ends soon! Limited slots only today.');
    const flags = evaluateRegisteredRules(input);
    const flagIds = flags.map((f) => f.ruleId);
    expect(flagIds).toContain('URGENCY_LIMITED_SLOTS');
  });

  it('triggers ASKS_OTP_OR_APP_INSTALL for OTP or remote app requests', () => {
    const input = createInput('Share OTP to activate your account or install AnyDesk.');
    const flags = evaluateRegisteredRules(input);
    const flagIds = flags.map((f) => f.ruleId);
    expect(flagIds).toContain('ASKS_OTP_OR_APP_INSTALL');
  });

  it('triggers PAY_TO_PERSONAL_ACCOUNT_OR_UPI for personal transfer requests', () => {
    const input = createInput('Transfer funds to [UPI] or [ACCOUNT_OR_ID] to start.');
    const flags = evaluateRegisteredRules(input);
    const flagIds = flags.map((f) => f.ruleId);
    expect(flagIds).toContain('PAY_TO_PERSONAL_ACCOUNT_OR_UPI');
  });

  it('triggers VIP_GROUP_OR_PRIVATE_CHANNEL for Telegram group invites', () => {
    const input = createInput('Join our VIP Telegram group for daily trading signals.');
    const flags = evaluateRegisteredRules(input);
    const flagIds = flags.map((f) => f.ruleId);
    expect(flagIds).toContain('VIP_GROUP_OR_PRIVATE_CHANNEL');
  });

  it('triggers UNVERIFIABLE_REGISTRATION_CLAIM for SEBI claims', () => {
    const input = createInput('We are an official SEBI registered advisory intermediary.');
    const flags = evaluateRegisteredRules(input);
    const flagIds = flags.map((f) => f.ruleId);
    expect(flagIds).toContain('UNVERIFIABLE_REGISTRATION_CLAIM');
  });

  it('triggers SCREENSHOT_PROFIT_PROOF for profit screenshot mentions', () => {
    const input = createInput('Check our today earnings profit screenshot below.');
    const flags = evaluateRegisteredRules(input);
    const flagIds = flags.map((f) => f.ruleId);
    expect(flagIds).toContain('SCREENSHOT_PROFIT_PROOF');
  });

  it('triggers COURSE_OR_MENTORSHIP_UPSELL for secret strategy course pitches', () => {
    const input = createInput('Join our secret trading course and millionaire mentorship program.');
    const flags = evaluateRegisteredRules(input);
    const flagIds = flags.map((f) => f.ruleId);
    expect(flagIds).toContain('COURSE_OR_MENTORSHIP_UPSELL');
  });

  it('does NOT trigger rules on benign educational text', () => {
    const input = createInput(
      'Compounding allows your investments to grow steadily over long horizons in regulated mutual funds.'
    );
    const flags = evaluateRegisteredRules(input);
    expect(flags.length).toBe(0);
  });
});
