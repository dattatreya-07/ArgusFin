import fs from 'fs';
import path from 'path';
import { maskPII } from '../src/lib/mask';
import { extractClaims } from '../src/lib/extract';
import { evaluateRegisteredRules } from '../src/lib/rules';
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

function loadDataset(): EvalCase[] {
  const evalPath = path.join(process.cwd(), 'data', 'eval_cases.json');
  const devPath = path.join(process.cwd(), 'data', 'dev_cases.json');

  if (fs.existsSync(evalPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(evalPath, 'utf-8'));
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    } catch {
      // fallback to dev cases
    }
  }

  if (fs.existsSync(devPath)) {
    return JSON.parse(fs.readFileSync(devPath, 'utf-8'));
  }

  throw new Error('No evaluation dataset found in data/eval_cases.json or data/dev_cases.json');
}

async function runEvaluation() {
  console.log('===============================================================');
  console.log('  SANGYAN RULES-ONLY DECISION ENGINE EVALUATION BENCHMARK');
  console.log('===============================================================\n');

  const dataset = loadDataset();
  console.log(`Loaded ${dataset.length} evaluation cases for benchmarking.\n`);

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

  const misclassifiedIds: Array<{ id: string; expected: string; got: string; reason: string }> = [];

  for (const c of dataset) {
    const stats = perLangStats[c.language];
    stats.total++;

    const masked = maskPII(c.input_text);
    const claims = extractClaims(masked.masked, c.language);

    const input: DecisionInput = {
      maskedText: masked.masked,
      claims,
      signals: [],
      lang: c.language,
    };

    const flags = evaluateRegisteredRules(input);
    const decision = await rulesEngine.decide(input);
    const fusion = fuseDecisionAndRules(flags, decision);

    // Archetype match
    const archMatch = fusion.topArchetype.top === c.expected_archetype;
    if (archMatch) {
      stats.archetypeCorrect++;
    } else {
      misclassifiedIds.push({
        id: c.id,
        expected: `${c.expected_archetype} (${c.expected_band})`,
        got: `${fusion.topArchetype.top} (${fusion.finalBand})`,
        reason: 'Archetype mismatch',
      });
    }

    // High risk recall (scam cases flagged HIGH or MEDIUM)
    if (c.expected_band === 'HIGH' || c.expected_band === 'MEDIUM') {
      stats.scamCases++;
      if (fusion.finalBand === 'HIGH' || fusion.finalBand === 'MEDIUM') {
        stats.scamDetected++;
      } else {
        misclassifiedIds.push({
          id: c.id,
          expected: `${c.expected_archetype} (${c.expected_band})`,
          got: `${fusion.topArchetype.top} (${fusion.finalBand})`,
          reason: 'High-risk recall missed',
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
          expected: `${c.expected_archetype} (${c.expected_band})`,
          got: `${fusion.topArchetype.top} (${fusion.finalBand})`,
          reason: 'Benign false alarm',
        });
      }
    }
  }

  // Summary Table
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
  const overallArchAcc = ((totalArchCorrect / totalCases) * 100).toFixed(1) + '%';
  const overallRecall = totalScams > 0 ? ((totalScamsDetected / totalScams) * 100).toFixed(1) + '%' : 'N/A';
  const overallFalseAlarm = totalBenign > 0 ? ((totalFalseAlarms / totalBenign) * 100).toFixed(1) + '%' : 'N/A';

  console.log(
    `| OVERALL  | ${String(totalCases).padEnd(5)} | ${overallArchAcc.padEnd(18)} | ${overallRecall.padEnd(16)} | ${overallFalseAlarm.padEnd(23)} |`
  );
  console.log('-----------------------------------------------------------------------------------------\n');

  if (misclassifiedIds.length > 0) {
    console.log(`Misclassified Cases (${misclassifiedIds.length}):`);
    misclassifiedIds.forEach((m) => {
      console.log(` - Case ID: ${m.id} | Expected: ${m.expected} | Got: ${m.got} (${m.reason})`);
    });
  } else {
    console.log('🎉 100% of benchmark evaluation cases passed cleanly on synthetic suite.');
  }

  console.log('\nNote: Benchmark ran offline against deterministic rules-only engine without LLM/network calls.');
}

runEvaluation().catch((err) => {
  console.error('Evaluation run failed:', err);
  process.exit(1);
});
