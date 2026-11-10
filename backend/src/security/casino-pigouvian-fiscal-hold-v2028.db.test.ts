import { Pool } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const migratorUrl = process.env.MIGRATOR_DATABASE_URL;

describe.skipIf(!migratorUrl)('P0 casino welfare tax trigger hold after migration 347', () => {
  let migrator: Pool;

  beforeAll(() => {
    migrator = new Pool({ connectionString: migratorUrl, max: 1 });
  });

  afterAll(async () => {
    await migrator.end();
  });

  it('removes the unbacked post-insert levy trigger rather than minting fiscal cash', async () => {
    const { rows } = await migrator.query<{ active_trigger_count: string }>(`
      SELECT count(*)::text AS active_trigger_count
      FROM pg_catalog.pg_trigger t
      JOIN pg_catalog.pg_class c ON c.oid = t.tgrelid
      JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public'
        AND c.relname = 'virtual_casino_dice_plays'
        AND t.tgname = 'trg_casino_dice_pigouvian_tax'
        AND NOT t.tgisinternal
    `);
    expect(rows[0]?.active_trigger_count).toBe('0');
  });

  it('keeps the original routine but denies PUBLIC and application execution', async () => {
    const { rows } = await migrator.query<{
      is_definer: boolean;
      public_exec: boolean;
      app_exec: boolean;
    }>(`
      SELECT p.prosecdef AS is_definer,
        EXISTS (
          SELECT 1 FROM pg_catalog.aclexplode(
            COALESCE(p.proacl, pg_catalog.acldefault('f', p.proowner))
          ) privilege_row
          WHERE privilege_row.grantee = 0
            AND privilege_row.privilege_type = 'EXECUTE'
        ) AS public_exec,
        pg_catalog.has_function_privilege(
          'moneyverse_app', p.oid, 'EXECUTE'
        ) AS app_exec
      FROM pg_catalog.pg_proc p
      JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
      WHERE n.nspname = 'public'
        AND p.proname = 'trigger_casino_pigouvian_welfare_tax'
        AND p.pronargs = 0
    `);
    expect(rows).toEqual([{ is_definer: true, public_exec: false, app_exec: false }]);
  });
});
