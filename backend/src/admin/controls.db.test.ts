import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { databaseUrl, rejectionOf } from '../testing/database';

/**
 * Migration 060, executed. Skips without DATABASE_URL; CI is where it runs.
 *
 * Two things are being proved. The three stage-3 features arrive disabled and
 * a fresh database does not quietly ship with them on — §3 makes that a
 * release condition, not a preference. And `economy_policies`, which has had
 * a foreign key pointing at it from every ledger transaction since init/001
 * and no way to write a row, now has one that only the superadmin can reach.
 */
const DATABASE_URL = databaseUrl();
const UNKNOWN = '00000000-0000-4000-8000-000000000000';

function code(error: unknown): string | undefined {
  return typeof error === 'object' && error !== null && 'code' in error
    ? String((error as { code?: unknown }).code)
    : undefined;
}

describe.skipIf(!DATABASE_URL)('the control plane against a real database', () => {
  let pool: Pool;

  beforeAll(() => {
    pool = new Pool({ connectionString: DATABASE_URL, max: 2 });
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('feature switches', () => {
    it('seeds the three stage-3 features disabled', async () => {
      for (const feature of ['casino', 'stock_corporate_action', 'economy_auto_policy']) {
        const { rows } = await pool.query<{ state: string }>(
          'SELECT public.feature_switch_state($1) AS state',
          [feature],
        );
        expect(rows[0]?.state, `${feature} must ship disabled`).toBe('disabled');
      }
    });

    it('treats a feature nobody has registered as off', async () => {
      // Fail closed. Forgetting to seed a row must not be the thing that puts
      // an ungated feature into production -- see the comment on
      // feature_switch_state in migration 059.
      const { rows } = await pool.query<{ state: string }>(
        'SELECT public.feature_switch_state($1) AS state',
        ['a_feature_nobody_registered'],
      );
      expect(rows[0]?.state).toBe('disabled');
    });

    it('keeps the switch table unreadable by the application role', async () => {
      await expect(pool.query('SELECT * FROM public.feature_switches')).rejects.toThrow(
        /permission denied/i,
      );
    });

    it('refuses to list switches without an administrator role', async () => {
      const error = await rejectionOf(() =>
        pool.query('SELECT * FROM public.admin_list_feature_switches($1)', [UNKNOWN]),
      );
      expect(code(error)).toBe('42501');
    });

    it('refuses a state nobody defined', async () => {
      const error = await rejectionOf(() =>
        pool.query('SELECT * FROM public.admin_set_feature_switch($1,$2,$3,$4,$5)', [
          randomUUID(),
          UNKNOWN,
          'casino',
          'on',
          'switching the casino on for the control plane test',
        ]),
      );
      expect(code(error)).toBe('22023');
    });

    it('refuses a flip from somebody who is not the superadmin', async () => {
      const error = await rejectionOf(() =>
        pool.query('SELECT * FROM public.admin_set_feature_switch($1,$2,$3,$4,$5)', [
          randomUUID(),
          UNKNOWN,
          'casino',
          'enabled',
          'switching the casino on for the control plane test',
        ]),
      );
      expect(code(error)).toBe('42501');
    });

    it('refuses a reason too short to mean anything', async () => {
      const error = await rejectionOf(() =>
        pool.query('SELECT * FROM public.admin_set_feature_switch($1,$2,$3,$4,$5)', [
          randomUUID(),
          UNKNOWN,
          'casino',
          'enabled',
          'why',
        ]),
      );
      expect(code(error)).toBe('22023');
    });
  });

  describe('economy policy versions', () => {
    it('no longer lets the application role read the table directly', async () => {
      await expect(pool.query('SELECT * FROM public.economy_policies')).rejects.toThrow(
        /permission denied/i,
      );
    });

    it('reads the active version through a function, empty or not', async () => {
      await expect(pool.query('SELECT * FROM public.economy_active_policy()')).resolves.toBeTruthy();
    });

    it('admits superseded as a status', async () => {
      const { rows } = await pool.query<{ definition: string }>(
        `SELECT pg_catalog.pg_get_constraintdef(oid) AS definition
         FROM pg_catalog.pg_constraint
         WHERE conrelid = 'public.economy_policies'::pg_catalog.regclass
           AND conname = 'economy_policies_status_check'`,
      );
      expect(rows[0]?.definition).toContain('superseded');
    });

    it('allows at most one active version', async () => {
      const { rows } = await pool.query(
        `SELECT 1 FROM pg_catalog.pg_indexes
         WHERE schemaname = 'public' AND indexname = 'economy_policies_single_active'`,
      );
      expect(rows).toHaveLength(1);
    });

    it('refuses a new version from somebody who is not the superadmin', async () => {
      const error = await rejectionOf(() =>
        pool.query(
          `SELECT * FROM public.admin_create_economy_policy_version(
             $1,$2,$3,$4::timestamptz,$5::jsonb,$6)`,
          [
            randomUUID(),
            UNKNOWN,
            'test-version-2026-08-30',
            null,
            {},
            'creating a policy version for the control plane test',
          ],
        ),
      );
      expect(code(error)).toBe('42501');
    });

    it('refuses a version name the ledger could not reference', async () => {
      const error = await rejectionOf(() =>
        pool.query(
          `SELECT * FROM public.admin_create_economy_policy_version(
             $1,$2,$3,$4::timestamptz,$5::jsonb,$6)`,
          [
            randomUUID(),
            UNKNOWN,
            'no',
            null,
            {},
            'creating a policy version for the control plane test',
          ],
        ),
      );
      expect(code(error)).toBe('22023');
    });

    it('refuses a rollback from somebody who is not the superadmin', async () => {
      const error = await rejectionOf(() =>
        pool.query('SELECT * FROM public.admin_rollback_economy_policy($1,$2,$3)', [
          randomUUID(),
          UNKNOWN,
          'rolling the policy back for the control plane test',
        ]),
      );
      expect(code(error)).toBe('42501');
    });

    it('activates nothing when nothing is due', async () => {
      const { rows } = await pool.query<{ activated: number }>(
        'SELECT public.economy_activate_due_policies() AS activated',
      );
      expect(rows[0]?.activated).toBe(0);
    });

    it('refuses to list versions without an administrator role', async () => {
      const error = await rejectionOf(() =>
        pool.query('SELECT * FROM public.admin_list_economy_policies($1,$2)', [UNKNOWN, 30]),
      );
      expect(code(error)).toBe('42501');
    });
  });
});
