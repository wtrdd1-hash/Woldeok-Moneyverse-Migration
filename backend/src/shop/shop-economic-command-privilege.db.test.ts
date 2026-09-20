import { Pool } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { databaseUrl } from '../testing/database';

const DATABASE_URL = databaseUrl();

describe.skipIf(!DATABASE_URL)('shop economic-command privilege boundary', () => {
  let pool: Pool;

  beforeAll(() => {
    pool = new Pool({ connectionString: DATABASE_URL, max: 1 });
  });

  afterAll(async () => {
    await pool.end();
  });

  it('does not let the application role forge economic-command lifecycle state', async () => {
    const { rows } = await pool.query<{
      role_name: string;
      can_claim: boolean;
      can_complete: boolean;
      can_call_shop: boolean;
    }>(`
      SELECT
        current_user AS role_name,
        pg_catalog.has_function_privilege(
          current_user,
          'public.economic_command_claim(uuid,text,text,uuid,bytea,text)',
          'EXECUTE'
        ) AS can_claim,
        pg_catalog.has_function_privilege(
          current_user,
          'public.economic_command_complete(uuid,uuid,jsonb)',
          'EXECUTE'
        ) AS can_complete,
        pg_catalog.has_function_privilege(
          current_user,
          'public.shop_purchase_catalog(uuid,uuid,uuid,integer)',
          'EXECUTE'
        ) AS can_call_shop
    `);

    expect(rows[0]?.role_name).toBe('moneyverse_app');
    expect(rows[0]?.can_claim, 'application must not claim arbitrary economic commands').toBe(false);
    expect(rows[0]?.can_complete, 'application must not forge economic command snapshots').toBe(false);
    expect(rows[0]?.can_call_shop, 'the public shop contract must remain callable').toBe(true);
  });
});
