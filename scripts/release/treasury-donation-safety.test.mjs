import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

const sql = new URL('../../packages/database/migrations/272-ledger-first-treasury-donation.sql', import.meta.url);
const controller = new URL('../../backend/src/admin/treasury/treasury.controller.ts', import.meta.url);
const repository = new URL('../../backend/src/admin/treasury/treasury.repository.ts', import.meta.url);
const frontend = new URL('../../frontend/src/components/treasury-donation-card.tsx', import.meta.url);

test('only explicitly idempotent four-argument donations may mutate balances', async () => {
  const source = await readFile(sql, 'utf8');
  assert.match(source, /treasury_user_donate\(\s*p_user_id uuid,\s*p_amount_wld text,\s*p_memo text,\s*p_request_key uuid/s);
  assert.match(source, /economy_post_transaction\s*\(/);
  assert.match(source, /UNIQUE.*ledger_transaction_id|ledger_transaction_id\s+uuid\s+UNIQUE/i);
  assert.match(source, /WHERE d.ledger_transaction_id=v_tx_id/);
  assert.match(source, /treasury_user_donate\(\s*p_user_id uuid,\s*p_amount_wld text,\s*p_memo text\s*\)/s);
  assert.match(source, /idempotency key is required|idempotency key.*required/i);
  assert.match(source, /REVOKE ALL.*treasury_user_donate\(uuid, text, text\).*FROM PUBLIC/s);
});

test('dangerous legacy direct-balance issuance and burn stay fail closed', async () => {
  const source = await readFile(sql, 'utf8');
  assert.match(source, /treasury_disburse_targeted_subsidy\(\s*p_actor uuid/s);
  assert.match(source, /execute_treasury_burn_draw\(\s*p_burn_amount bigint/s);
  assert.match(source, /REVOKE ALL.*execute_treasury_burn_draw.*FROM PUBLIC/s);
});

test('authenticated backend passes user intent and bounded stable replay key', async () => {
  const ctl = await readFile(controller, 'utf8');
  const repo = await readFile(repository, 'utf8');
  const page = await readFile(frontend, 'utf8');
  assert.match(ctl, /@IsUUID\(\)[\s\S]*idempotencyKey/);
  assert.match(repo, /treasury_user_donate\(\$1::uuid, \$2::text, \$3::text, \$4::uuid\)/);
  assert.match(page, /crypto\.randomUUID\(/);
  assert.match(page, /idempotencyKey,/);
  assert.match(page, /useRef/);
});
