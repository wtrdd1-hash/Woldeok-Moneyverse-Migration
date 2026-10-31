#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const PASS_COUNT = 5;
const FULL_SHA = /^[0-9a-f]{40}$/i;
const TERMINAL_RESULTS = new Set(['PASS', 'FAIL', 'BLOCKED']);
const DYNAMIC_SCENARIOS = new Set(['valid', 'not_found', 'permission_denied']);

function requiredOption(argv, name) {
  const index = argv.indexOf(name);
  if (index === -1 || !argv[index + 1]) throw new Error(`missing required option ${name}`);
  return argv[index + 1];
}

async function readJson(file) {
  return JSON.parse(await readFile(path.resolve(process.cwd(), file), 'utf8'));
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function addIssue(issues, message) {
  issues.push(message);
}

export function verifyLedger({ inventory, fixtures, ledger, expectedSha }) {
  const issues = [];
  if (inventory.schemaVersion !== 1 || !Array.isArray(inventory.pages)) {
    addIssue(issues, 'inventory must be schemaVersion 1 with pages');
  }
  if (fixtures.schemaVersion !== 1 || !Array.isArray(fixtures.fixtures)) {
    addIssue(issues, 'fixture catalog must be schemaVersion 1 with fixtures');
  }
  if (ledger.schemaVersion !== 1 || !Array.isArray(ledger.entries)) {
    addIssue(issues, 'ledger must be schemaVersion 1 with entries');
  }
  if (issues.length > 0) return { ok: false, issues, summary: null };

  if (ledger.inventorySha256 !== inventory.inventorySha256) {
    addIssue(issues, `inventory hash mismatch: expected ${inventory.inventorySha256}, got ${ledger.inventorySha256 ?? 'missing'}`);
  }
  if (!FULL_SHA.test(expectedSha ?? '')) addIssue(issues, 'expected candidate SHA must be a full 40-character Git commit SHA');
  if (!FULL_SHA.test(ledger.candidateSha ?? '')) addIssue(issues, 'ledger candidateSha must be a full 40-character Git commit SHA');
  if (FULL_SHA.test(expectedSha ?? '') && FULL_SHA.test(ledger.candidateSha ?? '') &&
      expectedSha.toLowerCase() !== ledger.candidateSha.toLowerCase()) {
    addIssue(issues, `candidate SHA mismatch: expected ${expectedSha}, got ${ledger.candidateSha}`);
  }

  const fixtureById = new Map(fixtures.fixtures.map((fixture) => [fixture.id, fixture]));
  const pageByRoute = new Map(inventory.pages.map((page) => [page.route, page]));
  const entriesByRoute = new Map();

  for (const [index, entry] of ledger.entries.entries()) {
    const label = `entry ${index + 1}`;
    if (!pageByRoute.has(entry.route)) addIssue(issues, `${label} references route not present in inventory: ${entry.route ?? 'missing'}`);
    if (!fixtureById.has(entry.fixtureId)) addIssue(issues, `${label} references unknown fixture: ${entry.fixtureId ?? 'missing'}`);
    if (!Number.isInteger(entry.passNumber) || entry.passNumber < 1 || entry.passNumber > PASS_COUNT) {
      addIssue(issues, `${label} has invalid passNumber: ${entry.passNumber ?? 'missing'}`);
    }
    if (!TERMINAL_RESULTS.has(entry.result)) addIssue(issues, `${label} has invalid result: ${entry.result ?? 'missing'}`);
    if (!isNonEmptyString(entry.evidenceUri)) addIssue(issues, `${label} requires evidenceUri`);
    if (!isNonEmptyString(entry.executedAt)) addIssue(issues, `${label} requires executedAt`);
    if (!isNonEmptyString(entry.runtimeVersion)) addIssue(issues, `${label} requires runtimeVersion`);
    else if (!FULL_SHA.test(entry.runtimeVersion) ||
        (FULL_SHA.test(ledger.candidateSha ?? '') && entry.runtimeVersion.toLowerCase() !== ledger.candidateSha.toLowerCase())) {
      addIssue(issues, `${label} runtimeVersion must match ledger candidate SHA`);
    }
    if (!isNonEmptyString(entry.apiVersion)) addIssue(issues, `${label} requires apiVersion`);
    if (entry.result !== 'PASS' && !isNonEmptyString(entry.defectId)) {
      addIssue(issues, `${label} requires defectId for ${entry.result ?? 'non-pass'} result`);
    }
    if (!entriesByRoute.has(entry.route)) entriesByRoute.set(entry.route, []);
    entriesByRoute.get(entry.route).push(entry);
  }

  for (const page of inventory.pages) {
    const routeEntries = entriesByRoute.get(page.route) ?? [];
    const passes = new Set(routeEntries.map((entry) => entry.passNumber));
    for (let passNumber = 1; passNumber <= PASS_COUNT; passNumber += 1) {
      if (!passes.has(passNumber)) addIssue(issues, `${page.route} is missing full-site pass ${passNumber}`);
    }
    if (page.administrator && !routeEntries.some((entry) => entry.fixtureId === 'qa_admin_v1')) {
      addIssue(issues, `${page.route} requires qa_admin_v1 evidence`);
    }
    if (page.routeKind === 'dynamic') {
      const scenarios = new Set(routeEntries.map((entry) => entry.dynamicScenario).filter(Boolean));
      for (const scenario of DYNAMIC_SCENARIOS) {
        if (!scenarios.has(scenario)) addIssue(issues, `${page.route} is missing dynamic scenario ${scenario}`);
      }
    }
  }

  return {
    ok: issues.length === 0,
    issues,
    summary: {
      routeCount: inventory.pages.length,
      administratorRouteCount: inventory.pages.filter((page) => page.administrator).length,
      dynamicRouteCount: inventory.pages.filter((page) => page.routeKind === 'dynamic').length,
      entryCount: ledger.entries.length,
      passCount: PASS_COUNT,
    },
  };
}

async function main() {
  const argv = process.argv.slice(2);
  // Use the checked-out commit as independent evidence unless the Test candidate
  // SHA is explicitly supplied. Never trust the ledger's self-declared SHA.
  const expectedSha = argv.includes('--expected-sha')
    ? requiredOption(argv, '--expected-sha')
    : execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  const inventory = await readJson(argv.includes('--inventory')
    ? requiredOption(argv, '--inventory') : 'artifacts/qa/route-inventory.json');
  const fixtures = await readJson(argv.includes('--fixtures')
    ? requiredOption(argv, '--fixtures') : 'scripts/qa/fixtures/full-route-fixtures.v1.json');
  const ledger = await readJson(argv.includes('--ledger')
    ? requiredOption(argv, '--ledger') : 'artifacts/qa/full-route-ledger.json');
  const report = verifyLedger({ inventory, fixtures, ledger, expectedSha });
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  if (!report.ok) process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  });
}
