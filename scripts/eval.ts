import fs from 'fs';
import path from 'path';
import { maskPII } from '../src/lib/mask';
import { extractClaims } from '../src/lib/extract';
import { evaluateRegisteredRules } from '../src/lib/rules';
import { extractAllSignals } from '../src/lib/signals';
import { RulesOnlyDecisionEngine } from '../src/lib/decision/rulesOnly';
import { fuseDecisionAndRules } from '../src/lib/fuse';
import { Archetype, DecisionInput, Lang, RiskBand } from '../src/lib/types';

interface EvalCase {
  id: string;
  language: Lang;
  input_text: string;
  expected_archetype: Archetype;
  expected_band: RiskBand;
  notes?: string;
}

interface EvalResultItem {
  id: string;
  language: Lang;
  expectedArchetype: Archetype;
  actualArchetype: Archetype;
  archetypeMatch: boolean;
  expectedBand: RiskBand;
  actualBand: RiskBand;
  riskMatch: boolean;
  extractedClaimsCount: number;
  triggeredRules: string[];
  triggeredSignals: string[];
  decisionEngine: string;
  notes?: string;
}

// Tolerances for regression failure gate
const MIN_ARCHETYPE_ACCURACY_PCT = 90.0;
const MIN_HIGH_RISK_RECALL_PCT = 95.0;
const MAX_BENIGN_FALSE_ALARM_PCT = 5.0;

function loadDataset(): { dataset: EvalCase[]; source: string } {
  // Check CLI arguments for custom dataset
  const args = process.argv.slice(2);
  const datasetArgIdx = args.indexOf('--dataset');
  if (datasetArgIdx !== -1 && args[datasetArgIdx + 1]) {
    const customPath = path.resolve(process.cwd(), args[datasetArgIdx + 1]);
    if (fs.existsSync(customPath)) {
      return { dataset: JSON.parse(fs.readFileSync(customPath, 'utf-8')), source: args[datasetArgIdx + 1] };
    }
  }

  const evalPath = path.join(process.cwd(), 'data', 'eval_cases.json');
  const devPath = path.join(process.cwd(), 'data', 'dev_cases.json');

  if (fs.existsSync(evalPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(evalPath, 'utf-8'));
      if (Array.isArray(data) && data.length > 0) {
        return { dataset: data, source: 'data/eval_cases.json' };
      }
    } catch {
      // fallback to dev cases
    }
  }

  if (fs.existsSync(devPath)) {
    return { dataset: JSON.parse(fs.readFileSync(devPath, 'utf-8')), source: 'data/dev_cases.json' };
  }

  throw new Error('No evaluation dataset found in data/eval_cases.json or data/dev_cases.json');
}

