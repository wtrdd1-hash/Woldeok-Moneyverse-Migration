#!/usr/bin/env node
import fs from 'node:fs';

const REQUIRED = ['classify', 'policy', 'runtime-check'];

export function verifyMainRequiredChecks(payload) {
  const protection = payload?.protection ?? payload;
  const checks = protection?.required_status_checks;
  const contexts = Array.isArray(checks?.contexts) ? checks.contexts : [];
  const appChecks = Array.isArray(checks?.checks) ? checks.checks : [];
  const names = new Set([...contexts, ...appChecks.map((check) => check?.context)].filter(Boolean));

  if (!checks || checks.enforcement_level === 'off' || !names.size) {
    throw new Error('main required-status-check enforcement is disabled or empty');
  }
  if (protection?.enforce_admins?.enabled !== true) {
    throw new Error('main administrators can bypass required checks');
  }
  if (checks.strict !== true) {
    throw new Error('main required status checks must be strict');
  }
  for (const name of REQUIRED) {
    if (!names.has(name)) throw new Error(`main required check missing: ${name}`);
  }

  return { enforceAdmins: true, strict: true, requiredChecks: REQUIRED };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const input = process.argv[2];
  if (!input) throw new Error('usage: verify-main-required-checks.mjs <branch-json>');
  const payload = JSON.parse(fs.readFileSync(input, 'utf8'));
  const result = verifyMainRequiredChecks(payload);
  process.stdout.write(`${JSON.stringify(result)}\n`);
}
