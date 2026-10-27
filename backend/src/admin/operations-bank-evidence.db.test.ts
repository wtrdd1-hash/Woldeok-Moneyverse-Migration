import { ServiceUnavailableException } from '@nestjs/common';
import { Pool } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { RequestWithSession } from '../auth/session.context';
import { AdminBankOperationsController } from './operations.controller';
import { OperationsRepository } from './operations.repository';

/**
 * Synthetic, disposable PostgreSQL fixture only. Never point this at the
 * production-linked DATABASE_URL; the dedicated env var is intentionally
 * distinct from the project's normal databaseUrl() helper.
 */
const ISOLATED_URL = process.env.MONEYVERSE_BANK_EVIDENCE_DB_URL;
const ACTORS = {
  success: '00000000-0000-4000-8000-000000000001',
  overviewFailure: '00000000-0000-4000-8000-000000000002',
  gradesFailure: '00000000-0000-4000-8000-000000000003',
  loansFailure: '00000000-0000-4000-8000-000000000004',
} as const;

describe.skipIf(!ISOLATED_URL)('bank console against disposable PostgreSQL', () => {
  let pool: Pool;
  let controller: AdminBankOperationsController;
  const requestFor = (userId: string) =>
    ({ session: { user_id: userId } }) as RequestWithSession;

  beforeAll(() => {
    if (!ISOLATED_URL) throw new Error('isolated database URL is required');
    const target = new URL(ISOLATED_URL);
    if (
      target.hostname !== '127.0.0.1' ||
      target.port !== '55483' ||
      target.pathname !== '/mv_b_v583_synthetic'
    ) {
      throw new Error('only the dedicated local synthetic bank database is permitted');
    }
    pool = new Pool({ connectionString: ISOLATED_URL, max: 2 });
    controller = new AdminBankOperationsController(new OperationsRepository(pool));
  });

  afterAll(async () => {
    await pool?.end();
  });

  it('reads exact PostgreSQL numeric strings without changing financial data', async () => {
    const result = await controller.overview(requestFor(ACTORS.success));
    expect(result.overview.deposit_amount).toBe('12345678901234567890');
    expect(result.grades).toHaveLength(1);
    expect(result.loans).toHaveLength(1);
    expect(result.loans[0]?.principal_amount).toBe('23');
  });

  it.each([
    ['overviewFailure', 'simulated overview outage'],
    ['gradesFailure', 'simulated credit grades outage'],
    ['loansFailure', 'simulated loan book outage'],
  ] as const)('refuses fabricated bank evidence on %s', async (actor, message) => {
    const error = await controller.overview(requestFor(ACTORS[actor])).then(
      () => null,
      (cause: unknown) => cause,
    );
    expect(error).toBeInstanceOf(ServiceUnavailableException);
    expect((error as Error).message).toBe('the bank console could not be read');
    expect((error as Error).message).not.toContain(message);
  });

  it('cannot write protected synthetic financial rows as the application role', async () => {
    await expect(pool.query('UPDATE public.protected_bank_balance SET balance = 0')).rejects.toThrow(
      /permission denied/i,
    );
  });
});
