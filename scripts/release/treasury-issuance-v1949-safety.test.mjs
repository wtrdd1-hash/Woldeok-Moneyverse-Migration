import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const sql = readFileSync(new URL('../../packages/database/migrations/345-funded-treasury-mint.sql', import.meta.url), 'utf8');
test('admin treasury mint is a separate policy envelope and bounded transactional receipt', () => {
  assert.match(sql, /TREASURY_ISSUANCE/);
  assert.match(sql, /SECURITY DEFINER/);
  assert.match(sql, /admin_role_holder/);
  assert.match(sql, /is_issuance_frozen\s*=\s*false/);
  assert.match(sql, /10000000/);
  assert.match(sql, /pg_advisory_xact_lock/);
  assert.match(sql, /economy_post_transaction/);
  assert.match(sql, /INSERT INTO public\.mint_certificates/);
  assert.match(sql, /INSERT INTO public\.system_treasury_ledger/);
  assert.match(sql, /ledger_transaction_id/);
  assert.match(sql, /treasury_fiscal_proof_read/);
  assert.doesNotMatch(sql, /GRANT\s+(?:ALL|INSERT|UPDATE|DELETE)\s+ON\s+(?:TABLE\s+)?public\.(?:mint_certificates|account_balances|system_treasury_vaults)\s+TO\s+moneyverse_app/i);
});
test('post-mint reconciliation uses total of ALL Treasury vaults rather than VAULT_MAIN only', () => {
  assert.match(sql, /v_after_proof\.vault_total\s*<>\s*\(v_proof\.vault_total::numeric\s*\+\s*v_amount\)::text/);
  assert.match(sql, /v_after_proof\.canonical_total\s*<>\s*\(v_proof\.vault_total::numeric\s*\+\s*v_amount\)::text/);
  assert.match(sql, /v_after_proof\.journal_total\s*<>\s*\(v_proof\.vault_total::numeric\s*\+\s*v_amount\)::text/);
});

test('new actual minted WLD requires a canonical transaction and never uses SWF model valuation', () => {
  assert.match(sql, /MINT.*TREASURY/s);
  assert.doesNotMatch(sql, /current_valuation_wld|unrealized_pnl_wld|auto_growth_yield_bps/);
});
