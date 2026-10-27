import { Pool } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const MIGRATOR_DATABASE_URL = process.env.MIGRATOR_DATABASE_URL;

describe.skipIf(!MIGRATOR_DATABASE_URL)('P0 pocket legacy ACL: real PostgreSQL', () => {
  let pool: Pool;

  beforeAll(() => {
    pool = new Pool({ connectionString: MIGRATOR_DATABASE_URL, max: 1 });
  });

  afterAll(async () => {
    await pool.end();
  });

  it('does not grant PUBLIC or app execution on any surviving text-key overload', async () => {
    const result = await pool.query<{
      signature: string;
      public_execute: boolean;
      app_execute: boolean;
    }>(`
      SELECT p.oid::regprocedure::text AS signature,
             EXISTS (
               SELECT 1
               FROM aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) a
               WHERE a.grantee = 0 AND a.privilege_type = 'EXECUTE'
             ) AS public_execute,
             has_function_privilege('moneyverse_app', p.oid, 'EXECUTE') AS app_execute
      FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE n.nspname = 'public'
        AND p.oid::regprocedure::text IN (
          'bank_archive_pocket(text,uuid,uuid)',
          'bank_customize_pocket(text,uuid,uuid,text,text)',
          'bank_transfer_pocket(text,uuid,uuid,bigint,text)'
        )
      ORDER BY signature
    `);
    for (const row of result.rows) {
      expect(row.public_execute, row.signature).toBe(false);
      expect(row.app_execute, row.signature).toBe(false);
    }
  });
});
