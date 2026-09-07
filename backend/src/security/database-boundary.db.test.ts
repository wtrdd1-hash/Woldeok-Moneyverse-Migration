import { Pool } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { databaseUrl } from '../testing/database';

const DATABASE_URL = databaseUrl();
const MIGRATOR_DATABASE_URL = process.env.MIGRATOR_DATABASE_URL;

describe.skipIf(!DATABASE_URL || !MIGRATOR_DATABASE_URL)(
  'the production database privilege boundary',
  () => {
    let app: Pool;
    let migrator: Pool;

    beforeAll(() => {
      app = new Pool({ connectionString: DATABASE_URL, max: 1 });
      migrator = new Pool({ connectionString: MIGRATOR_DATABASE_URL, max: 1 });
    });

    afterAll(async () => {
      await Promise.all([app.end(), migrator.end()]);
    });

    it('leaves no SECURITY DEFINER function executable by PUBLIC', async () => {
      const result = await migrator.query<{ identity: string }>(
        `SELECT procedure_row.oid::regprocedure::text AS identity
         FROM pg_catalog.pg_proc AS procedure_row
         JOIN pg_catalog.pg_namespace AS namespace_row
           ON namespace_row.oid = procedure_row.pronamespace
         WHERE namespace_row.nspname = 'public'
           AND procedure_row.prosecdef
           AND EXISTS (
             SELECT 1
             FROM pg_catalog.aclexplode(
               COALESCE(
                 procedure_row.proacl,
                 pg_catalog.acldefault('f', procedure_row.proowner)
               )
             ) AS privilege_row
             WHERE privilege_row.grantee = 0
               AND privilege_row.privilege_type = 'EXECUTE'
           )
         ORDER BY 1`,
      );
      expect(result.rows).toEqual([]);
    });

    it('makes future migrator-owned functions private by default', async () => {
      const result = await migrator.query<{ public_execute: boolean }>(
        `SELECT EXISTS (
           SELECT 1
           FROM pg_catalog.pg_default_acl AS default_row
           JOIN pg_catalog.pg_roles AS role_row ON role_row.oid = default_row.defaclrole
           JOIN pg_catalog.pg_namespace AS namespace_row ON namespace_row.oid = default_row.defaclnamespace
           CROSS JOIN LATERAL pg_catalog.aclexplode(default_row.defaclacl) AS privilege_row
           WHERE role_row.rolname = 'moneyverse_migrator'
             AND namespace_row.nspname = 'public'
             AND default_row.defaclobjtype = 'f'
             AND privilege_row.grantee = 0
             AND privilege_row.privilege_type = 'EXECUTE'
         ) AS public_execute`,
      );
      expect(result.rows[0]?.public_execute).toBe(false);
    });

    it('does not let the application role call the ledger primitive directly', async () => {
      const result = await app.query<{ allowed: boolean }>(
        `SELECT pg_catalog.has_function_privilege(
           current_user,
           'public.economy_post_transaction(uuid,text,uuid,text,jsonb,text,jsonb)',
           'EXECUTE'
         ) AS allowed`,
      );
      expect(result.rows[0]?.allowed).toBe(false);
    });

    it('keeps direct writes limited to the session layer', async () => {
      const result = await app.query<{ table_name: string; privilege_type: string }>(
        `SELECT grant_row.table_name, grant_row.privilege_type
         FROM information_schema.role_table_grants AS grant_row
         WHERE grant_row.grantee = current_user
           AND grant_row.privilege_type IN ('INSERT', 'UPDATE', 'DELETE')
         ORDER BY grant_row.table_name, grant_row.privilege_type`,
      );
      expect(result.rows).toEqual([
        { table_name: 'auth_sessions', privilege_type: 'INSERT' },
        { table_name: 'auth_sessions', privilege_type: 'UPDATE' },
        { table_name: 'oauth_challenges', privilege_type: 'INSERT' },
        { table_name: 'oauth_challenges', privilege_type: 'UPDATE' },
      ]);
    });
  },
);
