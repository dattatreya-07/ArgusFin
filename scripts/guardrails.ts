import fs from 'fs';
import path from 'path';

/**
 * Static Analysis Guardrail Verification Script
 *
 * Checks source files and locale catalogs against core hackathon compliance rules:
 * 1. Prohibited monetisation / advisory terms: 'affiliate', 'subscribe', 'premium plan', 'buy now', 'target price'
 * 2. Unsafe promise claims: standalone 'safe' in result bands or guarantees
 * 3. Prohibited local storage writes of unmasked user text
 *
 * Limitations:
 * - Simple regex/token static scan; does not perform semantic AST flow tracing.
 * - Dynamic runtime string construction or external API returns are guarded by tests and backend schemas.
 */

const FORBIDDEN_TERMS = [
  'affiliate',
  'subscribe',
  'premium plan',
  'buy now',
  'target price',
];

const ALLOWLIST_FILE = path.join(process.cwd(), 'scripts', 'guardrails.allowlist.json');

function loadAllowlist(): string[] {
  if (fs.existsSync(ALLOWLIST_FILE)) {
    try {
      const data = fs.readFileSync(ALLOWLIST_FILE, 'utf-8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }
  return [];
}

function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
  if (!fs.existsSync(dirPath)) return arrayOfFiles;
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      if (/\.(ts|tsx|js|jsx|json)$/.test(file)) {
        arrayOfFiles.push(fullPath);
      }
    }
  });

  return arrayOfFiles;
}

function runGuardrails() {
  console.log('Running SANGYAN guardrail compliance scanner...\n');
  const allowlist = new Set(loadAllowlist());
  const directoriesToCheck = [
    path.join(process.cwd(), 'src'),
    path.join(process.cwd(), 'locales'),
  ];

  let violationsCount = 0;
  const filesToCheck: string[] = [];

  for (const dir of directoriesToCheck) {
    getAllFiles(dir, filesToCheck);
  }

  for (const file of filesToCheck) {
    const relativePath = path.relative(process.cwd(), file).replace(/\\/g, '/');
    if (allowlist.has(relativePath)) continue;

    const content = fs.readFileSync(file, 'utf-8');
    const lines = content.split('\n');

    lines.forEach((line, idx) => {
      const lineNum = idx + 1;
      const lowerLine = line.toLowerCase();

      // 1. Check forbidden terms
      for (const term of FORBIDDEN_TERMS) {
        const regex = new RegExp(`\\b${term}\\b`, 'i');
        if (regex.test(line)) {
          console.error(
            `❌ [Violation] Forbidden term "${term}" found in ${relativePath}:${lineNum}\n   -> ${line.trim()}`
          );
          violationsCount++;
        }
      }

      // 2. Check standalone 'safe' in result bands or return statements
      if (/(riskband|result_band|band).*['"]safe['"]/i.test(line) || /['"]safe['"].*(riskband|band)/i.test(line)) {
        console.error(
          `❌ [Violation] "safe" risk band label found in ${relativePath}:${lineNum}\n   -> ${line.trim()}`
        );
        violationsCount++;
      }

      // 3. Check for raw localStorage.setItem of user input or messages
      if (/localStorage\.setItem\s*\(\s*['"`](?!locale|theme|lang)[^'"`]+['"`]\s*,\s*(?!locale|theme|lang)/i.test(line)) {
        // Warning or violation if persisting non-config state
        if (/user|input|text|message|phone|pan|account|report/i.test(line)) {
          console.error(
            `❌ [Violation] Potential localStorage persistence of user content in ${relativePath}:${lineNum}\n   -> ${line.trim()}`
          );
          violationsCount++;
        }
      }
    });
  }

  if (violationsCount > 0) {
    console.error(`\n Guardrail check FAILED with ${violationsCount} violation(s).`);
    process.exit(1);
  } else {
    console.log(`✅ All guardrail compliance checks passed across ${filesToCheck.length} files.`);
    process.exit(0);
  }
}

runGuardrails();
