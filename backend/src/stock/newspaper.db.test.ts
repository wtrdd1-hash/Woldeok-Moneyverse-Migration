import { Pool } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { NewspaperController } from './newspaper.controller';

// CI's disposable PostgreSQL is the only permitted integration target.
// Do not fall back to the miniPC's production-connected development database.
const ISOLATED_DATABASE_URL = process.env.CI ? process.env.DATABASE_URL : undefined;

describe.skipIf(!ISOLATED_DATABASE_URL)('verified newspaper snapshot against isolated PostgreSQL', () => {
  let pool: Pool;
  beforeAll(() => { pool = new Pool({ connectionString: ISOLATED_DATABASE_URL, max: 1 }); });
  afterAll(async () => { await pool.end(); });

  it('reads the exact active user cash and bank balance with the restricted app role', async () => {
    const expected = await pool.query<{ balance_wld: string }>(
      `SELECT COALESCE(SUM(ab.available_amount::numeric), 0)::text AS balance_wld
       FROM public.accounts a
       JOIN public.account_balances ab ON ab.account_id = a.id
       WHERE a.account_type IN ('USER_CASH', 'USER_BANK') AND a.status = 'active'`,
    );
    const result = await new NewspaperController(pool).getWeeklyBrief();
    expect(result.data.balanceSnapshotWld).toBe(expected.rows[0]?.balance_wld);
    expect(result.data.source).toBe('user_cash_and_bank_balances');
  });
});
