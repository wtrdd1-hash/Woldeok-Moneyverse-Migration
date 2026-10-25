import { Pool } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { ShopService } from './shop.service';
import { PostgresShopRepository } from './shop.repository';

const DATABASE_URL = process.env.DATABASE_URL ?? null;

/** Run only against a deliberately selected isolated PostgreSQL database. */
describe.skipIf(!DATABASE_URL)('shop purchase history least-privilege real database', () => {
  let pool: Pool;
  beforeAll(() => { pool = new Pool({ connectionString: DATABASE_URL!, max: 1 }); });
  afterAll(async () => { await pool.end(); });

  it('uses an owner-scoped function, not direct purchase-table access', async () => {
    const { rows } = await pool.query<{ can_execute: boolean; can_read: boolean; can_insert: boolean }>(
      `SELECT has_function_privilege(current_user, 'public.shop_list_my_purchases(uuid,integer)', 'EXECUTE') AS can_execute,
              has_table_privilege(current_user, 'public.shop_purchases', 'SELECT') AS can_read,
              has_table_privilege(current_user, 'public.shop_purchases', 'INSERT') AS can_insert`,
    );
    expect(rows[0]?.can_execute).toBe(true);
    expect(rows[0]?.can_read).toBe(false);
    expect(rows[0]?.can_insert).toBe(false);
  });

  it('does not return another member\'s purchase data for an unknown actor', async () => {
    const service = new ShopService(new PostgresShopRepository(pool));
    await expect(service.myPurchases('00000000-0000-4000-8000-000000000000')).resolves.toEqual([]);
  });
});
