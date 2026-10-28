import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Pool } from 'pg';
import { TreasuryRepository } from './treasury.repository';

// Only run against an explicitly provided disposable PostgreSQL instance.
const url = process.env.TREASURY_LEDGER_V619_TEST_URL;
describe.skipIf(!url)('P1 treasury ledger cursor in isolated real PostgreSQL', () => {
  const pool = new Pool({ connectionString: url });
  const repo = new TreasuryRepository(pool);
  const newer = '00000000-0000-4000-8000-000000000099';
  const older = '00000000-0000-4000-8000-000000000098';
  beforeAll(async () => {
    await pool.query(`CREATE TABLE public.system_treasury_vaults (id uuid PRIMARY KEY, code text, name text)`);
    await pool.query(`CREATE TABLE public.member_profiles (user_id uuid, display_name text)`);
    await pool.query(`CREATE TABLE public.system_treasury_ledger (
      id uuid PRIMARY KEY, vault_id uuid, tx_type text, amount_wld text, actor_id uuid,
      reason text, balance_before text, balance_after text, created_at timestamptz NOT NULL
    )`);
    await pool.query(`INSERT INTO public.system_treasury_vaults VALUES
      ('00000000-0000-4000-8000-000000000001', 'VAULT_MAIN', 'Main')`);
    await pool.query(`INSERT INTO public.system_treasury_ledger VALUES
      ($1, '00000000-0000-4000-8000-000000000001', 'INJECTION', '9007199254740993', NULL, 'Test ledger audit entry', '0', '9007199254740993', '2026-10-28 14:23:45.123456+00'),
      ($2, '00000000-0000-4000-8000-000000000001', 'INJECTION', '42', NULL, 'Test ledger audit entry', '0', '42', '2026-10-28 14:23:45.123456+00')`, [newer, older]);
  });
  afterAll(async () => { await pool.end(); });
  it('visits every same-microsecond ledger entry exactly once', async () => {
    const first = await repo.listTransactions(1);
    expect(first.items.map(x => x.id)).toEqual([newer]);
    expect(first.items[0]?.amount_wld).toBe('9007199254740993');
    expect(first.items[0]).not.toHaveProperty('cursor_created_at');
    expect(first.next_cursor).toMatch(/^tl1\./);
    const second = await repo.listTransactions(1, first.next_cursor!);
    expect(second.items.map(x => x.id)).toEqual([older]);
    expect(second.next_cursor).toBeNull();
    const full = await repo.listTransactions(100);
    expect(full.items.map(x => x.id)).toEqual([newer, older]);
  });
});
