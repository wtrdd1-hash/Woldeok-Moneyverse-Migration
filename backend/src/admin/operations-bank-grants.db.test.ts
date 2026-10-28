import { Pool } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { databaseUrl } from '../testing/database';

const DATABASE_URL = databaseUrl();
const UNKNOWN = '00000000-0000-4000-8000-000000000000';

/** Migration 264 dropped/recreated these two functions and lost the grants from 106. */
describe.skipIf(!DATABASE_URL)(
  'bank read models preserve app EXECUTE without raw table access',
  () => {
    let pool: Pool;
    beforeAll(() => {
      pool = new Pool({ connectionString: DATABASE_URL, max: 2 });
    });
    afterAll(async () => {
      await pool.end();
    });

    it.each([
      'admin_bank_overview(uuid)',
      'admin_credit_grades(uuid)',
      'admin_loan_book(uuid,integer)',
    ])('%s is callable by the application role', async (signature) => {
      const { rows } = await pool.query<{ allowed: boolean }>(
        'SELECT has_function_privilege(current_user, $1, $2) AS allowed',
        [`public.${signature}`, 'EXECUTE'],
      );
      expect(rows[0]?.allowed).toBe(true);
    });

    it.each(['admin_credit_grades', 'admin_loan_book'])(
      '%s denies an unauthorised actor inside the function, not at the missing grant',
      async (name) => {
        const query =
          name === 'admin_loan_book'
            ? 'SELECT * FROM public.admin_loan_book($1, 10)'
            : 'SELECT * FROM public.admin_credit_grades($1)';
        await expect(pool.query(query, [UNKNOWN])).rejects.toMatchObject({
          code: '42501',
          message: expect.stringMatching(/requires an administrator/),
        });
      },
    );

    it('does not grant direct SELECT on the loan table', async () => {
      const { rows } = await pool.query<{ allowed: boolean }>(
        "SELECT has_table_privilege(current_user, 'public.virtual_bank_loans', 'SELECT') AS allowed",
      );
      expect(rows[0]?.allowed).toBe(false);
    });
  },
);
