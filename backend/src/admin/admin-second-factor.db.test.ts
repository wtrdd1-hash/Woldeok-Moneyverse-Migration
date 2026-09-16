import { Pool } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { databaseUrl } from '../testing/database';

const DATABASE_URL = databaseUrl();

describe.skipIf(!DATABASE_URL)('retired administrator second factor', () => {
  let pool: Pool;
  beforeAll(() => { pool = new Pool({ connectionString: DATABASE_URL, max: 2 }); });
  afterAll(async () => { await pool.end(); });

  it('removes TOTP and recovery-code storage', async () => {
    const { rows } = await pool.query<{ totp: string | null; recovery: string | null; devices: string | null }>(
      `SELECT to_regclass('public.admin_totp_credentials')::text AS totp,
              to_regclass('public.admin_recovery_codes')::text AS recovery,
              to_regclass('public.admin_trusted_devices')::text AS devices`,
    );
    expect(rows[0]).toEqual({ totp: null, recovery: null, devices: null });
  });

  it('removes TOTP and recovery-code callable functions', async () => {
    const { rows } = await pool.query<{ totp: string | null; recovery: string | null }>(
      `SELECT to_regprocedure('public.admin_totp_consume(uuid,bigint)')::text AS totp,
              to_regprocedure('public.admin_recovery_code_open_session(uuid,uuid,text,text,text)')::text AS recovery`,
    );
    expect(rows[0]).toEqual({ totp: null, recovery: null });
  });

  it('keeps the administrator IP allowlist and login audit tables', async () => {
    const { rows } = await pool.query<{ allowlist: string | null; attempts: string | null }>(
      `SELECT to_regclass('public.admin_ip_allowlist')::text AS allowlist,
              to_regclass('public.admin_login_attempts')::text AS attempts`,
    );
    expect(rows[0]?.allowlist).toBe('admin_ip_allowlist');
    expect(rows[0]?.attempts).toBe('admin_login_attempts');
  });
});
