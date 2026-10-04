import fs from 'fs';
import path from 'path';
import { NextRequest } from 'next/server';
import { POST as checkPost } from '../src/app/api/check/route';
import { POST as askPost } from '../src/app/api/ask/route';
import { POST as n8nPost } from '../src/app/api/integrations/n8n/analyze/route';
import { POST as ocrPost } from '../src/app/api/ocr/route';

export interface ApiTestResult {
  id: string;
  category: string;
  input: string;
  endpoint: string;
  httpStatus: number;
  requestId: string;
  returnedRiskBand: string;
  returnedArchetype: string;
  signalsCount: number;
  explanation: string;
  unverifiedCount: number;
  citationsCount: number;
  latencyMs: number;
  passed: boolean;
}

const NOVEL_TEST_CASES = [
  // 10 Explicitly Specified Categories
  {
    id: 'api-01-courier',
    category: 'courier',
    input: 'Your package is waiting for customs clearance. Pay ₹1840 within 30 minutes using the link below or the shipment will be returned.',
  },
  {
    id: 'api-02-electricity',
    category: 'electricity',
    input: 'FINAL NOTICE: Electricity supply will be disconnected tonight because your bill has not been updated. Complete the ₹799 verification payment immediately.',
  },
  {
    id: 'api-03-employment',
    category: 'employment',
    input: 'You have been selected for remote work. Deposit ₹1,200 for account activation and you can start earning ₹4,000 per day.',
  },
  {
    id: 'api-04-refund',
    category: 'fake refund',
    input: 'Your online purchase qualifies for a ₹6,850 refund. Confirm your bank details through this link within 15 minutes.',
  },
  {
    id: 'api-05-gov',
    category: 'government impersonation',
    input: 'Your subsidy application is approved. Pay ₹399 processing charges to release the amount today.',
  },
  {
    id: 'api-06-social',
    category: 'social engineering',
    input: "Your friend's phone has been damaged. Please urgently send ₹12,000 to this new UPI ID. Do not call because the phone is unavailable.",
  },
  {
    id: 'api-07-support',
    category: 'fake support',
    input: 'Your wallet account has been flagged. Contact our security officer on this number and install the verification application.',
  },
  {
    id: 'api-08-crypto',
    category: 'crypto',
    input: 'Your staking account generated ₹72,000. Pay the release tax first to unlock your balance.',
  },
  {
    id: 'api-09-legal',
    category: 'fake legal threat',
    input: 'A legal notice has been issued against your mobile number. Pay the settlement amount immediately to avoid further action.',
  },
  {
    id: 'api-10-travel',
    category: 'fake travel refund',
    input: 'Your cancelled flight refund is pending. Pay ₹249 verification charges to receive ₹18,500.',
  },
  // 10 Additional Novel Categories
  {
    id: 'api-11-digital-arrest',
    category: 'digital arrest',
    input: 'Customs department alert: A parcel containing illegal items was seized under your name. Pay ₹25,000 verification bail via UPI immediately.',
  },
  {
    id: 'api-12-challan-apk',
    category: 'traffic challan apk',
    input: 'E-challan pending: Your vehicle recorded 2 speeding violations. Download the official challan pay app from http://echallan-vahan.xyz/pay.apk to avoid court summons.',
  },
  {
    id: 'api-13-rental-deposit',
    category: 'rental deposit scam',
    input: 'Spacious 2BHK flat available for rent at ₹15,000. Pay ₹5,000 gate pass deposit before visiting to reserve flat.',
  },
  {
    id: 'api-14-medical-emergency',
    category: 'medical emergency scam',
    input: 'Urgent: Your nephew was admitted to hospital following an accident. Send ₹15,000 immediately to hospital counter UPI emergency-care@upi for operation.',
  },
  {
    id: 'api-15-pension-update',
    category: 'fake pension update',
    input: 'EPFO Alert: Your monthly pension will be suspended due to pending digital life certificate. Submit OTP and pay ₹199 update fee.',
  },
  {
    id: 'api-16-blue-tick',
    category: 'fake social media verification',
    input: 'Instagram badge approval: Your account is verified for blue tick. Pay ₹499 badge fee via link within 2 hours or verification expires.',
  },
  {
    id: 'api-17-loyalty-points',
    category: 'fake loyalty rewards',
    input: 'Credit Card Reward Points expiring: Redeem 14,500 points worth ₹7,250 now. Enter credit card number and OTP at http://card-rewards-claim.xyz.',
  },
  {
    id: 'api-18-sim-kyc',
    category: 'fake telecom kyc',
    input: 'Jio SIM alert: Your SIM card will be deactivated within 2 hours due to unverified KYC. Call customer care 9876543210 immediately.',
  },
  {
    id: 'api-19-task-group',
    category: 'task scam / telegram vip group',
    input: 'Earn money by rating Google maps places. Complete 3 tasks to earn ₹1,500. Transfer ₹2,000 deposit to enter VIP payout channel.',
  },
  {
    id: 'api-20-loan-waiver',
    category: 'fake loan waiver',
    input: 'PM Mudra Loan Waiver scheme: Your outstanding loan of ₹2,00,000 is 100% waived off. Pay ₹1,499 registration fee to download clearance certificate.',
  },
];

