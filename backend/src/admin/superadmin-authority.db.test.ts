import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { databaseUrl, rejectionOf } from '../testing/database';

/**
 * The SQL added by migrations 057-060, executed.
 *
 * The development machine has no PostgreSQL server, so CI is where these run
 * at all; they skip without DATABASE_URL and a skipped test is never reported
 * as a passing one.
 *
 * Everything here connects as `moneyverse_app`, which is the whole point: the
 * tables behind these functions are revoked from that role, so a test that
 * can read one of them directly is a test that has found a lost REVOKE.
 */
const DATABASE_URL = databaseUrl();
const UNKNOWN = '00000000-0000-4000-8000-000000000000';

function code(error: unknown): string | undefined {
  return typeof error === 'object' && error !== null && 'code' in error
    ? String((error as { code?: unknown }).code)
    : undefined;
}

describe.skipIf(!DATABASE_URL)('superadmin authority against a real database', () => {
  let pool: Pool;

  beforeAll(() => {
    pool = new Pool({ connectionString: DATABASE_URL, max: 2 });
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('the enum and the retired approval workflow (057, 058)', () => {
    it('carries a superadmin value in admin_role', async () => {
      const { rows } = await pool.query<{ label: string }>(
        `SELECT enumlabel AS label FROM pg_catalog.pg_enum
         WHERE enumtypid = 'public.admin_role'::pg_catalog.regtype ORDER BY enumsortorder`,
      );
      expect(rows.map((row) => row.label)).toContain('superadmin');
    });

    it('no longer forbids a requester from being the approver', async () => {
      const { rows } = await pool.query<{ definition: string }>(
        `SELECT pg_catalog.pg_get_constraintdef(oid) AS definition
         FROM pg_catalog.pg_constraint
         WHERE conrelid = 'public.admin_approval_requests'::pg_catalog.regclass
           AND contype = 'c'`,
      );
      expect(rows.map((row) => row.definition).join(' ')).not.toContain('approver_id');
    });

    it('has dropped the Minecraft approval-sync trigger', async () => {
      const { rows } = await pool.query(
        `SELECT 1 FROM pg_catalog.pg_trigger
         WHERE tgrelid = 'public.admin_approval_requests'::pg_catalog.regclass
           AND tgname = 'minecraft_approved_operation_approval_sync'
           AND NOT tgisinternal`,
      );
      expect(rows).toHaveLength(0);
    });

    it('has dropped the trigger function the Minecraft policies existed for', async () => {
      const { rows } = await pool.query(
        `SELECT 1 FROM pg_catalog.pg_proc
         WHERE proname = 'minecraft_sync_approved_operation_from_approval'`,
      );
      expect(rows).toHaveLength(0);
    });

    /**
     * The five `minecraft.operation.*` policy rows went with it. The table is
     * revoked from the application role, so their absence is asserted through
     * the catalog's record of the column that made them two-person: with the
     * default flipped, a row that arrived without one is single-person, which
     * is the state the whole workflow was retired into.
     */
    it('no longer defaults an action policy to two-person approval', async () => {
      const { rows } = await pool.query<{ definition: string | null }>(
        `SELECT pg_catalog.pg_get_expr(default_row.adbin, default_row.adrelid) AS definition
         FROM pg_catalog.pg_attrdef AS default_row
         JOIN pg_catalog.pg_attribute AS column_row
           ON column_row.attrelid = default_row.adrelid AND column_row.attnum = default_row.adnum
         WHERE default_row.adrelid = 'public.admin_action_policies'::pg_catalog.regclass
           AND column_row.attname = 'requires_two_person_approval'`,
      );
      expect(rows[0]?.definition).toBe('false');
    });

    it('keeps the action policy table unreadable by the application role', async () => {
      await expect(pool.query('SELECT * FROM public.admin_action_policies')).rejects.toThrow(
        /permission denied/i,
      );
    });

    it('refuses to raise an approval request at all', async () => {
      const error = await rejectionOf(() =>
        pool.query('SELECT public.admin_create_approval_request($1,$2,$3::jsonb,$4)', [
          UNKNOWN,
          'economy.treasury.adjust',
          {},
          randomUUID(),
        ]),
      );
      expect(code(error)).toBe('55000');
    });

    it('refuses to decide an approval request at all', async () => {
      const error = await rejectionOf(() =>
        pool.query('SELECT * FROM public.admin_decide_approval_request($1,$2,$3)', [
          UNKNOWN,
          UNKNOWN,
          'approved',
        ]),
      );
      expect(code(error)).toBe('55000');
    });

    it('no longer caps the superadmin role at one row (121)', async () => {
      // 057's partial unique index was the one-superadmin rule; 121 dropped
      // it so that more than one account can hold the role. What must stay
      // true is that the index is gone, not that it is there.
      const { rows } = await pool.query(
        `SELECT 1 FROM pg_catalog.pg_indexes
         WHERE schemaname = 'public' AND indexname = 'user_roles_single_superadmin'`,
      );
      expect(rows).toHaveLength(0);
    });
  });

  describe('role designation (058)', () => {
    it('refuses a grant from somebody holding no role', async () => {
      const error = await rejectionOf(() =>
        pool.query('SELECT * FROM public.admin_grant_role($1,$2,$3,$4,$5)', [
          randomUUID(),
          UNKNOWN,
          UNKNOWN,
          'operator',
          'granting a role for the authority test',
        ]),
      );
      // Either refusal is correct and which one comes first depends on
      // whether a superadmin has been designated on this database yet.
      expect(['42501', '22023']).toContain(code(error));
    });

    it('refuses a reason too short to mean anything', async () => {
      const error = await rejectionOf(() =>
        pool.query('SELECT * FROM public.admin_grant_role($1,$2,$3,$4,$5)', [
          randomUUID(),
          UNKNOWN,
          UNKNOWN,
          'operator',
          'oops',
        ]),
      );
      expect(code(error)).toBe('22023');
    });

    it('refuses an unknown role name before it refuses anything else', async () => {
      const error = await rejectionOf(() =>
        pool.query('SELECT * FROM public.admin_grant_role($1,$2,$3,$4,$5)', [
          randomUUID(),
          UNKNOWN,
          UNKNOWN,
          'root',
          'granting a role for the authority test',
        ]),
      );
      expect(code(error)).toBe('22023');
    });

    it('refuses to revoke the superadmin designation', async () => {
      const error = await rejectionOf(() =>
        pool.query('SELECT * FROM public.admin_revoke_role($1,$2,$3,$4,$5)', [
          randomUUID(),
          UNKNOWN,
          UNKNOWN,
          'superadmin',
          'revoking the designation should be impossible',
        ]),
      );
      expect(code(error)).toBe('22023');
    });

    it('keeps the role tables unreadable by the application role', async () => {
      await expect(pool.query('SELECT * FROM public.admin_role_designations')).rejects.toThrow(
        /permission denied/i,
      );
      await expect(pool.query('SELECT * FROM public.admin_command_receipts')).rejects.toThrow(
        /permission denied/i,
      );
    });
  });

  describe('administrator sessions (058)', () => {
    it('reports no console session for a session that never opened one', async () => {
      const { rows } = await pool.query<{ state: string }>(
        'SELECT state FROM public.admin_session_touch($1,$2)',
        [UNKNOWN, UNKNOWN],
      );
      expect(rows[0]?.state).toBe('closed');
    });

    it('refuses to open a console session for an unknown session', async () => {
      const error = await rejectionOf(() =>
        pool.query('SELECT * FROM public.admin_session_open($1,$2,$3,$4)', [
          UNKNOWN,
          UNKNOWN,
          'a'.repeat(64),
          'b'.repeat(64),
        ]),
      );
      expect(code(error)).toBe('22023');
    });

    it('refuses a forced logout from somebody who is not the superadmin', async () => {
      const error = await rejectionOf(() =>
        pool.query('SELECT * FROM public.admin_force_logout($1,$2,$3,$4)', [
          randomUUID(),
          UNKNOWN,
          UNKNOWN,
          'ending sessions for the authority test',
        ]),
      );
      expect(code(error)).toBe('42501');
    });

    it('carries the four admin session columns on auth_sessions', async () => {
      const { rows } = await pool.query<{ column_name: string }>(
        `SELECT column_name FROM information_schema.columns
         WHERE table_schema = 'public' AND table_name = 'auth_sessions'
           AND column_name LIKE 'admin\\_%'
         ORDER BY column_name`,
      );
      expect(rows.map((row) => row.column_name)).toEqual([
        'admin_closed_at',
        'admin_last_seen_at',
        'admin_opened_at',
        'admin_rotated_from',
      ]);
    });
  });
});