async function runEvaluation() {
  console.log('========================================================================================');
  console.log('  SANGYAN / FINANCEX DECISION ENGINE EVALUATION & BENCHMARK HARNESS');
  console.log('========================================================================================\n');

  const { dataset, source } = loadDataset();
  console.log(`Loaded ${dataset.length} evaluation cases from ${source}.\n`);

  const rulesEngine = new RulesOnlyDecisionEngine();

  const perLangStats: Record<
    Lang,
    {
      total: number;
      archetypeCorrect: number;
      scamCases: number;
      scamDetected: number;
      benignCases: number;
      benignFalseAlarms: number;
    }
  > = {
    en: { total: 0, archetypeCorrect: 0, scamCases: 0, scamDetected: 0, benignCases: 0, benignFalseAlarms: 0 },
    hi: { total: 0, archetypeCorrect: 0, scamCases: 0, scamDetected: 0, benignCases: 0, benignFalseAlarms: 0 },
    ta: { total: 0, archetypeCorrect: 0, scamCases: 0, scamDetected: 0, benignCases: 0, benignFalseAlarms: 0 },
  };

  const perArchetypeStats: Record<Archetype, { total: number; correct: number }> = {
    DOUBLING_SCHEME: { total: 0, correct: 0 },
    COPY_TRADING: { total: 0, correct: 0 },
    COURSE_FINFLUENCER: { total: 0, correct: 0 },
    CRYPTO_STAKING_MINING: { total: 0, correct: 0 },
    FAKE_TRADING_APP_OR_PORTAL: { total: 0, correct: 0 },
    FAKE_ADVISORY_OR_REG_CLAIM: { total: 0, correct: 0 },
    PUMP_AND_DUMP_GROUP: { total: 0, correct: 0 },
    REMOTE_ACCESS_SCAM: { total: 0, correct: 0 },
    FAKE_IPO_OR_ALLOTMENT: { total: 0, correct: 0 },
    OTHER_OR_NONE: { total: 0, correct: 0 },
  };

  const evalResults: EvalResultItem[] = [];
  const misclassifiedIds: Array<{
    id: string;
    lang: Lang;
    expected: string;
    got: string;
    reason: string;
    rules: string[];
    signals: string[];
    claims: unknown;
  }> = [];

  for (const c of dataset) {
    const stats = perLangStats[c.language];
    stats.total++;

    const masked = maskPII(c.input_text);
    const claims = extractClaims(masked.masked, c.language);
    const signalSet = await extractAllSignals(masked.masked, { enableRdap: false });

    const input: DecisionInput = {
      maskedText: masked.masked,
      claims,
      signals: signalSet.signals,
      lang: c.language,
    };

    const flags = evaluateRegisteredRules(input);
    const decision = await rulesEngine.decide(input);
    const fusion = fuseDecisionAndRules(flags, decision);

    // Archetype match
    const archMatch = fusion.topArchetype.top === c.expected_archetype;
    perArchetypeStats[c.expected_archetype].total++;
    if (archMatch) {
      stats.archetypeCorrect++;
      perArchetypeStats[c.expected_archetype].correct++;
    } else {
      misclassifiedIds.push({
        id: c.id,
        lang: c.language,
        expected: `${c.expected_archetype} (${c.expected_band})`,
        got: `${fusion.topArchetype.top} (${fusion.finalBand})`,
        reason: 'Archetype mismatch',
        rules: flags.map((f) => f.ruleId),
        signals: signalSet.signals.map((s) => s.id),
        claims,
      });
    }

    // High risk recall (scam cases flagged HIGH or MEDIUM)
    let riskMatch = false;
    if (c.expected_band === 'HIGH' || c.expected_band === 'MEDIUM') {
      stats.scamCases++;
      if (fusion.finalBand === 'HIGH' || fusion.finalBand === 'MEDIUM') {
        stats.scamDetected++;
        riskMatch = true;
      } else {
        misclassifiedIds.push({
          id: c.id,
          lang: c.language,
          expected: `${c.expected_archetype} (${c.expected_band})`,
          got: `${fusion.topArchetype.top} (${fusion.finalBand})`,
          reason: 'High-risk recall missed',
          rules: flags.map((f) => f.ruleId),
          signals: signalSet.signals.map((s) => s.id),
          claims,
        });
      }
    }

    // Benign false alarm (benign flagged HIGH)
    if (c.expected_band === 'LOW_SIGNALS' || c.expected_band === 'CANNOT_VERIFY') {
      stats.benignCases++;
      if (fusion.finalBand === 'HIGH') {
        stats.benignFalseAlarms++;
        misclassifiedIds.push({
          id: c.id,
          lang: c.language,
          expected: `${c.expected_archetype} (${c.expected_band})`,
          got: `${fusion.topArchetype.top} (${fusion.finalBand})`,
          reason: 'Benign false alarm',
          rules: flags.map((f) => f.ruleId),
          signals: signalSet.signals.map((s) => s.id),
          claims,
        });
      } else {
        riskMatch = true;
      }
    }

    evalResults.push({
      id: c.id,
      language: c.language,
      expectedArchetype: c.expected_archetype,
      actualArchetype: fusion.topArchetype.top,
      archetypeMatch: archMatch,
      expectedBand: c.expected_band,
      actualBand: fusion.finalBand,
      riskMatch,
      extractedClaimsCount: claims.promisedReturns.length + claims.requests.length + claims.urgencyPhrases.length,
      triggeredRules: flags.map((f) => f.ruleId),
      triggeredSignals: signalSet.signals.map((s) => s.id),
      decisionEngine: decision.engine,
      notes: c.notes,
    });
  }

  // Summary Table By Language
  console.log('-----------------------------------------------------------------------------------------');
  console.log('| Language | Cases | Archetype Accuracy | High-Risk Recall | Benign False Alarm Rate |');
  console.log('-----------------------------------------------------------------------------------------');

  let totalCases = 0;
  let totalArchCorrect = 0;
  let totalScams = 0;
  let totalScamsDetected = 0;
  let totalBenign = 0;
  let totalFalseAlarms = 0;

  for (const lang of ['en', 'hi', 'ta'] as Lang[]) {
    const s = perLangStats[lang];
    totalCases += s.total;
    totalArchCorrect += s.archetypeCorrect;
    totalScams += s.scamCases;
    totalScamsDetected += s.scamDetected;
    totalBenign += s.benignCases;
    totalFalseAlarms += s.benignFalseAlarms;

    const archAcc = s.total > 0 ? ((s.archetypeCorrect / s.total) * 100).toFixed(1) + '%' : 'N/A';
    const recall = s.scamCases > 0 ? ((s.scamDetected / s.scamCases) * 100).toFixed(1) + '%' : 'N/A';
    const falseAlarm = s.benignCases > 0 ? ((s.benignFalseAlarms / s.benignCases) * 100).toFixed(1) + '%' : 'N/A';

    console.log(
      `| ${lang.padEnd(8)} | ${String(s.total).padEnd(5)} | ${archAcc.padEnd(18)} | ${recall.padEnd(16)} | ${falseAlarm.padEnd(23)} |`
    );
  }

  console.log('-----------------------------------------------------------------------------------------');
  const numArchAcc = (totalArchCorrect / totalCases) * 100;
  const numRecall = totalScams > 0 ? (totalScamsDetected / totalScams) * 100 : 100;
  const numFalseAlarm = totalBenign > 0 ? (totalFalseAlarms / totalBenign) * 100 : 0;

  const overallArchAcc = numArchAcc.toFixed(1) + '%';
  const overallRecall = totalScams > 0 ? numRecall.toFixed(1) + '%' : 'N/A';
  const overallFalseAlarm = totalBenign > 0 ? numFalseAlarm.toFixed(1) + '%' : 'N/A';

  console.log(
    `| OVERALL  | ${String(totalCases).padEnd(5)} | ${overallArchAcc.padEnd(18)} | ${overallRecall.padEnd(16)} | ${overallFalseAlarm.padEnd(23)} |`
  );
  console.log('-----------------------------------------------------------------------------------------\n');

  // Archetype Breakdown Table
  console.log('Archetype Breakdown:');
  console.log('------------------------------------------------------------');
  console.log('| Archetype                     | Total Cases | Accuracy   |');
  console.log('------------------------------------------------------------');
  for (const [arch, stats] of Object.entries(perArchetypeStats)) {
    if (stats.total > 0) {
      const acc = ((stats.correct / stats.total) * 100).toFixed(1) + '%';
      console.log(`| ${arch.padEnd(29)} | ${String(stats.total).padEnd(11)} | ${acc.padEnd(10)} |`);
    }
  }
  console.log('------------------------------------------------------------\n');

  // Confusion / Error Report
  if (misclassifiedIds.length > 0) {
    console.log(`❌ Misclassified Cases (${misclassifiedIds.length}):`);
    misclassifiedIds.forEach((m) => {
      console.log(`\n[${m.id}] (${m.lang.toUpperCase()}) - ${m.reason}`);
      console.log(`  Expected: ${m.expected} | Got: ${m.got}`);
      console.log(`  Triggered Rules:   ${m.rules.join(', ') || 'None'}`);
      console.log(`  Triggered Signals: ${m.signals.join(', ') || 'None'}`);
    });
  } else {
    console.log('🎉 100% of benchmark evaluation cases passed cleanly with 0 errors.');
  }

  // Save machine-readable report
  const reportsDir = path.join(process.cwd(), 'reports', 'eval');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  const reportPath = path.join(reportsDir, 'latest.json');
  fs.writeFileSync(
    reportPath,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        datasetSource: source,
        totalCases,
        overallArchAcc,
        overallRecall,
        overallFalseAlarm,
        perLangStats,
        perArchetypeStats,
        results: evalResults,
      },
      null,
      2
    )
  );
  console.log(`\nMachine-readable evaluation report saved to: ${reportPath}`);

  // Automated Regression Failure Gate
  if (numArchAcc < MIN_ARCHETYPE_ACCURACY_PCT) {
    console.error(`\n❌ REGRESSION GATE FAILED: Archetype Accuracy (${overallArchAcc}) below threshold (${MIN_ARCHETYPE_ACCURACY_PCT}%).`);
    process.exit(1);
  }
  if (numRecall < MIN_HIGH_RISK_RECALL_PCT) {
    console.error(`\n❌ REGRESSION GATE FAILED: High-Risk Recall (${overallRecall}) below threshold (${MIN_HIGH_RISK_RECALL_PCT}%).`);
    process.exit(1);
  }
  if (numFalseAlarm > MAX_BENIGN_FALSE_ALARM_PCT) {
    console.error(`\n❌ REGRESSION GATE FAILED: False Alarm Rate (${overallFalseAlarm}) exceeds tolerance (${MAX_BENIGN_FALSE_ALARM_PCT}%).`);
    process.exit(1);
  }
}

runEvaluation().catch((err) => {
  console.error('Evaluation run failed:', err);
  process.exit(1);
});
