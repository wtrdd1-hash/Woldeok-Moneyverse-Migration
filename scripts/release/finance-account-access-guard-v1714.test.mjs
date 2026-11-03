import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const root = resolve(fileURLToPath(new URL('../..', import.meta.url)));
const sql = readFileSync(resolve(root, 'packages/database/migrations/330-finance-account-access-guard.sql'), 'utf8');

test('migration revokes direct account and balance mutations', () => {
  assert.match(sql, /REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER\s+ON TABLE public\.accounts, public\.account_balances\s+FROM PUBLIC, moneyverse_app/i);
});

test('migration preserves app SELECT for both projections', () => {
  assert.match(sql, /GRANT SELECT ON TABLE public\.accounts, public\.account_balances TO moneyverse_app/i);
});

test('migration fails on effective residual privileges', () => {
  assert.match(sql, /pg_catalog\.has_table_privilege\(/);
  assert.match(sql, /FINANCE_APP_RAW_ACCOUNT_DML_STILL_GRANTED/);
  assert.match(sql, /FINANCE_APP_ACCOUNT_READ_REMOVED/);
});

test('migration cannot post, issue or transfer WLD', () => {
  assert.doesNotMatch(sql, /GRANT EXECUTE ON FUNCTION public\.economy_post_transaction/i);
  assert.doesNotMatch(sql, /(?:INSERT INTO|UPDATE|DELETE FROM)\s+public\.(?:ledger_transactions|ledger_postings|account_balances)/i);
});
