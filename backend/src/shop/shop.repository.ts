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
    if (!pool || typeof pool.query !== 'function')
      throw new TypeError('a PostgreSQL pool is required');
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

  async purchasesForUser(
    userId: string,
    { limit = 30 }: { limit?: number } = {},
  ): Promise<ShopPurchaseRow[]> {
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

  async purchase({
    actorUserId,
    itemId,
    idempotencyKey,
  }: ShopPurchaseInput): Promise<ShopPurchaseReceiptRow> {
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

/**
 * Mirrors the bound `shop_purchase_catalog` enforces on its fourth argument
 * (`p_quantity NOT BETWEEN 1 AND 100`, migration 072). Validated here as well
 * as in the function so an out-of-range count is answered as a sentence about
 * the field rather than as a conflict carrying a function's message.
 *
 * `requireShopLimit` polices the same interval for page sizes; this delegates
 * to it rather than repeating the numbers, and stays a separate name because
 * the two follow different authorities and can drift apart.
 */
export function requireShopQuantity(value: unknown): number {
  return requireShopLimit(value, 'quantity');
}

/** public.shop_catalog_list RETURNS TABLE: packages/database/migrations/075-shop-read-models-and-maintenance.sql */
export interface ShopCatalogListingRow {
  readonly catalog_id: string;
  readonly code: string;
  readonly name: string;
  readonly description: string;
  readonly category: string;
  /** bigint */
  readonly price: string;
  /** integer, and null when the item is not stock-limited. */
  readonly quantity: number | null;
  readonly purchase_limit: string;
  readonly effect_kind: string;
  /** bigint. The weekly charge migration 075 attaches to vehicles and leases. */
  readonly maintenance_cost: string;
  readonly sale_ends_at: Date | null;
}

/** public.shop_my_items RETURNS TABLE: packages/database/migrations/104-item-lifecycle.sql */
export interface ShopHoldingRow {
  readonly catalog_id: string;
  readonly code: string;
  readonly name: string;
  readonly quantity: number;
  readonly acquired_at: Date;
  /** When the holding itself ends; 104 stamps it from the catalogue's term. */
  readonly expires_at: Date | null;
  readonly effect_kind: string;
  /** Carries a term or an upkeep, so 104 refuses to consume it. */
  readonly durable: boolean;
  /** bigint */
  readonly weekly_cost: string;
  /** When the effect started on this holding stops. A different clock. */
  readonly effect_expires_at: Date | null;
  readonly unpaid_weeks: number;
  /** bigint */
  readonly arrears_due: string;
  /** bigint: where the debt stops growing, spec 16.4. */
  readonly arrears_cap: string;
  readonly suspended: boolean;
}

/** public.shop_purchase_catalog RETURNS TABLE: packages/database/migrations/072-shop-purchase-function.sql */
export interface ShopCatalogReceiptRow {
  readonly purchase_id: string;
  /** bigint: unit price times quantity, read back from the stored row. */
  readonly amount: string;
  readonly transaction_id: string;
  readonly replayed: boolean;
}

/** public.shop_use_item RETURNS TABLE: packages/database/migrations/074-shop-item-effects.sql */
export interface ShopItemUseRow {
  readonly catalog_id: string;
  // Null on a replay whose key was spent on a different item: 074 leaves the
  // OUT parameter unset there rather than guessing a count.
  readonly remaining_quantity: number | null;
  readonly expires_at: Date | null;
  readonly replayed: boolean;
}

/** public.shop_settle_upkeep RETURNS TABLE: packages/database/migrations/104-item-lifecycle.sql */
export interface ShopUpkeepSettlementRow {
  /** bigint: the capped figure the function read, not one the caller sent. */
  readonly paid_amount: string;
  readonly ledger_transaction_id: string;
  readonly replayed: boolean;
}

/**
 * The catalogue of migrations 071-075 and 104, beside the 009 shop above.
 *
 * A second class rather than more methods on `ShopService`: that service
 * exists to brand the 009 columns as `WldAmount` and rename them for the
 * wire, and its constructor asserts the exact method list it needs. These
 * read models carry their own OUT parameters, which the newest module in this
 * codebase hands to the controller unchanged, so there is nothing left for a
 * service to normalise -- and the amounts stay strings either way.
 *
 * Every statement targets a narrowly granted SECURITY DEFINER function. The
 * six catalogue tables are readable by no application role at all, which
 * `shop-catalog.db.test.ts` asserts on every run.
 */
export class ShopCatalogRepository {
  constructor(private readonly pool: Queryable) {
    if (!pool || typeof pool.query !== 'function')
      throw new TypeError('a PostgreSQL pool is required');
  }

  async catalog(actor: unknown): Promise<ShopCatalogListingRow[]> {
    const actorUserId = requireShopUuid(actor, 'authenticated user id');
    return queryRows<ShopCatalogListingRow>(
      this.pool,
      `SELECT listing.catalog_id::text AS catalog_id,
              listing.code,
              listing.name,
              listing.description,
              listing.category,
              listing.price::text AS price,
              listing.quantity,
              listing.purchase_limit,
              listing.effect_kind::text AS effect_kind,
              listing.maintenance_cost::text AS maintenance_cost,
              listing.sale_ends_at
       FROM public.shop_catalog_list($1) AS listing`,
      [actorUserId],
    );
  }

  async holdings(actor: unknown): Promise<ShopHoldingRow[]> {
    const actorUserId = requireShopUuid(actor, 'authenticated user id');
    return queryRows<ShopHoldingRow>(
      this.pool,
      `SELECT holding.catalog_id::text AS catalog_id,
              holding.code,
              holding.name,
              holding.quantity,
              holding.acquired_at,
              holding.expires_at,
              holding.effect_kind::text AS effect_kind,
              holding.durable,
              holding.weekly_cost::text AS weekly_cost,
              holding.effect_expires_at,
              holding.unpaid_weeks,
              holding.arrears_due::text AS arrears_due,
              holding.arrears_cap::text AS arrears_cap,
              holding.suspended
       FROM public.shop_my_items($1) AS holding`,
      [actorUserId],
    );
  }

  /**
   * The price is never an argument. `shop_purchase_catalog` re-reads
   * `base_price` inside the transaction that posts the ledger entry, and a
   * replay reports the amount stored on the first receipt rather than
   * anything this caller repeats.
   */
  async purchase(
    key: unknown,
    actor: unknown,
    catalogId: unknown,
    quantity: unknown = 1,
  ): Promise<ShopCatalogReceiptRow> {
    const idempotencyKey = requireShopUuid(key, 'idempotency key');
    const actorUserId = requireShopUuid(actor, 'authenticated user id');
    const item = requireShopUuid(catalogId, 'catalog item id');
    const count = requireShopQuantity(quantity);
    const row = await queryOne<ShopCatalogReceiptRow>(
      this.pool,
      `SELECT purchase.purchase_id::text AS purchase_id,
              purchase.amount::text AS amount,
              purchase.transaction_id::text AS transaction_id,
              purchase.replayed
       FROM public.shop_purchase_catalog($1, $2, $3, $4) AS purchase`,
      [idempotencyKey, actorUserId, item, count],
    );
    if (!row) throw new Error('shop_purchase_catalog did not return a receipt');
    return row;
  }

  /**
   * Only a `convenience` item can be consumed; the function answers 22023 for
   * a decoration or a display piece, and 22023 again for an item nobody owns.
   * The two share one answer on purpose -- the catalogue is the only place a
   * member learns what an item is.
   */
  async use(key: unknown, actor: unknown, catalogId: unknown): Promise<ShopItemUseRow> {
    const idempotencyKey = requireShopUuid(key, 'idempotency key');
    const actorUserId = requireShopUuid(actor, 'authenticated user id');
    const item = requireShopUuid(catalogId, 'catalog item id');
    const row = await queryOne<ShopItemUseRow>(
      this.pool,
      `SELECT used.catalog_id::text AS catalog_id,
              used.remaining_quantity,
              used.expires_at,
              used.replayed
       FROM public.shop_use_item($1, $2, $3) AS used`,
      [idempotencyKey, actorUserId, item],
    );
    if (!row) throw new Error('shop_use_item did not return a receipt');
    return row;
  }

  /**
   * Pays off the weekly upkeep a holding has fallen behind on.
   *
   * No amount is an argument, for the same reason no price is on a purchase:
   * `shop_settle_upkeep` reads the capped `amount_due` inside the transaction
   * that posts it. A member with nothing outstanding is answered 22023, which
   * reaches the caller as a conflict rather than as a payment of zero.
   */
  async settleUpkeep(
    key: unknown,
    actor: unknown,
    catalogId: unknown,
  ): Promise<ShopUpkeepSettlementRow> {
    const idempotencyKey = requireShopUuid(key, 'idempotency key');
    const actorUserId = requireShopUuid(actor, 'authenticated user id');
    const item = requireShopUuid(catalogId, 'catalog item id');
    const row = await queryOne<ShopUpkeepSettlementRow>(
      this.pool,
      `SELECT settlement.paid_amount::text AS paid_amount,
              settlement.ledger_transaction_id::text AS ledger_transaction_id,
              settlement.replayed
       FROM public.shop_settle_upkeep($1, $2, $3) AS settlement`,
      [idempotencyKey, actorUserId, item],
    );
    if (!row) throw new Error('shop_settle_upkeep did not return a receipt');
    return row;
  }
}
