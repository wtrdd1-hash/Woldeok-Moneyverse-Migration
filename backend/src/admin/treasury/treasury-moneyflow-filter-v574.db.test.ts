import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Pool } from 'pg';
import type { Queryable } from '../../core/db';
import { TreasuryRepository } from './treasury.repository';

const url = process.env.MV_V574_PG_URL;
const run = url ? describe : describe.skip;
const userIds = [
  '00000000-0000-4000-8000-000000000101',
  '00000000-0000-4000-8000-000000000102',
  '00000000-0000-4000-8000-000000000103',
];
let pool: Pool;

run('P1 literal money-flow search on disposable PostgreSQL', () => {
  beforeAll(async () => {
    pool = new Pool({ connectionString: url });
    await pool.query(`
      CREATE TYPE public.posting_direction AS ENUM ('debit','credit');
      CREATE TABLE public.ledger_transactions(id uuid PRIMARY KEY, type text, created_at timestamptz);
      CREATE TABLE public.accounts(id uuid PRIMARY KEY, owner_user_id uuid, account_type text);
      CREATE TABLE public.member_profiles(user_id uuid PRIMARY KEY, display_name text);
      CREATE TABLE public.ledger_postings(id uuid PRIMARY KEY, transaction_id uuid REFERENCES public.ledger_transactions,
        account_id uuid REFERENCES public.accounts, direction public.posting_direction, amount numeric);
      INSERT INTO public.member_profiles VALUES
        ('${userIds[0]}', '홍%길'), ('${userIds[1]}', '홍_길'), ('${userIds[2]}', '홍\\길');
      INSERT INTO public.accounts VALUES
        ('00000000-0000-4000-8000-000000000201', '${userIds[0]}', 'USER_CASH'),
        ('00000000-0000-4000-8000-000000000202', '${userIds[1]}', 'USER_CASH'),
        ('00000000-0000-4000-8000-000000000203', '${userIds[2]}', 'USER_CASH');
      INSERT INTO public.ledger_transactions VALUES
        ('00000000-0000-4000-8000-000000000301','MINT_TO_USER',now()),
        ('00000000-0000-4000-8000-000000000302','MINT_TO_USER',now()),
        ('00000000-0000-4000-8000-000000000303','MINT_TO_USER',now());
      INSERT INTO public.ledger_postings VALUES
        ('00000000-0000-4000-8000-000000000401','00000000-0000-4000-8000-000000000301','00000000-0000-4000-8000-000000000201','credit',11),
        ('00000000-0000-4000-8000-000000000402','00000000-0000-4000-8000-000000000302','00000000-0000-4000-8000-000000000202','credit',12),
        ('00000000-0000-4000-8000-000000000403','00000000-0000-4000-8000-000000000303','00000000-0000-4000-8000-000000000203','credit',13);
      CREATE ROLE v574_readonly NOLOGIN;
      GRANT USAGE ON SCHEMA public TO v574_readonly;
      GRANT SELECT ON ALL TABLES IN SCHEMA public TO v574_readonly;
    `);
  });

  afterAll(async () => { await pool?.end(); });

  it.each([['%', userIds[0]], ['_', userIds[1]], ['\\', userIds[2]]])('matches only literal %s', async (term, id) => {
    const repo = new TreasuryRepository(pool as unknown as Queryable);
    const result = await repo.getUserMoneyFlows(50, undefined, term);
    expect(result.items.map((item) => item.user_id)).toEqual([id]);
    expect(result.summary.total_volume_24h).toBe('36');
  });

  it('retains Korean case-insensitive substring and owner UUID search', async () => {
    const repo = new TreasuryRepository(pool as unknown as Queryable);
    expect((await repo.getUserMoneyFlows(50, undefined, '홍')).items).toHaveLength(3);
    expect((await repo.getUserMoneyFlows(50, undefined, userIds[1])).items).toHaveLength(1);
  });

  it('runs as a read-only role without granting writes to the ledger', async () => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN READ ONLY');
      await client.query('SET LOCAL ROLE v574_readonly');
      const repo = new TreasuryRepository({ query: (sql, args) => client.query(sql, args) } as Queryable);
      const result = await repo.getUserMoneyFlows(50, undefined, '%');
      expect(result.items).toHaveLength(1);
      await expect(client.query(`INSERT INTO public.member_profiles(user_id,display_name)
        VALUES ('00000000-0000-4000-8000-000000000999','invalid')`)).rejects.toMatchObject({ code: '25006' });
    } finally {
      await client.query('ROLLBACK');
      client.release();
    }
  });
});
