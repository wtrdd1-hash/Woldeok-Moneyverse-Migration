import { Pool } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { databaseUrl, rejectionOf } from '../testing/database';

/**
 * Migration 106, executed. Skips without DATABASE_URL; CI is where it runs.
 *
 * Two things are being proved, and they are the two the stock read path got
 * wrong in production. Every one of these functions refuses a caller holding
 * no administrator role -- so reaching the route by another path still gets
 * nothing -- and not one of the tables behind them became readable to
 * `moneyverse_app` in the process. If a later change makes one of these reads
 * easier by granting SELECT, the second half of this file is what notices.
 */
const DATABASE_URL = databaseUrl();
const UNKNOWN = '00000000-0000-4000-8000-000000000000';

function code(error: unknown): string | undefined {
  return typeof error === 'object' && error !== null && 'code' in error
    ? String((error as { code?: unknown }).code)
    : undefined;
}

describe.skipIf(!DATABASE_URL)('the operations read models against a real database', () => {
  let pool: Pool;

  beforeAll(() => {
    pool = new Pool({ connectionString: DATABASE_URL, max: 2 });
  });

  afterAll(async () => {
    await pool.end();
  });

  const SINGLE_ARGUMENT: readonly string[] = [
    'admin_work_catalogue',
    'admin_work_job_levels',
    'admin_work_reward_policy',
    'admin_bank_overview',
    'admin_credit_grades',
    'admin_discord_outbox_health',
    'admin_discord_routes',
  ];

  it.each(SINGLE_ARGUMENT)('%s refuses a caller with no administrator role', async (fn) => {
    const error = await rejectionOf(() => pool.query(`SELECT * FROM public.${fn}($1)`, [UNKNOWN]));
    expect(code(error), `${fn} must answer 42501`).toBe('42501');
  });

  it('refuses the loan book to a caller with no administrator role', async () => {
    const error = await rejectionOf(() =>
      pool.query('SELECT * FROM public.admin_loan_book($1, $2)', [UNKNOWN, 10]),
    );
    expect(code(error)).toBe('42501');
  });

  /**
   * The bound is checked before the role, as 039 does, so this is 22023 and
   * not 42501. A malformed request is malformed whoever sent it.
   */
  it('refuses a loan book page nobody should ask for', async () => {
    const error = await rejectionOf(() =>
      pool.query('SELECT * FROM public.admin_loan_book($1, $2)', [UNKNOWN, 5000]),
    );
    expect(code(error)).toBe('22023');
  });

  const CLOSED_TABLES: readonly string[] = [
    'work_task_catalog',
    'work_assignments',
    'work_reward_receipts',
    'user_job_progress',
    'work_reward_policy_versions',
    'virtual_bank_loans',
    'virtual_bank_loan_repayments',
    'bank_credit_policies',
    'discord_outbox_routes',
  ];

  it.each(CLOSED_TABLES)('leaves public.%s unreadable by the application role', async (table) => {
    await expect(pool.query(`SELECT * FROM public.${table} LIMIT 1`)).rejects.toThrow(
      /permission denied/i,
    );
  });

  /**
   * 005 grants the application SELECT on `outbox_events`, and 106 restates a
   * pile of revokes near it. Asserted here because taking that grant away by
   * accident would stop the delivery worker without failing a build.
   */
  it('keeps the outbox itself readable, which the worker depends on', async () => {
    await expect(pool.query('SELECT 1 FROM public.outbox_events LIMIT 1')).resolves.toBeTruthy();
  });
});
