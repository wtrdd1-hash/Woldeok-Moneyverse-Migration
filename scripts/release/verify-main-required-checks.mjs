#!/usr/bin/env node
import fs from 'node:fs';

export function verifyMainRequiredChecks(payload) {
  const protection = payload?.protection ?? payload;
  const checks = protection?.required_status_checks;
  const enforcement = checks?.enforcement_level;
  const contexts = Array.isArray(checks?.contexts) ? checks.contexts : [];
  const appChecks = Array.isArray(checks?.checks) ? checks.checks : [];

  if (!checks || enforcement === 'off' || (!contexts.length && !appChecks.length)) {
    throw new Error('main required-status-check enforcement is disabled or empty');
  }

  return { enforcement, requiredCheckCount: contexts.length + appChecks.length };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const input = process.argv[2];
  if (!input) throw new Error('usage: verify-main-required-checks.mjs <branch-json>');
  const payload = JSON.parse(fs.readFileSync(input, 'utf8'));
  const result = verifyMainRequiredChecks(payload);
  process.stdout.write(`${JSON.stringify(result)}\n`);
}
