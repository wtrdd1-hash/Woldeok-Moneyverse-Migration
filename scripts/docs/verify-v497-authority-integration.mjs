import fs from 'node:fs';

const pairs = [
  ['docs/planning/PROJECT_PLAN.md', 'docs/planning/PROJECT_PLAN.ko.md'],
  ['docs/planning/INTEGRATED_PLANNING_MASTER.md', 'docs/planning/INTEGRATED_PLANNING_MASTER.ko.md'],
  ['docs/planning/SECURITY_MASTER_PLAN.md', 'docs/planning/SECURITY_MASTER_PLAN.ko.md'],
  ['docs/planning/SECURITY_ASSURANCE_MASTER_PLAN.md', 'docs/planning/SECURITY_ASSURANCE_MASTER_PLAN.ko.md'],
  ['docs/planning/AI_ECONOMY_CONTROLLER_SPEC.md', 'docs/planning/AI_ECONOMY_CONTROLLER_SPEC.ko.md'],
  ['docs/mobile-api-runtime-contract.md', 'docs/mobile-api-runtime-contract.ko.md'],
  ['docs/operations/security-model.md', 'docs/operations/security-model.ko.md'],
  ['docs/architecture/database-security.md', 'docs/architecture/database-security.ko.md'],
  ['docs/API_CATALOG_MASTER.md', 'docs/API_CATALOG_MASTER.ko.md'],
];

const common = [
  'v2026.10.01.499',
  '/app-api/v2',
  '/site-api/v1',
  'Economy Core',
  'TREASURY_MAIN',
  'Policy Registry',
  'workload identity',
  'App API v1',
  'CORE-AUTHORITY-V499',
];

const failures = [];
for (const [en, ko] of pairs) {
  for (const file of [en, ko]) {
    if (!fs.existsSync(file)) {
      failures.push(`${file}: missing paired document`);
      continue;
    }
    const text = fs.readFileSync(file, 'utf8');
    for (const marker of common) {
      if (!text.includes(marker)) failures.push(`${file}: missing ${marker}`);
    }
    if (!text.includes('100%')) failures.push(`${file}: missing 100% tax conservation marker`);
  }
}

const project = fs.readFileSync('docs/planning/PROJECT_PLAN.md', 'utf8');
if (!project.includes('Current integrated version: v2026.10.01.499')) {
  failures.push('PROJECT_PLAN.md: current integrated version is not v2026.10.01.499');
}
if (!/tax[^\n]{0,120}100%[^\n]{0,120}TREASURY_MAIN/i.test(project)) {
  failures.push('PROJECT_PLAN.md: missing explicit tax -> 100% TREASURY_MAIN authority');
}
if (!/direct member balance[^\n]{0,80}(0|prohibit)/i.test(project)) {
  failures.push('PROJECT_PLAN.md: missing zero/prohibited direct member balance AI write');
}

const ai = fs.readFileSync('docs/planning/AI_ECONOMY_CONTROLLER_SPEC.md', 'utf8');
for (const phrase of ['proposal-only', 'direct absolute stock-price', '24 hours']) {
  if (!ai.toLowerCase().includes(phrase.toLowerCase())) {
    failures.push(`AI_ECONOMY_CONTROLLER_SPEC.md: missing ${phrase}`);
  }
}

const mobile = fs.readFileSync('docs/mobile-api-runtime-contract.md', 'utf8');
if (!mobile.includes('target canonical native contract')) {
  failures.push('mobile-api-runtime-contract.md: missing target canonical native contract status');
}
if (!mobile.includes('compatibility')) failures.push('mobile-api-runtime-contract.md: missing v1 compatibility status');

if (failures.length) {
  console.error('v499 authority integration verification FAILED');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log(`v499 authority integration verification PASSED: ${pairs.length * 2} paired authority files`);
