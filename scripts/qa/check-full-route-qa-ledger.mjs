#!/usr/bin/env node
// Fail closed until an independent browser QA runner supplies real exact-SHA evidence.
import { existsSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import path from 'node:path';

const inventory = path.resolve('artifacts/qa/route-inventory.json');
const ledger = path.resolve('artifacts/qa/full-route-e2e-ledger.json');
const missing = [inventory, ledger].filter((file) => !existsSync(file));
if (missing.length > 0) {
  process.stderr.write(`BLOCKED: missing independently collected route QA evidence: ${missing.join(', ')}\nGenerate inventory for this exact SHA and supply authenticated five-pass browser E2E evidence. No synthetic PASS ledger is allowed.\n`);
  process.exitCode = 1;
} else {
  const sha = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  const child = spawnSync(process.execPath, [
    'scripts/qa/verify-full-route-qa-ledger.mjs',
    '--inventory', inventory,
    '--fixtures', 'scripts/qa/fixtures/full-route-fixtures.v1.json',
    '--ledger', ledger,
    '--candidate-sha', sha,
  ], { stdio: 'inherit' });
  if (child.error) throw child.error;
  process.exitCode = child.status ?? 1;
}
