import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');
const repository = () => read('backend/src/admin/treasury/treasury.repository.ts');
const migration = () => read('packages/database/migrations/348-treasury-admin-salary-canonical-idempotent.sql');
const controller = () => read('backend/src/admin/treasury/treasury.controller.ts');
const otp = () => read('backend/src/auth/admin-channel-otp.service.ts');
const frontend = () => read('frontend/src/app/admin/treasury/admin-salary-disburse-dialog.tsx');

test('financial repository binds all four mint parameters as numbered PostgreSQL parameters', () => {
  assert.match(repository(), /admin_treasury_topup_from_mint_direct\(\$1::uuid,\s*\$2::text,\s*\$3::text,\s*\$4::uuid\)/);
});

test('salary repository requires a stable fifth request UUID and binds all parameters', () => {
  assert.match(repository(), /treasury_disburse_admin_salary\(\$1::uuid,\s*\$2::uuid,\s*\$3::text,\s*\$4::text,\s*\$5::uuid\)/);
});

test('forward-only salary 348 binds the canonical journal and preserves finance', () => {
  const sql = migration();
  assert.match(sql, /CREATE OR REPLACE FUNCTION public\.treasury_disburse_admin_salary\(/);
  assert.match(sql, /p_request_key uuid/);
  assert.match(sql, /pg_catalog\.pg_advisory_xact_lock/);
  assert.match(sql, /'ADMIN_SALARY'/);
  assert.match(sql, /public\.economy_post_transaction\(/);
  assert.match(sql, /ledger_transaction_id/);
  assert.match(sql, /v_tx_id/);
  assert.ok(sql.indexOf('public.economy_post_transaction(') < sql.lastIndexOf('INSERT INTO public.system_treasury_ledger'));
  assert.match(sql, /REVOKE ALL[^;]*treasury_disburse_admin_salary\(uuid,\s*uuid,\s*text,\s*text\)/);
  assert.match(sql, /GRANT EXECUTE[^;]*treasury_disburse_admin_salary\(uuid,\s*uuid,\s*text,\s*text,\s*uuid\)/);
});

test('salary OTP intent binds a request UUID through controller and frontend', () => {
  assert.match(otp(), /readonly action: 'treasury_salary_disburse'[\s\S]*?requestKey: string/);
  assert.match(controller(), /@Post\("salary\/disburse"\)[\s\S]*?requestKey: body\.requestKey/);
  assert.match(frontend(), /requestKey/);
});
