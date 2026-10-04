import fs from 'fs';
import path from 'path';
import { maskPII } from '../src/lib/mask';
import { extractClaims } from '../src/lib/extract';
import { evaluateRegisteredRules } from '../src/lib/rules';
import { RulesOnlyDecisionEngine } from '../src/lib/decision/rulesOnly';
import { Lang } from '../src/lib/types';

interface DatasetItem {
  message: string;
  label: 'scam' | 'legit';
  reason: string;
  domain: string;
  language: string;
}

async function runEvaluation() {
  const filePath = path.join(process.cwd(), 'data', 'indian_multilingual_scam_dataset.json');
  if (!fs.existsSync(filePath)) {
    console.error('Dataset file not found at:', filePath);
    process.exit(1);
  }

  const raw = fs.readFileSync(filePath, 'utf-8');
  const items: DatasetItem[] = JSON.parse(raw);

  console.log('='.repeat(85));
  console.log('  EVALUATING ON HUGGINGFACE: karanverma19/Indian_Multilingual_Scam_Message_Dataset');
  console.log('='.repeat(85));
  console.log(`Total Dataset Records: ${items.length}\n`);

  const engine = new RulesOnlyDecisionEngine();

  let scamTotal = 0;
  let scamDetected = 0;
  let legitTotal = 0;
  let legitFalseAlarms = 0;

  const perLang: Record<string, { scamTotal: number; scamDetected: number; legitTotal: number; legitFalseAlarms: number }> = {};

  for (const item of items) {
    const langKey = item.language || 'English';
    if (!perLang[langKey]) {
      perLang[langKey] = { scamTotal: 0, scamDetected: 0, legitTotal: 0, legitFalseAlarms: 0 };
    }

    const langCode: Lang = langKey.toLowerCase().includes('hindi') ? 'hi' : langKey.toLowerCase().includes('tamil') ? 'ta' : 'en';

    const masked = maskPII(item.message);
    const claims = extractClaims(masked.masked, langCode);
    const firedRules = evaluateRegisteredRules({
      maskedText: masked.masked,
      claims,
      signals: [],
      lang: langCode,
    });

    const decision = await engine.decide({
      maskedText: masked.masked,
      claims,
      signals: [],
      lang: langCode,
    });

    const isHighOrMedium = decision.riskBand.HIGH > 0.3 || decision.riskBand.MEDIUM > 0.4 || firedRules.length > 0;

    if (item.label === 'scam') {
      scamTotal++;
      perLang[langKey].scamTotal++;
      if (isHighOrMedium) {
        scamDetected++;
        perLang[langKey].scamDetected++;
      }
    } else {
      legitTotal++;
      perLang[langKey].legitTotal++;
      if (isHighOrMedium) {
        legitFalseAlarms++;
        perLang[langKey].legitFalseAlarms++;
      }
    }
  }

  const scamRecall = scamTotal > 0 ? ((scamDetected / scamTotal) * 100).toFixed(1) : '100.0';
  const falseAlarmRate = legitTotal > 0 ? ((legitFalseAlarms / legitTotal) * 100).toFixed(1) : '0.0';

  console.log('-'.repeat(85));
  console.log('| Language   | Scam Cases | Scam Recall | Legit Cases | False Alarm Rate |');
  console.log('-'.repeat(85));
  for (const [lName, stats] of Object.entries(perLang)) {
    const r = stats.scamTotal > 0 ? ((stats.scamDetected / stats.scamTotal) * 100).toFixed(1) : '100.0';
    const fa = stats.legitTotal > 0 ? ((stats.legitFalseAlarms / stats.legitTotal) * 100).toFixed(1) : '0.0';
    console.log(`| ${lName.padEnd(10)} | ${String(stats.scamTotal).padEnd(10)} | ${(r + '%').padEnd(11)} | ${String(stats.legitTotal).padEnd(11)} | ${(fa + '%').padEnd(16)} |`);
  }
  console.log('-'.repeat(85));
  console.log(`| OVERALL    | ${String(scamTotal).padEnd(10)} | ${(scamRecall + '%').padEnd(11)} | ${String(legitTotal).padEnd(11)} | ${(falseAlarmRate + '%').padEnd(16)} |`);
  console.log('-'.repeat(85));

  console.log(`\n✅ Evaluation on Indian Multilingual Scam Dataset completed successfully.`);
}

runEvaluation().catch((err) => {
  console.error('Evaluation failed:', err);
  process.exit(1);
});
