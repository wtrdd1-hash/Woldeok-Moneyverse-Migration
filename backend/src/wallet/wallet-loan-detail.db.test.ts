import { Pool } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { databaseUrl } from '../testing/database';

const URL = databaseUrl();
const UNKNOWN = '00000000-0000-4000-8000-000000000000';

describe.skipIf(!URL)('owner loan detail read in isolated real PostgreSQL', () => {
  let pool: Pool;
  beforeAll(() => { pool = new Pool({ connectionString: URL, max: 1 }); });
  afterAll(async () => { await pool.end(); });

  it('executes bank_my_loans under app role without exposing a missing actor or direct loan writes', async () => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN READ ONLY');
      const grants = await client.query<{ can_execute: boolean; can_insert: boolean }>(
        `SELECT has_function_privilege('moneyverse_app','public.bank_my_loans(uuid)','EXECUTE') AS can_execute,
                has_table_privilege('moneyverse_app','public.virtual_bank_loans','INSERT') AS can_insert`,
      );
      expect(grants.rows[0]).toMatchObject({ can_execute: true, can_insert: false });
      await client.query('SET LOCAL ROLE moneyverse_app');
      const rows = await client.query('SELECT loan_id::text FROM public.bank_my_loans($1::uuid)', [UNKNOWN]);
      expect(rows.rows).toEqual([]);
    } finally {
      await client.query('ROLLBACK');
      client.release();
    }
  });
});
