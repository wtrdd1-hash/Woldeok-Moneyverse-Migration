import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const workflow = readFileSync(new URL('../../../.github/workflows/ci.yml', import.meta.url), 'utf8');

test('CI verifies immutable migration history after applying SQL and before DB tests', () => {
  const apply = workflow.indexOf('name: Apply database migrations');
  const audit = workflow.indexOf('name: Audit applied migration history and source checksums');
  const testStep = workflow.indexOf('name: Test\n');
  assert.ok(apply >= 0 && audit > apply && testStep > audit);
});
