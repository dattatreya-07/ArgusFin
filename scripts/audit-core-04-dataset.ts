import fs from 'fs';
import path from 'path';
import { Core04EvalCase } from './create-core-04-dataset';

function auditCore04Dataset() {
  const datasetPath = path.join(process.cwd(), 'data', 'eval', 'core-04-dataset.json');
  if (!fs.existsSync(datasetPath)) {
    console.error(`ERROR: Dataset file not found at ${datasetPath}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(datasetPath, 'utf-8');
  const cases: Core04EvalCase[] = JSON.parse(raw);

  console.log(`=======================================================`);
  console.log(`  SANGYAN CORE-04 DATASET AUDIT & INTEGRITY VERIFICATION`);
  console.log(`=======================================================`);
  console.log(`Total Cases Found: ${cases.length}`);

  let errors = 0;
  if (cases.length < 300) {
    console.error(`❌ Dataset size ${cases.length} is below required minimum of 300 cases.`);
    errors++;
  } else {
    console.log(`✅ Dataset size check PASS (>= 300 cases).`);
  }

  // Check Category Distribution
  const categoryCounts: Record<string, number> = {};
  cases.forEach(c => {
    categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
  });

  console.log(`\nCategory Distribution:`);
  Object.entries(categoryCounts).forEach(([cat, count]) => {
    console.log(`  - ${cat}: ${count}`);
  });

  // Check for Exact and Normalized Duplicates
  const seenExact = new Set<string>();
  const seenNormalized = new Set<string>();

  cases.forEach(c => {
    if (seenExact.has(c.text)) {
      console.error(`❌ Exact duplicate found: "${c.text}"`);
      errors++;
    }
    seenExact.add(c.text);

    const norm = c.text.toLowerCase().replace(/\s+/g, ' ').trim();
    if (seenNormalized.has(norm)) {
      console.error(`❌ Normalized duplicate found: "${c.text}"`);
      errors++;
    }
    seenNormalized.add(norm);

    if (!['HIGH', 'MEDIUM', 'LOW_SIGNALS', 'CANNOT_VERIFY'].includes(c.expectedRiskBand)) {
      console.error(`❌ Invalid risk band "${c.expectedRiskBand}" in case ID ${c.id}`);
      errors++;
    }
  });

  if (errors === 0) {
    console.log(`\n✅ DATASET AUDIT PASSED: 0 errors found across all ${cases.length} evaluation cases.`);
  } else {
    console.error(`\n❌ DATASET AUDIT FAILED with ${errors} errors.`);
    process.exit(1);
  }
}

auditCore04Dataset();
