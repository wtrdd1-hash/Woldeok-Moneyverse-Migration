import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const root = resolve(fileURLToPath(new URL('../..', import.meta.url)));
const sqlPath = resolve(root, 'packages/database/migrations/331-protect-treasury-vault-dml.sql');
const sql = readFileSync(sqlPath, 'utf8');

test('the untrusted application role cannot mutate auxiliary Treasury vaults directly', () => {
  assert.match(sql, /REVOKE\s+INSERT,\s*UPDATE,\s*DELETE,\s*TRUNCATE,\s*REFERENCES,\s*TRIGGER\s+ON\s+TABLE\s+public\.system_treasury_vaults\s+FROM\s+PUBLIC,\s*moneyverse_app/i);
});

test('migration must fail if effective table/column raw vault write survives', () => {
  assert.match(sql, /has_table_privilege\('moneyverse_app',\s*'public\.system_treasury_vaults'/i);
  assert.match(sql, /has_any_column_privilege\('moneyverse_app',\s*'public\.system_treasury_vaults',\s*'UPDATE'\)/i);
  assert.match(sql, /TREASURY_VAULT_APP_DML_STILL_GRANTED/);
});

test('cannot grant web role raw ledger writes or fabricate WLD', () => {
  assert.doesNotMatch(sql, /GRANT\s+EXECUTE\s+ON\s+FUNCTION\s+public\.economy_post_transaction/i);
  assert.doesNotMatch(sql, /(?:UPDATE|DELETE FROM|INSERT INTO)\s+public\.(?:accounts|account_balances|ledger_transactions|ledger_postings|system_treasury_vaults)/i);
});
