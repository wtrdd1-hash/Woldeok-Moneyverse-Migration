import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../../packages/database/migrations/344-admin-monetary-policy-guarded-writes.sql', import.meta.url), 'utf8');

test('v1946 does not loosen the persisted policy constraint or issue WLD from certificates', () => {
  assert.match(source, /admin_monetary_policy_propose/);
  assert.match(source, /admin_monetary_policy_approve/);
  assert.match(source, /admin_monetary_mint_certificate/);
  assert.match(source, /SECURITY DEFINER SET search_path = pg_catalog, pg_temp/g);
  assert.match(source, /admin_role_holder/);
  assert.match(source, /pg_advisory_xact_lock/);
  assert.match(source, /p_idempotency_key/);
  assert.match(source, /p_recipient IS NOT NULL/);
  assert.match(source, /RETURN NEXT v_existing/);
  assert.doesNotMatch(source, /GRANT\s+(?:INSERT|UPDATE|DELETE|ALL)\s+ON\s+(?:TABLE\s+)?public\.(?:mint_certificates|account_balances|system_treasury_vaults)\s+TO\s+moneyverse_app/i);
  assert.doesNotMatch(source, /economy_post_transaction|UPDATE public\.system_treasury_vaults|INSERT INTO public\.ledger_postings/i);
});

test('v1946 keeps least-privilege role grants and explicit anti-phantom Treasury copy', () => {
  assert.match(source, /GRANT SELECT ON TABLE public\.monetary_policy_orders/);
  assert.match(source, /REVOKE ALL ON FUNCTION public\.admin_monetary_mint_certificate/);
  assert.match(source, /GRANT EXECUTE ON FUNCTION public\.admin_monetary_mint_certificate/);
  assert.match(source, /p_envelope='HARD_SINK_PURGE'/);
  assert.match(source, /v_order\.target_envelope NOT IN/);
});
