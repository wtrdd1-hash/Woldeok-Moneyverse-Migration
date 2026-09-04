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

export function requireShopQuantity(value: unknown): number {
  return requireShopLimit(value, 'quantity');
}

/** Store 2.0 extended catalog listing */
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
  /** bigint. The weekly charge */
  readonly maintenance_cost: string;
  readonly sale_ends_at: Date | null;
  readonly rarity: string;
  readonly animation_css: string | null;
  readonly preview_data: Record<string, unknown>;
  readonly max_stock: number | null;
  readonly is_limited: boolean;
  readonly user_owned_quantity: number;
  readonly user_is_equipped: boolean;
}

/** Store 2.0 user holdings row */
export interface ShopHoldingRow {
  readonly catalog_id: string;
  readonly code: string;
  readonly name: string;
  readonly description: string;
  readonly category: string;
  readonly quantity: number;
  readonly acquired_at: Date;
  readonly expires_at: Date | null;
  readonly effect_kind: string;
  readonly rarity: string;
  readonly animation_css: string | null;
  readonly preview_data: Record<string, unknown>;
  readonly is_equipped: boolean;
  readonly equipped_slot: string | null;
  readonly serial_number: number | null;
  readonly durable?: boolean;
  readonly weekly_cost?: string;
  readonly effect_expires_at?: Date | null;
  readonly unpaid_weeks?: number;
  readonly arrears_due?: string;
  readonly arrears_cap?: string;
  readonly suspended?: boolean;
}

export interface ShopCatalogReceiptRow {
  readonly purchase_id: string;
  readonly amount: string;
  readonly transaction_id: string;
  readonly replayed: boolean;
}

export interface ShopItemUseRow {
  readonly catalog_id: string;
  readonly remaining_quantity: number | null;
  readonly expires_at: Date | null;
  readonly replayed: boolean;
}

export interface ShopUpkeepSettlementRow {
  readonly paid_amount: string;
  readonly ledger_transaction_id: string;
  readonly replayed: boolean;
}

export interface EquipResultRow {
  readonly success: boolean;
  readonly catalog_id: string;
  readonly slot: string;
  readonly is_equipped: boolean;
}

/**
 * ShopCatalogRepository for Store 2.0
 */
export class ShopCatalogRepository {
  constructor(private readonly pool: Queryable) {
    if (!pool || typeof pool.query !== 'function')
      throw new TypeError('a PostgreSQL pool is required');
  }

  async catalog(actor: unknown): Promise<ShopCatalogListingRow[]> {
    const actorUserId = actor ? requireShopUuid(actor, 'authenticated user id') : null;
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
              listing.sale_ends_at,
              listing.rarity,
              listing.animation_css,
              listing.preview_data,
              listing.max_stock,
              listing.is_limited,
              listing.user_owned_quantity,
              listing.user_is_equipped
       FROM public.shop_catalog_list_v2($1) AS listing`,
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
              holding.description,
              holding.category,
              holding.quantity,
              holding.acquired_at,
              holding.expires_at,
              holding.effect_kind::text AS effect_kind,
              holding.rarity,
              holding.animation_css,
              holding.preview_data,
              holding.is_equipped,
              holding.equipped_slot,
              holding.serial_number
       FROM public.shop_my_items_v2($1) AS holding`,
      [actorUserId],
    );
  }

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

  async equipItem(
    actor: unknown,
    catalogId: unknown,
    slot?: unknown,
    equip: boolean = true,
  ): Promise<EquipResultRow> {
    const actorUserId = requireShopUuid(actor, 'authenticated user id');
    const item = requireShopUuid(catalogId, 'catalog item id');
    const targetSlot = typeof slot === 'string' && slot ? slot : null;
    const row = await queryOne<EquipResultRow>(
      this.pool,
      `SELECT success, catalog_id::text, slot, is_equipped
       FROM public.inventory_equip_item($1, $2, $3, $4)`,
      [actorUserId, item, targetSlot, equip],
    );
    if (!row) throw new Error('inventory_equip_item did not return a result');
    return row;
  }

  async getCosmetics(userId: unknown): Promise<Record<string, unknown>> {
    const targetUserId = requireShopUuid(userId, 'user id');
    const row = await queryOne<{ cosmetics: Record<string, unknown> }>(
      this.pool,
      `SELECT public.profile_get_cosmetics($1) AS cosmetics`,
      [targetUserId],
    );
    return row?.cosmetics ?? {};
  }

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
