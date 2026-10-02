import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { FallbackDecisionEngine } from './fallback';
import { DecisionInput } from '../types';

describe('FallbackDecisionEngine', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  const mockInput: DecisionInput = {
    maskedText: 'Double your money in 30 days!',
    claims: {
      promisedReturns: [{ multiple: 2, durationDays: 30, guaranteed: true }],
      urgencyPhrases: ['limited slots'],
      requests: ['GROUP_JOIN'],
      registrationClaims: [],
      urls: [],
      handles: [],
    },
    signals: [],
    lang: 'en',
  };

  it('throws if GROQ_API_KEY or GROQ_MODEL is missing', async () => {
    delete process.env.GROQ_API_KEY;
    delete process.env.GROQ_MODEL;

    const engine = new FallbackDecisionEngine();
    await expect(engine.decide(mockInput)).rejects.toThrow('missing');
  });

  it('parses valid Groq JSON response and normalizes probabilities', async () => {
    process.env.GROQ_API_KEY = 'test_key';
    process.env.GROQ_MODEL = 'test_model';

    const mockGroqResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              archetype: {
                DOUBLING_SCHEME: 0.8,
                COPY_TRADING: 0.05,
                COURSE_FINFLUENCER: 0.05,
                CRYPTO_STAKING_MINING: 0.02,
                FAKE_TRADING_APP_OR_PORTAL: 0.02,
                FAKE_ADVISORY_OR_REG_CLAIM: 0.02,
                PUMP_AND_DUMP_GROUP: 0.02,
                REMOTE_ACCESS_SCAM: 0.01,
                FAKE_IPO_OR_ALLOTMENT: 0.01,
                OTHER_OR_NONE: 0.0,
              },
              riskBand: {
                HIGH: 0.9,
                MEDIUM: 0.1,
                LOW_SIGNALS: 0.0,
                CANNOT_VERIFY: 0.0,
              },
              urgency: 0.85,
              confidence: 0.9,
            }),
          },
        },
      ],
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockGroqResponse,
    });

    const engine = new FallbackDecisionEngine();
    const result = await engine.decide(mockInput);

    expect(result.engine).toBe('llm-fallback');
    expect(result.archetype.DOUBLING_SCHEME).toBeCloseTo(0.8, 1);
    expect(result.riskBand.HIGH).toBeCloseTo(0.9, 1);
    expect(result.confidence).toBe(0.9);
  });

  it('throws on malformed JSON payload from Groq to trigger fallback chain', async () => {
    process.env.GROQ_API_KEY = 'test_key';
    process.env.GROQ_MODEL = 'test_model';

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: 'invalid json' } }],
      }),
    });

    const engine = new FallbackDecisionEngine();
    await expect(engine.decide(mockInput)).rejects.toThrow();
  });
});
