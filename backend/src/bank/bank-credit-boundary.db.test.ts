import { Pool } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { databaseUrl } from '../testing/database';

const url = databaseUrl();
const missing = '00000000-0000-4000-8000-000000000000';

describe.skipIf(!url)('P0 bank loan least-privilege boundary in PostgreSQL', () => {
  let pool: Pool;
  beforeAll(() => { pool = new Pool({ connectionString: url, max: 2 }); });
  afterAll(async () => { await pool.end(); });

  it.each(['virtual_bank_loans', 'virtual_bank_loan_repayments'])('%s is not directly readable or writable by app', async (table) => {
    const permissions = await pool.query(
      `SELECT has_table_privilege(current_user, $1, 'SELECT') AS can_read,
              has_table_privilege(current_user, $1, 'UPDATE') AS can_update,
              has_table_privilege(current_user, $1, 'INSERT') AS can_insert`,
      [`public.${table}`],
    );
    expect(permissions.rows[0]).toEqual({ can_read: false, can_update: false, can_insert: false });
  });

  it('preserves callable, actor-scoped credit evidence and rejects missing actors', async () => {
    const result = await pool.query('SELECT * FROM public.bank_my_credit_facts($1)', [missing]);
    expect(result.rows).toEqual([]);
  });
});
