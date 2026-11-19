import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const sql = readFileSync(new URL('../migrations/349-ledger-app-default-acl-repair.sql', import.meta.url), 'utf8');
test('v349 closes future default table grants for both creators', () => {
  for (const role of ['postgres', 'moneyverse_migrator']) {
    assert.match(sql, new RegExp(`ALTER DEFAULT PRIVILEGES FOR ROLE ${role} IN SCHEMA public\\s+REVOKE ALL(?: PRIVILEGES)? ON TABLES FROM moneyverse_app`, 'i'));
  }
});
test('v349 preserves ledger read-only app boundary on existing tables', () => {
  assert.match(sql, /REVOKE ALL PRIVILEGES ON TABLE public\.ledger_transactions, public\.ledger_postings FROM moneyverse_app/i);
  assert.match(sql, /GRANT SELECT ON TABLE public\.ledger_transactions, public\.ledger_postings TO moneyverse_app/i);
  assert.doesNotMatch(sql, /GRANT\s+(?:ALL|INSERT|UPDATE|DELETE|TRUNCATE).*ledger_/i);
});
