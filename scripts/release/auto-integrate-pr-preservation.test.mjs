import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const workflow = readFileSync(fileURLToPath(new URL('../../.github/workflows/auto-integrate-promote.yml', import.meta.url)), 'utf8');

test('auto-integration has no GitHub write scopes while exact-SHA attestation is unavailable', () => {
  const permissions = workflow.split(/^permissions:\s*$/m)[1]?.split(/^\S/m)[0] ?? '';
  assert.match(permissions, /contents:\s*read/);
  assert.match(permissions, /pull-requests:\s*read/);
  assert.match(permissions, /actions:\s*read/);
  assert.doesNotMatch(permissions, /\bwrite\b/);
});

test('auto-integration has no PR close, branch delete, force reconciliation, merge, or dispatch code', () => {
  assert.doesNotMatch(workflow, /gh\s+pr\s+merge|gh\s+api\s+--method\s+(?:PATCH|DELETE)|git\s+(?:push|merge|reset\s+--hard|clean\s+-fd)|gh\s+workflow\s+run/);
  assert.match(workflow, /BLOCKED: independent isolated-Test and finance\/auth\/DB\/security attestation unavailable/);
});
