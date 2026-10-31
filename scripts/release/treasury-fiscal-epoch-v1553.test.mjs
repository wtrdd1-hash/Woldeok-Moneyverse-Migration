import assert from 'node:assert/strict';
import fs from 'node:fs';
import { test } from 'node:test';

const path = new URL('../../packages/database/migrations/314-treasury-fiscal-epoch-reset.sql', import.meta.url);
const sql = fs.readFileSync(path, 'utf8');

test('fiscal reset requires operator baseline and backup, never erases canonical financial history', () => {
  assert.match(sql, /BEGIN;/);
  assert.match(sql, /COMMIT;/);
  assert.match(sql, /ISOLATION LEVEL SERIALIZABLE/i);
  assert.match(sql, /LOCK TABLE public\.system_treasury_vaults/i);
  assert.match(sql, /TREASURY_EPOCH_CANONICAL_ZERO_REQUIRED/);
  assert.match(sql, /TREASURY_EPOCH_PROJECTION_UNVERIFIED/);
  assert.match(sql, /TREASURY_EPOCH_BASELINE_CHANGED/);
  assert.match(sql, /count\(\*\) FILTER \(WHERE ledger_transaction_id IS NULL\)/i);
  assert.match(sql, /archived_vaults jsonb NOT NULL/);
  assert.match(sql, /full_backup_sha256/);
  assert.match(sql, /e62cc6528e22c3bf60362c4e584d09b01cecef3d9112eb5a0f9e5bcde9e32bc7/);
  assert.match(sql, /UPDATE public\.system_treasury_vaults\s+SET balance_wld='0'/);
  assert.doesNotMatch(sql, /\bTRUNCATE\b|\bDROP TABLE\b/i);
  assert.doesNotMatch(sql, /\b(?:UPDATE|DELETE FROM|INSERT INTO)\s+public\.(?:ledger_transactions|ledger_postings|account_balances|accounts|system_treasury_ledger|state_enterprise_dividend_logs)\b/i);
  assert.doesNotMatch(sql, /\bGRANT\s+(?:INSERT|UPDATE|DELETE)\b/i);
});
test('new vault balances cannot exceed canonical funds and old routines cannot insert unproven receipts', () => {
  assert.match(sql, /CREATE CONSTRAINT TRIGGER fiscal_vault_backing_guard/);
  assert.match(sql, /DEFERRABLE INITIALLY DEFERRED/);
  assert.match(sql, /TREASURY_EPOCH_UNBACKED/);
  assert.match(sql, /TREASURY_EPOCH_MISSING_CANONICAL_PROVENANCE/);
  assert.match(sql, /CREATE CONSTRAINT TRIGGER fiscal_treasury_source_guard/);
  assert.match(sql, /CREATE CONSTRAINT TRIGGER fiscal_dividend_source_guard/);
  assert.match(sql, /ledger_postings p/);
  assert.match(sql, /treasury_count<1/);
  assert.match(sql, /posting_count<2/);
  assert.match(sql, /balance<>0/);
});
test('the reset keeps public records and membership balances untouched', () => {
  assert.match(sql, /canonical_opening_wld/);
  assert.match(sql, /archived_enterprise_dividends/);
  assert.match(sql, /archived_legacy_events/);
  assert.doesNotMatch(sql, /SET\s+available_amount/i);
  assert.doesNotMatch(sql, /SET\s+amount_wld/i);
  assert.doesNotMatch(sql, /DELETE\s+FROM\s+public\./i);
});