const BENIGN_TEST_CASES = [
  { id: 'benign-01', input: 'How does electricity billing work in India?' },
  { id: 'benign-02', input: 'What should I check before paying a customs fee for an international package?' },
  { id: 'benign-03', input: 'Can a courier company legitimately charge customs duty upon delivery?' },
  { id: 'benign-04', input: 'My bank sent me a KYC reminder. What does KYC mean?' },
  { id: 'benign-05', input: 'How does crypto staking work and what are the legitimate risks?' },
  { id: 'benign-06', input: 'I received a job offer. What standard things should I verify before accepting?' },
  { id: 'benign-07', input: 'How do government subsidies normally work for agricultural equipment?' },
];

async function runEvaluation() {
  console.log('Starting CORE-02.3A Production API Verification Evaluation...');
  const results: ApiTestResult[] = [];
  const n8nParityResults: Array<{ id: string; checkBand: string; n8nBand: string; parity: boolean }> = [];
  const imageResults: Array<{ id: string; filename: string; band: string; valid: boolean }> = [];

  // 1. Evaluate 20 novel unseen messages through /api/check
  for (let i = 0; i < NOVEL_TEST_CASES.length; i++) {
    const testCase = NOVEL_TEST_CASES[i];
    const startTime = Date.now();

    const req = new NextRequest('http://localhost:3000/api/check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': `10.10.0.${i + 1}`,
      },
      body: JSON.stringify({ maskedText: testCase.input, lang: 'en' }),
    });

    const res = await checkPost(req);
    const latencyMs = Date.now() - startTime;
    const body = await res.json();

    const passed = res.status === 200 && ['HIGH', 'MEDIUM'].includes(body.band);

    results.push({
      id: testCase.id,
      category: testCase.category,
      input: testCase.input,
      endpoint: '/api/check',
      httpStatus: res.status,
      requestId: body.requestId || 'unknown',
      returnedRiskBand: body.band || 'NONE',
      returnedArchetype: body.archetype?.top || 'NONE',
      signalsCount: body.signals?.length || 0,
      explanation: body.explanation || '',
      unverifiedCount: body.unverified?.length || 0,
      citationsCount: body.citations?.length || 0,
      latencyMs,
      passed,
    });

    // 2. Evaluate n8n parity for the same message
    const n8nReq = new NextRequest('http://localhost:3000/api/integrations/n8n/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-n8n-secret': 'dev_secret_n8n_sangyan_2026',
        'x-forwarded-for': `10.20.0.${i + 1}`,
      },
      body: JSON.stringify({
        channel: 'TELEGRAM',
        message: { id: `eval_n8n_${i}`, text: testCase.input },
        locale: 'en',
      }),
    });

    const n8nRes = await n8nPost(n8nReq);
    const n8nBody = await n8nRes.json();
    const n8nBand = n8nBody.decision?.band || 'NONE';

    n8nParityResults.push({
      id: testCase.id,
      checkBand: body.band || 'NONE',
      n8nBand,
      parity: body.band === n8nBand,
    });
  }

  // 3. Evaluate Benign Cases through /api/check
  let benignPassed = 0;
  for (let i = 0; i < BENIGN_TEST_CASES.length; i++) {
    const bCase = BENIGN_TEST_CASES[i];
    const req = new NextRequest('http://localhost:3000/api/check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': `10.30.0.${i + 1}`,
      },
      body: JSON.stringify({ maskedText: bCase.input, lang: 'en' }),
    });
    const res = await checkPost(req);
    const body = await res.json();
    if (res.status === 200 && body.band === 'LOW_SIGNALS') {
      benignPassed++;
    }
  }

  // 4. Evaluate Image OCR Route (/api/ocr)
  const imageSamples = [
    { filename: 'bank_kyc.png', ocrText: 'HDFC BANK ALERT: Your netbanking is blocked. Click http://hdfc-verify.xyz to update KYC immediately.' },
    { filename: 'courier_customs.png', ocrText: 'DHL EXPRESS: Your parcel #99302 is held at customs. Pay ₹1,850 clearance tax within 1 hour or shipment is cancelled.' },
    { filename: 'electricity_disconnect.png', ocrText: 'URGENT ELECTRICITY NOTICE: Power line will be cut off tonight at 9:30 PM. Pay ₹1,299 via http://bescom-pay.site.' },
    { filename: 'work_from_home.png', ocrText: 'VIP Job Offer: Earn ₹5,000 daily by liking YouTube videos. Deposit ₹1,000 registration fee to activate account.' },
  ];

  for (let i = 0; i < imageSamples.length; i++) {
    const img = imageSamples[i];
    const req = new NextRequest('http://localhost:3000/api/ocr', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': `10.40.0.${i + 1}`,
      },
      body: JSON.stringify({ ocrText: img.ocrText, filename: img.filename, mimeType: 'image/png' }),
    });
    const res = await ocrPost(req);
    const body = await res.json();
    imageResults.push({
      id: `img-${i + 1}`,
      filename: img.filename,
      band: body.analysis?.decision?.band || 'NONE',
      valid: res.status === 200 && body.validation?.valid === true && ['HIGH', 'MEDIUM'].includes(body.analysis?.decision?.band),
    });
  }

  // Summary Metrics
  const totalNovel = results.length;
  const passedNovel = results.filter((r) => r.passed).length;
  const parityPassed = n8nParityResults.filter((p) => p.parity).length;
  const imagePassed = imageResults.filter((img) => img.valid).length;

  const summary = {
    evaluatedAt: new Date().toISOString(),
    totalNovelScams: totalNovel,
    passedNovelScams: passedNovel,
    novelScamPassRate: (passedNovel / totalNovel) * 100,
    benignQueriesTested: BENIGN_TEST_CASES.length,
    benignQueriesPassed: benignPassed,
    benignPassRate: (benignPassed / BENIGN_TEST_CASES.length) * 100,
    n8nParityCases: n8nParityResults.length,
    n8nParityPassed: parityPassed,
    n8nParityRate: (parityPassed / n8nParityResults.length) * 100,
    imageCasesTested: imageSamples.length,
    imageCasesPassed: imagePassed,
    imagePassRate: (imagePassed / imageSamples.length) * 100,
  };

  // Write Latest JSON Results
  const latestPath = path.join(process.cwd(), 'reports', 'eval', 'core-02.3a-latest.json');
  fs.mkdirSync(path.dirname(latestPath), { recursive: true });
  fs.writeFileSync(latestPath, JSON.stringify({ summary, apiResults: results, n8nParityResults, imageResults }, null, 2));

  // Write Summary Markdown
  const summaryMdPath = path.join(process.cwd(), 'reports', 'eval', 'core-02.3a-summary.md');
  const summaryMd = `# CORE-02.3A — Production API & Open-World Verification Summary

## Executive Overview
- **Evaluated At**: ${summary.evaluatedAt}
- **Novel Unseen Scam API Pass Rate**: **${summary.novelScamPassRate.toFixed(1)}%** (${summary.passedNovelScams} / ${summary.totalNovelScams})
- **Benign Educational Pass Rate**: **${summary.benignPassRate.toFixed(1)}%** (${summary.benignQueriesPassed} / ${summary.benignQueriesTested})
- **n8n Decision Parity Rate**: **${summary.n8nParityRate.toFixed(1)}%** (${summary.n8nParityPassed} / ${summary.n8nParityCases})
- **Image OCR Pipeline Pass Rate**: **${summary.imagePassRate.toFixed(1)}%** (${summary.imageCasesPassed} / ${summary.imageCasesTested})

---

## 20 Novel Unseen Scam API Results (/api/check)

| ID | Category | Returned Risk | Returned Archetype | HTTP Status | Latency | Pass/Fail |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
${results
  .map(
    (r) =>
      `| \`${r.id}\` | ${r.category} | **${r.returnedRiskBand}** | \`${r.returnedArchetype}\` | \`${r.httpStatus}\` | ${r.latencyMs}ms | ${r.passed ? '✅ PASS' : '❌ FAIL'} |`
  )
  .join('\n')}

---

## n8n Integration Parity (/api/integrations/n8n/analyze)

| ID | Check Band | n8n Band | Parity |
| :--- | :--- | :--- | :--- |
${n8nParityResults.map((p) => `| \`${p.id}\` | **${p.checkBand}** | **${p.n8nBand}** | ${p.parity ? '✅ MATCH' : '❌ MISMATCH'} |`).join('\n')}
`;

  fs.writeFileSync(summaryMdPath, summaryMd);
  console.log(`Evaluation complete. Results written to ${summaryMdPath}`);
}

runEvaluation().catch((err) => {
  console.error('CORE-02.3A evaluation failed:', err);
  process.exit(1);
});
