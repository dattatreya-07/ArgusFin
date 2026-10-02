import { describe, it, expect } from 'vitest';
import { extractClaims } from './extract';
import { computeAnnualised } from './calc';
import { evaluateRegisteredRules } from './rules';
import { defaultDecisionEngine } from './decision';
import { fuseDecisionAndRules } from './fuse';
import { routeAuthorities } from './authorities/router';
import { validateIncidentConsistency } from './incident/consistency';
import { defaultOcrProvider } from './evidence/ocr';
import { defaultSttProvider } from './evidence/stt';
import { askRag } from './rag';
import {
  initSimulation,
  advanceStep,
  stopSimulation,
  getScenario,
} from './payment';
import { DecisionInput } from './types';

describe('P2-17 -> P2-20 End-to-End Integration & Multi-Scenario Audit', () => {
  it('Scenario A — High-Risk Return Claim Flow', async () => {
    const rawText = 'Double your money in 30 days! Guaranteed 2x returns. Pay via UPI.';
    const claims = extractClaims(rawText, 'en');

    expect(claims.promisedReturns.length).toBeGreaterThan(0);
    const pr = claims.promisedReturns[0];
    expect(pr.multiple).toBe(2);
    expect(pr.durationDays).toBe(30);

    const calcRes = computeAnnualised({ invested: 10000, payout: 20000, durationDays: 30 });
    expect(calcRes.success).toBe(true);
    if (calcRes.success) {
      expect(calcRes.multiple).toBe(2);
      expect(calcRes.overflow).toBe(false);
      expect(calcRes.annualisedMultiple).toBeGreaterThan(100);
    }

    const input: DecisionInput = {
      maskedText: rawText,
      claims,
      signals: [],
      lang: 'en',
    };

    const flags = evaluateRegisteredRules(input);
    expect(flags.some((f) => f.ruleId === 'GUARANTEED_RETURN')).toBe(true);
    expect(flags.some((f) => f.ruleId === 'RETURN_TOO_HIGH')).toBe(true);

    const decision = await defaultDecisionEngine.decide(input);
    const fusion = fuseDecisionAndRules(flags, decision);
    expect(fusion.finalBand).toBe('HIGH');
  });

  it('Scenario B — Hindi Copy Trading Flow', async () => {
    const hindiClaim = 'हमारे वीआईपी टेलीग्राम में शामिल हों। कॉपी ट्रेडिंग से 100% दैनिक मुनाफा कमाएं।';
    const claims = extractClaims(hindiClaim, 'hi');

    const input: DecisionInput = {
      maskedText: hindiClaim,
      claims,
      signals: [],
      lang: 'hi',
    };

    const flags = evaluateRegisteredRules(input);
    const decision = await defaultDecisionEngine.decide(input);
    const fusion = fuseDecisionAndRules(flags, decision);

    expect(fusion.finalBand).toBe('HIGH');
    expect(fusion.topArchetype.top).toBe('COPY_TRADING');
  });

  it('Scenario C — Tamil Remote Access & Authority Routing', async () => {
    const tamilClaim = 'செயலியை பதிவிறக்கவும் AnyDesk OTP பகிரவும்.';
    const claims = extractClaims(tamilClaim, 'ta');

    const input: DecisionInput = {
      maskedText: tamilClaim,
      claims,
      signals: [],
      lang: 'ta',
    };

    const flags = evaluateRegisteredRules(input);
    const decision = await defaultDecisionEngine.decide(input);
    const fusion = fuseDecisionAndRules(flags, decision);

    expect(fusion.finalBand).toBe('HIGH');
    expect(fusion.topArchetype.top).toBe('REMOTE_ACCESS_SCAM');

    const routes = routeAuthorities({
      remoteAccessGranted: true,
      otpShared: true,
      lang: 'ta',
    });

    expect(routes.status).toBe('ROUTED');
    expect(routes.authorityIds).toContain('national_cyber_helpline');
    expect(routes.authorityIds).toContain('user_bank');
  });

  it('Scenario D — Screenshot OCR -> Extracted Claim -> Decision Engine', async () => {
    const ocrSample = 'Double your deposit in 7 days! 100% sure profit guaranteed. Pay via UPI.';
    const ocrRes = await defaultOcrProvider.processImage(ocrSample, 'en');

    expect(ocrRes.status).toBe('FOUND');

    const claims = extractClaims({
      text: ocrRes.text || '',
      source: 'OCR',
      evidenceId: 'screenshot-01',
    }, 'en');

    expect(claims.promisedReturns.length).toBeGreaterThan(0);

    const input: DecisionInput = {
      maskedText: ocrRes.text || '',
      claims,
      signals: [],
      lang: 'en',
    };

    const flags = evaluateRegisteredRules(input);
    const decision = await defaultDecisionEngine.decide(input);
    const fusion = fuseDecisionAndRules(flags, decision);
    expect(fusion.finalBand).toBe('HIGH');
  });

  it('Scenario E — Voice STT -> Transcript Review -> Decision Pipeline', async () => {
    const voiceInput = 'They told me to transfer money to 9123456789 for 300% guaranteed return in 10 days.';
    const sttRes = await defaultSttProvider.transcribe(voiceInput, 'en');

    expect(sttRes.status).toBe('FOUND');
    expect(sttRes.text).toContain('[PHONE]');

    const claims = extractClaims({
      text: sttRes.text || '',
      source: 'STT',
      evidenceId: 'audio-rec-01',
    }, 'en');

    expect(claims.promisedReturns.length).toBeGreaterThan(0);
  });

  it('Scenario F — Incident Intake -> Consistency Check -> Authority Route -> Bilingual Draft', () => {
    const incidentData = {
      language: 'ta' as const,
      when: '2026-09-25T14:00:00Z',
      platform: 'WhatsApp',
      entityName: 'VIP Wealth Capital',
      amount: 60000,
      transactions: [
        {
          utrNumber: 'UTR829102938102',
          amount: 60000,
          beneficiaryAccountOrUpi: 'merchant@okaxis',
          paymentMethod: 'UPI',
        },
      ],
      whatHappened: 'Joined investment group and transferred money.',
      otpShared: false,
      remoteAccessGranted: false,
    };

    const consistency = validateIncidentConsistency(incidentData);
    expect(consistency.consistent).toBe(true);

    const routes = routeAuthorities({
      category: 'PROMISED_RETURN',
      moneySent: true,
      lang: 'ta',
    });

    expect(routes.status).toBe('ROUTED');
    expect(routes.authorityIds).toContain('national_cyber_helpline');
  });

  it('Scenario G — Grounded Regulatory RAG Evidence Retrieval', async () => {
    const response = await askRag('What is the 1930 golden hour helpline?', 'en');
    expect(response.status).toBe('ANSWERED');
    expect(response.answer).toBeDefined();
    expect(response.citations.length).toBeGreaterThan(0);
    expect(response.citations[0].sourceUrl).toContain('cybercrime.gov.in');
  });

  it('Scenario H — Out-of-Scope Query Triggers Grounded NO_SOURCE Fallback', async () => {
    const response = await askRag('What is the secret stock tip for next week?', 'en');
    expect(response.status).toBe('NO_SOURCE');
    expect(response.answer).toContain("can't verify");
    expect(response.citations).toHaveLength(0);
  });

  it('Scenario I — Educational Payment Simulator Progression', () => {
    const scenario = getScenario('task_scam_escalation');
    expect(scenario).toBeDefined();

    const state = initSimulation('task_scam_escalation');
    expect(state.currentStepIndex).toBe(0);
    expect(state.cumulativeAmountPaid).toBe(0);

    // Advance Step 1 (₹1,000)
    const res1 = advanceStep(state);
    expect(state.cumulativeAmountPaid).toBe(1000);
    expect(res1.isCompleted).toBe(false);

    // Advance Step 2 (₹5,000)
    const res2 = advanceStep(state);
    expect(state.cumulativeAmountPaid).toBe(6000);
    expect(res2.escalationMultiplier).toBe(6);

    // User chooses to Stop
    const stopRes = stopSimulation(state);
    expect(stopRes.isStopped).toBe(true);
    expect(stopRes.educationalSummary).toContain('Safe decision made');
  });
});
