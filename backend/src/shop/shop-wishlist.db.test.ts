import { Pool } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { databaseUrl, isMissingGrant } from '../testing/database';
import { ShopCatalogRepository } from './shop.repository';

const DATABASE_URL = databaseUrl();
const UNKNOWN_MEMBER = '00000000-0000-4000-8000-000000000000';

describe.skipIf(!DATABASE_URL)('shop wishlist PostgreSQL security boundary', () => {
  let pool: Pool;
  beforeAll(() => { pool = new Pool({ connectionString: DATABASE_URL, max: 1 }); });
  afterAll(async () => { await pool.end(); });

  it('refuses direct DML on the wishlist tables', async () => {
    const result = await pool.query<{ can_insert: boolean; can_select: boolean }>(
      `SELECT has_table_privilege(current_user, 'public.shop_wishlist_items', 'INSERT') AS can_insert,
              has_table_privilege(current_user, 'public.shop_wishlist_receipts', 'SELECT') AS can_select`,
    );
    expect(result.rows[0]).toMatchObject({ can_insert: false, can_select: false });
  });

  it('rejects unknown actor inside function, not because of missing EXECUTE grant', async () => {
    const repo = new ShopCatalogRepository(pool);
    const error = await repo.wishlist(UNKNOWN_MEMBER).then(() => null, (caught: unknown) => caught);
    expect(error).toMatchObject({ code: '28000' });
    expect(isMissingGrant(error)).toBe(false);
  });
});
