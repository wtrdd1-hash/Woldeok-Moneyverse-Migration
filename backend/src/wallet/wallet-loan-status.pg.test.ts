import { describe, expect, it } from 'vitest';
import { Pool } from 'pg';
import { PostgresWalletRepository } from './wallet.repository';

const URL = process.env.MV_A1125_TEST_DATABASE_URL;
const OWNER = '11111111-1111-4111-8111-111111111111';
const FOREIGN = '22222222-2222-4222-8222-222222222222';

describe.skipIf(!URL)('owner loan status filter on disposable PostgreSQL 17', () => {
  it('preserves owner-only latest 20, canonical NUMERIC WLD and least-privilege SQL function access', async () => {
    const pool = new Pool({ connectionString: URL, connectionTimeoutMillis: 3000 });
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('INSERT INTO public.users(id) VALUES ($1), ($2)', [OWNER, FOREIGN]);
      await client.query(`INSERT INTO public.virtual_bank_loans
        (borrow_idempotency_key,user_id,principal_amount,interest_amount,outstanding_amount,status,issued_at,repaid_at)
        SELECT gen_random_uuid(),$1::uuid,500000::numeric,0,
          CASE WHEN n=21 THEN 500000::numeric ELSE 0 END,
          CASE WHEN n=21 THEN 'overdue' ELSE 'repaid' END,
          '2026-10-30T00:00:00Z'::timestamptz + n * interval '1 minute',
          CASE WHEN n=21 THEN NULL ELSE '2026-10-30T00:00:00Z'::timestamptz END
        FROM generate_series(1,21) n`, [OWNER]);
      await client.query(`INSERT INTO public.virtual_bank_loans
        (borrow_idempotency_key,user_id,principal_amount,interest_amount,outstanding_amount,status,issued_at)
        VALUES (gen_random_uuid(),$1,500000,0,500000,'active',now())`, [FOREIGN]);
      await client.query('SET LOCAL ROLE moneyverse_app');
      const rights = await client.query("SELECT has_table_privilege(current_user,'public.virtual_bank_loans','SELECT') AS can_select, has_table_privilege(current_user,'public.virtual_bank_loans','UPDATE') AS can_update, has_function_privilege(current_user,'public.bank_my_loans(uuid)','EXECUTE') AS can_execute");
      expect(rights.rows[0]).toMatchObject({ can_select: false, can_update: false, can_execute: true });
      const repo = new PostgresWalletRepository(client);
      expect(await repo.loansForUser(OWNER)).toHaveLength(20);
      const overdue = await repo.loansForUser(OWNER, 'overdue');
      expect(overdue).toHaveLength(1);
      expect(overdue[0]?.outstanding_amount).toBe('500000');
      expect(await repo.loansForUser(OWNER, 'repaid')).toHaveLength(19);
      expect(await repo.loansForUser(OWNER, 'active')).toHaveLength(0);
      expect(await repo.loansForUser(FOREIGN, 'active')).toHaveLength(1);
      expect(await repo.loansForUser(FOREIGN, 'overdue')).toHaveLength(0);
    } finally {
      await client.query('ROLLBACK');
      client.release();
      await pool.end();
    }
  });
});
