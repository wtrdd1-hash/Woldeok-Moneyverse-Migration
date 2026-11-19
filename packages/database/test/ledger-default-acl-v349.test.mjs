import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const sql = readFileSync(new URL('../migrations/349-ledger-app-default-acl-repair.sql', import.meta.url), 'utf8');
test('v349 guards each default-privilege creator absent in fresh CI databases', () => {
  for (const role of ['postgres', 'moneyverse_migrator']) {
    assert.match(sql, new RegExp(`'${role}'`));
  }
  assert.match(sql, /IF EXISTS \(SELECT 1 FROM pg_roles WHERE rolname = creator\)/i);
  assert.match(sql, /ALTER DEFAULT PRIVILEGES FOR ROLE %I IN SCHEMA public REVOKE ALL PRIVILEGES ON TABLES FROM moneyverse_app/i);
  assert.match(sql, /EXECUTE format\(/i);
});
test('v349 preserves ledger read-only app boundary on existing tables', () => {
  assert.match(sql, /REVOKE ALL PRIVILEGES ON TABLE public\.ledger_transactions, public\.ledger_postings FROM moneyverse_app/i);
  assert.match(sql, /GRANT SELECT ON TABLE public\.ledger_transactions, public\.ledger_postings TO moneyverse_app/i);
  assert.doesNotMatch(sql, /GRANT\s+(?:ALL|INSERT|UPDATE|DELETE|TRUNCATE).*ledger_/i);
});
