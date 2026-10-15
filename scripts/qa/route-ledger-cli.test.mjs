import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { ok, match } from 'node:assert/strict';
test('full-site QA checker supplies inventory, fixtures and evidence ledger', () => {
  const packageJson = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8'));
  const check = packageJson.scripts['qa:route-ledger:check'];
  match(check, /--inventory\s+\S+/);
  match(check, /--fixtures\s+\S+/);
  match(check, /--ledger\s+\S+/);
  ok(check.includes('qa:route-inventory'), 'regenerate exact route inventory first');
});
