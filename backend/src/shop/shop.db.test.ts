import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { databaseUrl, isMissingGrant, rejectionOf } from '../testing/database';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { PostgresShopRepository } from './shop.repository';
import { ShopService } from './shop.service';

const DATABASE_URL = databaseUrl();

describe.skipIf(!DATABASE_URL)('shop against a real database', () => {
  let pool: Pool;
  let service: ShopService;

  beforeAll(() => {
    pool = new Pool({ connectionString: DATABASE_URL, max: 2 });
    service = new ShopService(new PostgresShopRepository(pool));
  });

  afterAll(async () => {
    await pool.end();
  });

  const UNKNOWN_USER = '00000000-0000-4000-8000-000000000000';

  it('calls shop_list_active_items with the declared signature', async () => {
    await expect(service.catalog()).resolves.toBeInstanceOf(Array);
  });

  it('calls shop_list_my_purchases with the declared signature', async () => {
    await expect(service.myPurchases(UNKNOWN_USER)).resolves.toEqual([]);
  });

  it('refuses a purchase of an item that does not exist', async () => {
    await expect(
      service.purchase(UNKNOWN_USER, { itemId: randomUUID(), idempotencyKey: randomUUID() }),
    ).rejects.toThrow();
  });

  it('rejects a malformed idempotency key before querying', async () => {
    await expect(
      service.purchase(UNKNOWN_USER, { itemId: randomUUID(), idempotencyKey: 'nope' }),
    ).rejects.toThrow();
  });

  it('is refused by the function itself, never by a missing grant', async () => {
    const error = await service
      .purchase(UNKNOWN_USER, { itemId: randomUUID(), idempotencyKey: randomUUID() })
      .then(
        () => null,
        (caught: unknown) => caught,
      );
    expect(isMissingGrant(error), 'the role lost a grant').toBe(false);
  });
})
