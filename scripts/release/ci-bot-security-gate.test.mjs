import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const workflow = readFileSync(new URL('../../.github/workflows/ci.yml', import.meta.url), 'utf8');

test('runtime CI installs and tests the independently locked Discord bot', () => {
  assert.match(workflow, /npm --prefix bot ci --no-audit --no-fund/);
  assert.match(workflow, /npm --prefix bot test/);
});

test('runtime CI audits bot production dependencies at high severity', () => {
  assert.match(workflow, /npm --prefix bot audit --omit=dev --audit-level=high/);
});
