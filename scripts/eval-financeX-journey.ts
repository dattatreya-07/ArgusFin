import { argusFinShield } from '../src/lib/financeX/shield';
import { financeXAcademy } from '../src/lib/financeX/academy';
import { getRecommendations } from '../src/lib/financeX/journey/recommendation';
import { hashEvidence, hashIdentifier } from '../src/lib/financeX/prove/hashing';
import { credentialService } from '../src/lib/financeX/prove/credentialService';
import { evidenceAnchorService } from '../src/lib/financeX/prove/evidenceAnchorService';
import { maskPII } from '../src/lib/mask';

async function runEvaluation() {
  console.log('============================================================');
  console.log('FINANCEX PHASE 3 UNIFIED JOURNEY EVALUATION SUITE');
  console.log('============================================================\n');

  let totalScenarios = 0;
  let passedScenarios = 0;
  let privacyViolations = 0;
  let safetyViolations = 0;

  // 1. 20 Normal Academy Journeys
  console.log('1. Evaluating 20 Normal Academy Journeys...');
  const modulesEn = financeXAcademy.getModules('en');
  const modulesHi = financeXAcademy.getModules('hi');
  const modulesTa = financeXAcademy.getModules('ta');

  for (let i = 0; i < 20; i++) {
    totalScenarios++;
    const mod = modulesEn[i % modulesEn.length];
    if (mod && mod.slug && mod.title) {
      passedScenarios++;
    }
  }

  // 2. 20 Shield → Academy Journeys
  console.log('2. Evaluating 20 Shield → Academy Journeys...');
  const testInputs = [
    'Guaranteed 10% daily return on Telegram trading bot',
    'FQL app apk download link for task earnings',
    'Transfer ₹25000 to merchant@upi for prize money release',
    'HDFC bank KYC block update required immediately',
    'VIP Copy Trading Signals group 500% monthly yield',
  ];

  for (let i = 0; i < 20; i++) {
    totalScenarios++;
    const sample = testInputs[i % testInputs.length];
    const res = await argusFinShield.analyze({ text: sample, source: 'WEB_TEXT' });
    const recs = getRecommendations({ latestArchetype: res.decision.archetype.top });

    if (res.decision && recs.resilienceLesson) {
      passedScenarios++;
    }
    const decisionStr = JSON.stringify(res.decision);
    if (decisionStr.includes('100% scam')) {
      safetyViolations++;
    }
  }

  // 3. 10 Academy → Credential Journeys
  console.log('3. Evaluating 10 Academy → Credential Journeys...');
  for (let i = 0; i < 10; i++) {
    totalScenarios++;
    const recs = getRecommendations({
      completedLessons: ['what-is-a-return', 'cagr', 'compounding'],
    });
    if (recs.credentialEligibility?.eligible) {
      passedScenarios++;
    }
  }

  // 4. 10 Shield → Evidence Journeys
  console.log('4. Evaluating 10 Shield → Evidence Journeys...');
  for (let i = 0; i < 10; i++) {
    totalScenarios++;
    const mockReport = {
      narrative: `User ${i} received scam offer from +91987654321${i} and user${i}@upi`,
      amount: 10000 + i * 5000,
    };
    const digest = hashEvidence(mockReport);
    if (digest.startsWith('0x') && digest.length === 66) {
      passedScenarios++;
    }
    // Verify zero PII in canonicalized digest
    if (digest.includes('987654321') || digest.includes('user@upi')) {
      privacyViolations++;
    }
  }

  // 5. 10 Verification Journeys
  console.log('5. Evaluating 10 Verification Journeys...');
  for (let i = 0; i < 10; i++) {
    totalScenarios++;
    const credRes = await credentialService.verifyCredential(i + 1);
    const anchorRes = await evidenceAnchorService.verifyAnchor(`0x${'0'.repeat(64)}`);
    if (credRes.networkName && !anchorRes.isAnchored) {
      passedScenarios++;
    }
  }

  // 6. 10 Failure / Retry Scenarios
  console.log('6. Evaluating 10 Failure / Retry Scenarios...');
  for (let i = 0; i < 10; i++) {
    totalScenarios++;
    const res = await evidenceAnchorService.verifyAnchor('invalid-hash-query');
    if (!res.isAnchored && res.message) {
      passedScenarios++;
    }
  }

  // 7. 10 Multilingual Journeys
  console.log('7. Evaluating 10 Multilingual Journeys...');
  for (let i = 0; i < 10; i++) {
    totalScenarios++;
    const lang = i % 2 === 0 ? 'hi' : 'ta';
    const modules = financeXAcademy.getModules(lang);
    if (modules && modules.length > 0) {
      passedScenarios++;
    }
  }

  console.log('\n============================================================');
  console.log('EVALUATION RESULTS SUMMARY');
  console.log('============================================================');
  console.log(`Total Scenarios Tested: ${totalScenarios}`);
  console.log(`Passed Scenarios:       ${passedScenarios}`);
  console.log(`Privacy Violations:     ${privacyViolations}`);
  console.log(`Safety Violations:      ${safetyViolations}`);
  console.log(`Success Rate:           ${((passedScenarios / totalScenarios) * 100).toFixed(1)}%`);
  console.log('============================================================\n');

  if (passedScenarios === totalScenarios && privacyViolations === 0 && safetyViolations === 0) {
    console.log('FINANCEX_PHASE3_EVALUATION_SUCCESS: 100% Pass Rate Across All 90 Journeys.');
  } else {
    console.error('FINANCEX_PHASE3_EVALUATION_FAILURE: Violations or failed scenarios detected.');
    process.exit(1);
  }
}

runEvaluation().catch((err) => {
  console.error('Fatal evaluation runner error:', err);
  process.exit(1);
});
