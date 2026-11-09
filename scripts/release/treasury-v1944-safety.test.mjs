import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const hold = readFileSync(new URL('../../packages/database/migrations/343-block-unfunded-swf-liquidation.sql', import.meta.url), 'utf8');
const correct = readFileSync(new URL('../../ops/treasury/owner-approved-fiscal-balance-reset-v1944.sql', import.meta.url), 'utf8');

test('new 343 migration holds model-valued SWF liquidation without minting or changing historical receipts', () => {
  assert.match(hold, /SWF_UNFUNDED_LIQUIDATION_HELD/);
  assert.match(hold, /SECURITY DEFINER\s+SET search_path/i);
  assert.match(hold, /42501/);
  assert.match(hold, /55000/);
  assert.doesNotMatch(hold, /economy_post_transaction|UPDATE public\.system_treasury_vaults|DELETE FROM/i);
  assert.match(hold, /REVOKE ALL ON FUNCTION public\.admin_swf_liquidate_to_vault/);
});

test('v1944 owner-authorized correction uses only canonical ledger counterpostings and guarded snapshot', () => {
  assert.match(correct, /ISOLATION LEVEL SERIALIZABLE/);
  assert.match(correct, /SWF_PORTFOLIO_LIQUIDATION/);
  assert.match(correct, /v_expected_total CONSTANT numeric := 191055911/);
  assert.match(correct, /v_expected_swf CONSTANT numeric := 181056161/);
  assert.match(correct, /343-block-unfunded-swf-liquidation.sql/);
  assert.match(correct, /treasury_fiscal_proof_read\(\)/);
  assert.match(correct, /pg_advisory_xact_lock/);
  assert.match(correct, /economy_post_transaction/);
  assert.match(correct, /sourceSwfTransaction/);
  assert.match(correct, /v_pre_money<>v_post_money/);
  assert.match(correct, /v_total_journal<>0/);
  assert.match(correct, /system_treasury_ledger/);
  assert.doesNotMatch(correct, /UPDATE\s+public\.account_balances|DELETE\s+FROM|TRUNCATE/i);
});
