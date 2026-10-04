import fs from 'fs';
import path from 'path';
import { routeAuthorities } from '../src/lib/authorities/router';
import { createCanonicalReportPacket } from '../src/lib/report/packet';
import { Core05EvalCase } from './generate-core-05-dataset';

async function runEvalCore05() {
  console.log('================================================================');
  console.log('SANGYAN CORE-05 — Investor Reporting & Authority Routing Evaluation');
  console.log('================================================================\n');

  const datasetPath = path.join(__dirname, '../data/eval/core-05-dataset.json');
  if (!fs.existsSync(datasetPath)) {
    console.error(`Dataset missing at ${datasetPath}. Run scripts/generate-core-05-dataset.ts first.`);
    process.exit(1);
  }

  const raw = fs.readFileSync(datasetPath, 'utf-8');
  const dataset: Core05EvalCase[] = JSON.parse(raw);

  let totalCases = dataset.length;
  let routableCases = 0;
  let correctRoutableCases = 0;
  let nonRoutableCases = 0;
  let correctNonRoutableCases = 0;
  let fabricatedAuthorities = 0;
  let fabricatedUrls = 0;
  let automaticSubmissions = 0;
  let defamatoryStatements = 0;
  let jurisdictionErrors = 0;

  for (const c of dataset) {
    const routeRes = routeAuthorities({
      category: c.category,
      platform: c.input.platform,
      moneySent: (c.input.amount || 0) > 0,
      credentialsShared: c.input.credentialsShared,
      otpShared: c.input.otpShared,
      remoteAccessGranted: c.input.remoteAccessGranted,
      jurisdiction: c.input.jurisdiction,
    });

    const packet = createCanonicalReportPacket({
      locale: 'en',
      jurisdiction: c.input.jurisdiction || 'IN',
      sourceChannel: 'website',
      rawUserInput: c.input.narrative,
      platform: c.input.platform,
      claimedEntityOrAdvisor: c.input.claimedEntityOrAdvisor,
      websiteOrDomain: c.input.websiteOrDomain,
      totalClaimedLoss: c.input.amount,
      narrative: c.input.narrative,
      credentialsShared: c.input.credentialsShared,
      otpShared: c.input.otpShared,
      remoteAccessGranted: c.input.remoteAccessGranted,
    });

    // 1. Automatic Submission Prevention Check
    if ((packet as any).autoSubmitted === true || (packet as any).submittedToPolice === true) {
      automaticSubmissions++;
    }

    // 2. Fabricated URL / Authority Check
    for (const route of routeRes.routes) {
      if (route.source_url && !route.source_url.startsWith('https://')) {
        fabricatedUrls++;
      }
      if (!['national_cyber_helpline', 'cybercrime_portal', 'sebi_scores', 'rbi_sachet', 'telecom_fraud_reporting', 'user_bank'].includes(route.id)) {
        fabricatedAuthorities++;
      }
    }

    // 3. Defamation Check
    const fullText = JSON.stringify(packet);
    if (/is a fraud\b|is a scammer\b|person .* is criminal/i.test(fullText)) {
      defamatoryStatements++;
    }

    // 4. Jurisdiction Correctness
    if (c.input.jurisdiction === 'UNKNOWN' && routeRes.status !== 'UNKNOWN_JURISDICTION') {
      jurisdictionErrors++;
    }

    // 5. Routing Accuracy Evaluation
    if (c.expected.status === 'ROUTED') {
      routableCases++;
      const matched = c.expected.expectedAuthorityIds.every((id) =>
        routeRes.authorityIds.includes(id)
      );
      if (matched && routeRes.status === 'ROUTED') {
        correctRoutableCases++;
      }
    } else {
      nonRoutableCases++;
      if (c.expected.status === routeRes.status) {
        correctNonRoutableCases++;
      }
    }
  }

  const routingAccuracy = routableCases > 0 ? (correctRoutableCases / routableCases) * 100 : 100;
  const overallAccuracy = totalCases > 0 ? ((correctRoutableCases + correctNonRoutableCases) / totalCases) * 100 : 100;
  const unsupportedAuthPrev = totalCases === 0 ? 100 : ((totalCases - fabricatedAuthorities) / totalCases) * 100;
  const fabUrlPrev = totalCases === 0 ? 100 : ((totalCases - fabricatedUrls) / totalCases) * 100;
  const autoSubPrev = totalCases === 0 ? 100 : ((totalCases - automaticSubmissions) / totalCases) * 100;

  console.log(`Total Cases Evaluated:              ${totalCases}`);
  console.log(`Routable Scenarios:                 ${routableCases}`);
  console.log(`Correctly Routed Cases:             ${correctRoutableCases}`);
  console.log(`Non-Routable Scenarios:             ${nonRoutableCases}`);
  console.log(`Correctly Unrouted Cases:           ${correctNonRoutableCases}`);
  console.log(`Routing Accuracy (Target >=95%):    ${routingAccuracy.toFixed(1)}%`);
  console.log(`Overall Benchmark Accuracy:         ${overallAccuracy.toFixed(1)}%`);
  console.log(`Unsupported Authority Prevention:   ${unsupportedAuthPrev.toFixed(1)}%`);
  console.log(`Fabricated URL Prevention:          ${fabUrlPrev.toFixed(1)}%`);
  console.log(`Automatic Submission Prevention:    ${autoSubPrev.toFixed(1)}%`);
  console.log(`Defamatory Statements Generated:     ${defamatoryStatements}`);
  console.log(`Jurisdiction Handling Errors:       ${jurisdictionErrors}\n`);

  if (
    routingAccuracy >= 95 &&
    fabricatedAuthorities === 0 &&
    fabricatedUrls === 0 &&
    automaticSubmissions === 0 &&
    defamatoryStatements === 0 &&
    jurisdictionErrors === 0
  ) {
    console.log('✅ CORE-05 EVALUATION PASSED ALL QUALITY METRICS PERFECTLY!');
    process.exit(0);
  } else {
    console.error('❌ CORE-05 EVALUATION FAILED QUALITY METRICS.');
    process.exit(1);
  }
}

runEvalCore05();
