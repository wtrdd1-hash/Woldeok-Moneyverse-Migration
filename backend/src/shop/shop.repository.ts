import { Injectable } from '@nestjs/common';
import type { Queryable } from '../core/db';
import { queryOne, queryRows } from '../core/db';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class ShopInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ShopInputError';
  }
}

export function requireShopUuid(value: unknown, field: string): string {
  if (typeof value !== 'string' || !UUID_PATTERN.test(value)) {
    throw new ShopInputError(`${field} must be a UUID`);
  }
  return value.toLowerCase();
}

export function requireShopLimit(value: unknown, field = 'limit'): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 1 || value > 100) {
    throw new ShopInputError(`${field} must be an integer between 1 and 100`);
  }
  return value;
}

/** public.shop_list_active_items RETURNS TABLE: packages/database/migrations/009-shop-hardening.sql */
export interface ShopCatalogRow {
  readonly item_id: string;
  readonly name: string;
  readonly description: string;
  readonly price: string;
  readonly created_at: Date;
}

/** public.shop_list_my_purchases RETURNS TABLE: packages/database/migrations/009-shop-hardening.sql */
export interface ShopPurchaseRow {
  readonly purchase_id: string;
  readonly item_id: string;
  readonly item_name: string;
  readonly transaction_id: string;
  readonly paid_amount: string;
  readonly purchased_at: Date;
}

/** public.shop_purchase RETURNS TABLE: packages/database/migrations/009-shop-hardening.sql */
export interface ShopPurchaseReceiptRow {
  readonly purchase_id: string;
  readonly transaction_id: string;
  readonly amount: string;
  readonly replayed: boolean;
}

export interface ShopPurchaseInput {
  readonly actorUserId: string;
  readonly itemId: string;
  readonly idempotencyKey: string;
}

/**
 * Database gateway for shop use cases.
 *
 * Every statement targets a narrowly granted SECURITY DEFINER function. This
 * class deliberately has no SQL path that reads a shop table directly or
 * writes catalogue items, purchases, balances, or the ledger.
 */
@Injectable()
export class PostgresShopRepository {
  readonly pool: Queryable;

  constructor(pool: Queryable) {
    if (!pool || typeof pool.query !== 'function') throw new TypeError('a PostgreSQL pool is required');
    this.pool = pool;
  }

  async listActiveItems({ limit = 60 }: { limit?: number } = {}): Promise<ShopCatalogRow[]> {
    const itemLimit = requireShopLimit(limit, 'catalog limit');
    return queryRows<ShopCatalogRow>(
      this.pool,
      `SELECT item_id::text AS item_id, name, description, price::text AS price, created_at
       FROM public.shop_list_active_items($1)`,
      [itemLimit],
    );
  }

  async purchasesForUser(userId: string, { limit = 30 }: { limit?: number } = {}): Promise<ShopPurchaseRow[]> {
    const authenticatedUserId = requireShopUuid(userId, 'authenticated user id');
    const purchaseLimit = requireShopLimit(limit, 'purchase limit');
    return queryRows<ShopPurchaseRow>(
      this.pool,
      `SELECT
         purchase_id::text AS purchase_id,
         item_id::text AS item_id,
         item_name,
         transaction_id::text AS transaction_id,
         paid_amount::text AS paid_amount,
         purchased_at
       FROM public.shop_list_my_purchases($1, $2)`,
      [authenticatedUserId, purchaseLimit],
    );
  }

  async purchase({ actorUserId, itemId, idempotencyKey }: ShopPurchaseInput): Promise<ShopPurchaseReceiptRow> {
    const actor = requireShopUuid(actorUserId, 'authenticated user id');
    const item = requireShopUuid(itemId, 'item id');
    const key = requireShopUuid(idempotencyKey, 'idempotency key');
    const row = await queryOne<ShopPurchaseReceiptRow>(
      this.pool,
      `SELECT
         purchase_id::text AS purchase_id,
         transaction_id::text AS transaction_id,
         amount::text AS amount,
         replayed
       FROM public.shop_purchase($1, $2, $3)`,
      [key, actor, item],
    );
    if (!row?.purchase_id || !row?.transaction_id) {
      throw new Error('database did not return a shop purchase receipt');
    }
    return row;
  }
}
