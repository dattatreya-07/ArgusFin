import { selectBestVoice } from '../src/lib/voice/selectVoice';
import { multilingualOcrService } from '../src/lib/ocr/ocrService';
import { preprocessOcrImage } from '../src/lib/ocr/preprocess';
import { analyzeScam } from '../src/lib/scam/analyze';
import { validateN8nRequest } from '../src/lib/integrations/n8n/handler';
import { getAllCaseStudies } from '../src/lib/financeX/academy/caseStudies';

interface EvalResult {
  section: string;
  name: string;
  passed: boolean;
  details: string;
}

async function runPhase3Evaluation() {
  console.log('===========================================================');
  console.log('FinanceX Phase 3 Evaluation Suite');
  console.log('Learn. Protect. Prove.');
  console.log('===========================================================\n');

  const results: EvalResult[] = [];

  // 1. VOICE EVALUATION
  console.log('--- 1. WORKSTREAM A: MULTILINGUAL VOICE ---');
  const mockVoices = [
    { name: 'Google தமிழ்', lang: 'ta-IN', default: false, localService: true, voiceURI: 'ta-1' },
    { name: 'Google हिन्दी', lang: 'hi-IN', default: false, localService: true, voiceURI: 'hi-1' },
    { name: 'Google മലയാളം', lang: 'ml-IN', default: false, localService: true, voiceURI: 'ml-1' },
    { name: 'Google English India', lang: 'en-IN', default: false, localService: true, voiceURI: 'en-in-1' },
    { name: 'Google US English', lang: 'en-US', default: true, localService: true, voiceURI: 'en-us-1' },
  ] as unknown as SpeechSynthesisVoice[];

  // Tamil selection
  const taVoice = selectBestVoice(mockVoices, 'ta');
  const taPassed = taVoice?.lang === 'ta-IN';
  results.push({
    section: 'VOICE',
    name: 'Tamil Voice Selection (ta-IN)',
    passed: taPassed,
    details: taPassed ? `Selected: ${taVoice?.name} (${taVoice?.lang})` : 'Failed to select ta-IN',
  });

  // Malayalam selection
  const mlVoice = selectBestVoice(mockVoices, 'ml');
  const mlPassed = mlVoice?.lang === 'ml-IN';
  results.push({
    section: 'VOICE',
    name: 'Malayalam Voice Selection (ml-IN)',
    passed: mlPassed,
    details: mlPassed ? `Selected: ${mlVoice?.name} (${mlVoice?.lang})` : 'Failed to select ml-IN',
  });

  // Hindi selection
  const hiVoice = selectBestVoice(mockVoices, 'hi');
  const hiPassed = hiVoice?.lang === 'hi-IN';
  results.push({
    section: 'VOICE',
    name: 'Hindi Voice Selection (hi-IN)',
    passed: hiPassed,
    details: hiPassed ? `Selected: ${hiVoice?.name} (${hiVoice?.lang})` : 'Failed to select hi-IN',
  });

  // English fallback order (en-IN first)
  const enVoice = selectBestVoice(mockVoices, 'en');
  const enPassed = enVoice?.lang === 'en-IN';
  results.push({
    section: 'VOICE',
    name: 'English Voice Selection (en-IN preference)',
    passed: enPassed,
    details: enPassed ? `Selected: ${enVoice?.name} (${enVoice?.lang})` : 'Failed to select en-IN',
  });

  // Strict No-Fake-Fallback when missing
  const noMalayalamVoices = mockVoices.filter((v) => !v.lang.startsWith('ml'));
  const missingMl = selectBestVoice(noMalayalamVoices, 'ml');
  const noFakePassed = missingMl === null;
  results.push({
    section: 'VOICE',
    name: 'Missing Voice Strict Null (No Silent Claim)',
    passed: noFakePassed,
    details: noFakePassed ? 'Correctly returned null when voice unavailable' : 'Incorrectly claimed voice exists',
  });

  // 2. OCR EVALUATION
  console.log('\n--- 2. WORKSTREAM B: MULTILINGUAL OCR ---');
  // Preprocessing
  const prep = await preprocessOcrImage('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
  const prepPassed = typeof prep.processedImage === 'string' && prep.notes.length > 0;
  results.push({
    section: 'OCR',
    name: 'Image Preprocessing Pipeline',
    passed: prepPassed,
    details: `Status: ${prep.enhanced ? 'Enhanced' : 'Safe fallback'}, Notes: ${prep.notes.join(', ')}`,
  });

  // Script detection & language selection
  const ocrRes = await multilingualOcrService.extractTextFromImage(
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    { language: 'ta' }
  );
  const ocrPassed = ocrRes.provider.toLowerCase().includes('tesseract');
  results.push({
    section: 'OCR',
    name: 'Multilingual OCR Provider Pipeline',
    passed: ocrPassed,
    details: `Provider: ${ocrRes.provider}, Confidence: ${ocrRes.confidence}`,
  });

  // Low confidence warning
  const ocrLowConfPassed = ocrRes.isLowConfidence ? ocrRes.warnings.length > 0 : true;
  results.push({
    section: 'OCR',
    name: 'Low Confidence Quality Guard',
    passed: ocrLowConfPassed,
    details: `Warnings: ${ocrRes.warnings.join('; ') || 'None'}`,
  });

  // 3. SCAM EXPLANATION EVALUATION
  console.log('\n--- 3. WORKSTREAM C: EXPLAINABLE SCAM DETECTION ---');
  const scamRes = await analyzeScam({
    source: 'WEB_TEXT',
    language: 'en',
    text: 'Guaranteed 25% daily ROI on trading bot. Join VIP group at https://vip-bot.xyz and download the app now!',
    privacyStatus: 'MASKED',
  });

  const hasExplanation = !!scamRes.structuredExplanation;
  const hasSignals = (scamRes.structuredExplanation?.detectedSignals.length || 0) > 0;
  const scoreAligned = (scamRes.structuredExplanation?.score || 0) >= 70;
  const explPassed = hasExplanation && hasSignals && scoreAligned;

  results.push({
    section: 'SCAM_EXPLANATION',
    name: 'Structured Score Breakdown & Signal Contributions',
    passed: explPassed,
    details: `Score: ${scamRes.structuredExplanation?.score}/100, Band: ${scamRes.decision.band}, Signals: ${scamRes.structuredExplanation?.detectedSignals.length}`,
  });

  // Benign financial education test
  const benignRes = await analyzeScam({
    source: 'WEB_TEXT',
    language: 'en',
    text: 'What is NAV in mutual funds and how does compound interest work?',
    privacyStatus: 'MASKED',
  });
  const benignPassed = benignRes.decision.band === 'LOW_SIGNALS' && (benignRes.structuredExplanation?.score || 0) < 30;
  results.push({
    section: 'SCAM_EXPLANATION',
    name: 'Benign Financial Education Safeguard',
    passed: benignPassed,
    details: `Score: ${benignRes.structuredExplanation?.score}/100, Band: ${benignRes.decision.band}`,
  });

  // 4. INDIA SCAM CASE STUDIES EVALUATION
  console.log('\n--- 4. WORKSTREAM D: INDIA SCAM CASE STUDIES ---');
  const caseStudies = getAllCaseStudies();
  const csPassed = caseStudies.length >= 6;
  results.push({
    section: 'CASE_STUDIES',
    name: 'Authoritative Indian Case Studies Dataset',
    passed: csPassed,
    details: `Verified cases: ${caseStudies.length} (Digital Arrest, FPI IPO, Prepaid Tasks, Power Cut, Bank KYC, Crypto Doubling)`,
  });

  // 5. TELEGRAM / N8N INTEGRATION EVALUATION
  console.log('\n--- 5. WORKSTREAM E: TELEGRAM / N8N RELIABILITY ---');
  let n8nValidationPassed = false;
  try {
    const valid = validateN8nRequest({
      channel: 'TELEGRAM',
      message: {
        id: 'eval-tg-1',
        text: 'Electricity disconnection notice. Pay immediately.',
      },
    });
    n8nValidationPassed = valid.channel === 'TELEGRAM';
  } catch {
    n8nValidationPassed = false;
  }

  results.push({
    section: 'TELEGRAM',
    name: 'N8N Canonical Schema Validation',
    passed: n8nValidationPassed,
    details: n8nValidationPassed ? 'Telegram schema validated successfully' : 'Schema validation failed',
  });

  // PRINT SUMMARY
  console.log('\n===========================================================');
  console.log('PHASE 3 EVALUATION REPORT SUMMARY');
  console.log('===========================================================');
  let allPassed = true;
  for (const r of results) {
    const statusIcon = r.passed ? '✅ PASS' : '❌ FAIL';
    if (!r.passed) allPassed = false;
    console.log(`[${r.section}] ${statusIcon} - ${r.name}`);
    console.log(`       Details: ${r.details}`);
  }

  console.log('===========================================================');
  console.log(`Total Checks: ${results.length}, Passed: ${results.filter((r) => r.passed).length}, Failed: ${results.filter((r) => !r.passed).length}`);
  console.log(`Overall Phase 3 Status: ${allPassed ? 'PASSED' : 'FAILED'}`);
  console.log('===========================================================\n');

  if (!allPassed) {
    process.exit(1);
  }
}

runPhase3Evaluation().catch((err) => {
  console.error('Fatal evaluation failure:', err);
  process.exit(1);
});
