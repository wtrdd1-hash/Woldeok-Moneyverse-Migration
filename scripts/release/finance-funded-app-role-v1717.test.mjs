import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
const root = resolve(fileURLToPath(new URL('../..', import.meta.url)));
const sql = readFileSync(
  resolve(root, 'packages/database/test/finance-funded-app-role-v1717.pg.sql'),
  'utf8',
);

test('actual web DB principal is exercised without raw-table grants', () => {
  assert.match(sql, /SET LOCAL ROLE moneyverse_app;/);
  assert.match(sql, /treasury_core_post\(a,k1,'NPS_FUND','1000'\)/);
  assert.match(sql, /treasury_core_post\(a,k2,'NPS_WITHDRAW','1000'\)/);
});

test('funded pension receipt is idempotent with exact 95/5 split', () => {
  assert.match(sql, /replay\.ledger_transaction_id IS DISTINCT FROM fund\.ledger_transaction_id/);
  assert.match(sql, /replay_withdraw\.ledger_transaction_id IS DISTINCT FROM withdrawn\.ledger_transaction_id/);
  assert.match(sql, /withdrawn\.user_disbursement_wld <> '950'/);
  assert.match(sql, /withdrawn\.welfare_fee_wld <> '50'/);
});

test('test requires isolated clone flag and always rolls back', () => {
  assert.match(sql, /\\if :\{\?isolated_clone\}/);
  assert.match(sql, /BEGIN;/);
  assert.match(sql, /RESET ROLE;\s*ROLLBACK;/);
});

test('does not grant raw money writes or fabricate currency', () => {
  assert.doesNotMatch(sql, /\bGRANT\s+(?:ALL|UPDATE|INSERT|EXECUTE)\b/i);
  assert.doesNotMatch(sql, /\b(?:INSERT INTO|UPDATE|DELETE FROM)\s+public\.(?:ledger_postings|ledger_transactions|account_balances)/i);
});
