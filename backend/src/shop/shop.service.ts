import { Injectable } from '@nestjs/common';
import type { WldAmount } from '@moneyverse/contract';
import { wldAmount } from '@moneyverse/contract';
import type {
  ShopCatalogRow,
  ShopPurchaseInput,
  ShopPurchaseReceiptRow,
  ShopPurchaseRow,
} from './shop.repository';
import {
  PostgresShopRepository,
  ShopInputError,
  requireShopLimit,
  requireShopUuid,
} from './shop.repository';

export class ShopItemUnavailableError extends Error {
  constructor() {
    super('item is unavailable');
    this.name = 'ShopItemUnavailableError';
  }
}

/**
 * The subset of the repository the service depends on. `PostgresShopRepository`
 * satisfies this structurally; the constructor also accepts any object shaped
 * like it (see the runtime duck-typing check below, kept for callers outside
 * this module's static type checking).
 */
export interface ShopRepositoryLike {
  listActiveItems(options?: { limit?: number }): Promise<ShopCatalogRow[]>;
  purchasesForUser(userId: string, options?: { limit?: number }): Promise<ShopPurchaseRow[]>;
  purchase(input: ShopPurchaseInput): Promise<ShopPurchaseReceiptRow>;
}

export interface ShopCatalogItem {
  readonly itemId: string;
  readonly name: string;
  readonly description: string;
  readonly price: WldAmount;
  readonly createdAt: string;
}

export interface ShopPurchaseView {
  readonly purchaseId: string;
  readonly itemId: string;
  readonly itemName: string;
  readonly transactionId: string;
  readonly amount: WldAmount;
  readonly purchasedAt: string;
}

export interface ShopPurchaseReceipt {
  readonly purchaseId: string;
  readonly transactionId: string;
  readonly amount: WldAmount;
  readonly replayed: boolean;
}

export interface ShopCatalogOptions {
  readonly limit?: unknown;
}

export interface ShopPurchasesOptions {
  readonly limit?: unknown;
}

export interface ShopPurchaseRequest {
  readonly itemId?: unknown;
  readonly idempotencyKey?: unknown;
}

/**
 * Validates a database-sourced integer amount as an already-canonical
 * `WldAmount`, then additionally requires it to be strictly positive. Row
 * types are assertions about the schema, not proofs, so this runs even
 * though the row interfaces already declare the field as `string`.
 */
function positiveWldAmount(value: string, field: string): WldAmount {
  const amount = wldAmount(value, field);
  if (BigInt(amount) <= 0n) throw new Error(`database returned an invalid ${field}`);
  return amount;
}

function timestamp(value: Date | string, field: string): string {
  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.valueOf())) throw new Error(`database returned an invalid ${field}`);
  return parsed.toISOString();
}

function requiredText(value: string, field: string, maxLength: number): string {
  if (typeof value !== 'string' || value.trim().length === 0 || value.length > maxLength) {
    throw new Error(`database returned an invalid ${field}`);
  }
  return value;
}

function unavailableDatabaseError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) return false;
  if (!('code' in error) || !('message' in error)) return false;
  return error.code === '22023' && error.message === 'active shop item required';
}

function normalizeCatalogItem(row: ShopCatalogRow): ShopCatalogItem {
  return {
    itemId: requireShopUuid(row.item_id, 'database item id'),
    name: requiredText(row.name, 'item name', 160),
    description: requiredText(row.description, 'item description', 10_000),
    price: positiveWldAmount(row.price, 'item price'),
    createdAt: timestamp(row.created_at, 'item timestamp'),
  };
}

function normalizePurchase(row: ShopPurchaseRow): ShopPurchaseView {
  return {
    purchaseId: requireShopUuid(row.purchase_id, 'database purchase id'),
    itemId: requireShopUuid(row.item_id, 'database item id'),
    itemName: requiredText(row.item_name, 'purchase item name', 160),
    transactionId: requireShopUuid(row.transaction_id, 'database transaction id'),
    amount: positiveWldAmount(row.paid_amount, 'purchase amount'),
    purchasedAt: timestamp(row.purchased_at, 'purchase timestamp'),
  };
}

/**
 * Application-facing shop operations.
 *
 * Authenticated user IDs are supplied by the session layer. Request DTOs
 * never choose a purchaser, account, or price, and the repository exposes no
 * user lookup that could turn this domain into an account-enumeration API.
 */
@Injectable()
export class ShopService {
  readonly repository: ShopRepositoryLike;

  constructor(repository: ShopRepositoryLike) {
    const requiredMethods: readonly (keyof ShopRepositoryLike)[] = [
      'listActiveItems',
      'purchasesForUser',
      'purchase',
    ];
    if (
      !(repository instanceof PostgresShopRepository) &&
      (!repository || !requiredMethods.every((method) => typeof repository[method] === 'function'))
    ) {
      throw new TypeError('a shop repository is required');
    }
    this.repository = repository;
  }

  async catalog({ limit = 60 }: ShopCatalogOptions = {}): Promise<ShopCatalogItem[]> {
    const itemLimit = requireShopLimit(limit, 'catalog limit');
    const rows = await this.repository.listActiveItems({ limit: itemLimit });
    return rows.map(normalizeCatalogItem);
  }

  async myPurchases(
    authenticatedUserId: string,
    { limit = 30 }: ShopPurchasesOptions = {},
  ): Promise<ShopPurchaseView[]> {
    const userId = requireShopUuid(authenticatedUserId, 'authenticated user id');
    const purchaseLimit = requireShopLimit(limit, 'purchase limit');
    const rows = await this.repository.purchasesForUser(userId, { limit: purchaseLimit });
    return rows.map(normalizePurchase);
  }

  async purchase(
    authenticatedUserId: string,
    { itemId, idempotencyKey }: ShopPurchaseRequest = {},
  ): Promise<ShopPurchaseReceipt> {
    const actorUserId = requireShopUuid(authenticatedUserId, 'authenticated user id');
    const selectedItemId = requireShopUuid(itemId, 'item id');
    const key = requireShopUuid(idempotencyKey, 'idempotency key');
    try {
      const receipt = await this.repository.purchase({
        actorUserId,
        itemId: selectedItemId,
        idempotencyKey: key,
      });
      if (typeof receipt.replayed !== 'boolean')
        throw new Error('database returned an invalid shop receipt');
      return {
        purchaseId: requireShopUuid(receipt.purchase_id, 'database purchase id'),
        transactionId: requireShopUuid(receipt.transaction_id, 'database transaction id'),
        amount: positiveWldAmount(receipt.amount, 'purchase amount'),
        replayed: receipt.replayed,
      };
    } catch (error) {
      // A random, inactive, and deleted catalog item intentionally share one
      // response. The public catalog is the only source of item metadata.
      if (unavailableDatabaseError(error)) throw new ShopItemUnavailableError();
      throw error;
    }
  }
}

export { ShopInputError };
