/**
 * SANGYAN / FINANCEX - Deterministic Release Smoke Test
 * Tests the entire critical user journey deterministically without requiring live network/API calls.
 */

import { computeAnnualised } from '../src/lib/calc';
import { maskPII } from '../src/lib/mask';
import { extractClaims } from '../src/lib/extract';
import { RulesOnlyDecisionEngine } from '../src/lib/decision/rulesOnly';
import { retrieveEvidence, askRag } from '../src/lib/rag';
import { routeAuthorities } from '../src/lib/authorities';
import { validateIncidentConsistency } from '../src/lib/incident';
import { validateEvidenceFile } from '../src/lib/evidence';
import { initSimulation, advanceStep, stopSimulation } from '../src/lib/payment';
import { getSystemReadiness } from '../src/lib/readiness';

async function runSmokeTests() {
  console.log('========================================================================================');
  console.log('  SANGYAN / FINANCEX PRODUCTION SMOKE TEST SUITE');
  console.log('========================================================================================\n');

  let passed = 0;
  let total = 0;

  function assert(name: string, condition: boolean, details?: string) {
    total++;
    if (condition) {
      console.log(`  [PASS] ${name}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${name} ${details ? `- ${details}` : ''}`);
      process.exitCode = 1;
    }
  }

  // 1. Health & Readiness Probe
  const readiness = getSystemReadiness();
  assert('System Readiness Audit', readiness.overallStatus === 'HEALTHY' || readiness.overallStatus === 'DEGRADED', `Status: ${readiness.overallStatus}`);
  assert('Readiness includes RAG', Boolean(readiness.capabilities.rag));
  assert('Readiness includes Calculator', readiness.capabilities.calculator.status === 'AVAILABLE');

  // 2. Privacy & PII Masking
  const rawText = 'Pay 5000 to 9876543210 or user@okhdfcbank for guaranteed 20% daily return.';
  const masked = maskPII(rawText);
  assert('PII Masking (Phone)', !masked.masked.includes('9876543210') && masked.masked.includes('[PHONE]'));
  assert('PII Masking (UPI)', !masked.masked.includes('user@okhdfcbank') && masked.masked.includes('[UPI]'));

  // 3. Calculator & Reality Ladder
  const calc = computeAnnualised({ invested: 10000, payout: 20000, durationDays: 30 });
  assert('Calculator Yield Computation', calc.success && calc.tier === 4 && calc.annualisedMultiple > 100);

  // 4. Claim Extraction & Decision Engine
  const claims = extractClaims(masked.masked, 'en');
  assert('Claims Extraction (Return & Requests)', claims.promisedReturns.length > 0 || claims.requests.length > 0);

  const engine = new RulesOnlyDecisionEngine();
  const decision = await engine.decide({
    maskedText: masked.masked,
    claims,
    signals: [],
    lang: 'en',
  });
  assert('Decision Engine (High Risk Detection)', decision.riskBand.HIGH > 0.5);

  // 5. RAG Corpus Retrieval & Q&A
  const evidence = retrieveEvidence('SEBI copy trading advisory', 'en', 3);
  assert('RAG Evidence Retrieval', evidence.length > 0 && evidence[0].publisher.includes('SEBI'));
  
  const ragAns = await askRag('What is the SEBI warning on copy trading?', 'en');
  assert('RAG Q&A Output Verification', ragAns.status === 'ANSWERED' && ragAns.citations.length > 0);

  // 6. Authority Routing
  const authRoute = routeAuthorities({
    moneySent: true,
    hoursElapsed: 2,
    situation: 'money_lost_recent',
  });
  assert('Authority Routing (1930 / Cyber Crime)', authRoute.status === 'ROUTED' && authRoute.authorityIds.includes('national_cyber_helpline'));

  // 7. Guided Incident Intake Consistency Check
  const consistency = validateIncidentConsistency({
    language: 'en',
    amount: 50000,
    when: '2026-09-15',
    platform: 'Telegram',
    whatHappened: 'Joined VIP group promising guaranteed 20% daily return. Sent 50000 to user@upi.',
    transactions: [
      {
        date: '2026-09-15',
        amount: 50000,
        paymentMethod: 'UPI',
        beneficiaryAccountOrUpi: 'scammer@upi',
      },
    ],
  });
  assert('Incident Consistency Engine', consistency.consistent && consistency.issues.length === 0);

  // 8. Evidence Intake & Security Guard
  const validFile = validateEvidenceFile('IMAGE', 'image/png', 1024 * 50, 'screenshot.png');
  assert('Evidence Security Guard (Valid PNG)', validFile.valid === true);

  const invalidFile = validateEvidenceFile('IMAGE', 'image/svg+xml', 1024, 'payload.svg');
  assert('Evidence Security Guard (Block SVG)', invalidFile.valid === false && invalidFile.error?.code === 'SECURITY_RISK');

  // 9. Payment Escalation Simulator
  const simState = initSimulation('task_scam_escalation');
  assert('Payment Simulator (Init)', simState.scenarioId === 'task_scam_escalation' && simState.currentStepIndex === 0);

  const step1 = advanceStep(simState);
  assert('Payment Simulator (Advance Step 1)', step1.cumulativePaid > 0 && !step1.isCompleted);

  const stopped = stopSimulation(simState);
  assert('Payment Simulator (Stop Simulation)', stopped.isStopped && stopped.educationalSummary.includes('Safe decision'));

  console.log('\n-----------------------------------------------------------------------------------------');
  console.log(`Smoke test completed: ${passed}/${total} assertions passed (${Math.round((passed / total) * 100)}%).`);
  console.log('-----------------------------------------------------------------------------------------\n');

  if (passed !== total) {
    process.exit(1);
  }
}

runSmokeTests().catch((err) => {
  console.error('Unhandled smoke test error:', err);
  process.exit(1);
});
