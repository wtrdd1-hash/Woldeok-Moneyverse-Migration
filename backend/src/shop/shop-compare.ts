import type { ShopCatalogListingRow } from './shop.repository';
import { ShopInputError, requireShopUuid } from './shop.repository';

export class ShopCompareUnavailableError extends Error {
  constructor() {
    super('one or more selected shop items are unavailable');
    this.name = 'ShopCompareUnavailableError';
  }
}

export function parseShopCompareIds(value: unknown): readonly [string, string] {
  if (typeof value !== 'string' || value.length > 80) {
    throw new ShopInputError('exactly two shop item IDs are required');
  }
  const ids = value.split(',');
  if (ids.length !== 2) throw new ShopInputError('exactly two shop item IDs are required');
  const first = requireShopUuid(ids[0], 'first shop item');
  const second = requireShopUuid(ids[1], 'second shop item');
  if (first === second) throw new ShopInputError('shop comparison requires two different items');
  return [first, second];
}

function canonicalNonnegativeAmount(value: unknown, field: string): string {
  if (typeof value !== 'string' || !/^(0|[1-9][0-9]*)$/.test(value)) {
    throw new Error(`invalid database ${field}`);
  }
  return value;
}

/** Read-only comparison of exactly two rows returned by the actor-scoped SQL read model. */
export function compareShopCatalog(rows: readonly ShopCatalogListingRow[], ids: readonly [string, string]) {
  const items = ids.map((id) => {
    const row = rows.find((candidate) => candidate.catalog_id === id);
    if (!row) throw new ShopCompareUnavailableError();
    return {
      catalog_id: id,
      code: row.code,
      name: row.name,
      category: row.category,
      price: canonicalNonnegativeAmount(row.price, 'shop price'),
      maintenance_cost: canonicalNonnegativeAmount(row.maintenance_cost, 'weekly upkeep'),
      quantity: row.quantity,
      purchase_limit: row.purchase_limit,
      sale_ends_at: row.sale_ends_at,
    };
  });
  const first = items[0]!;
  const second = items[1]!;
  const firstPrice = BigInt(first.price);
  const secondPrice = BigInt(second.price);
  const firstUpkeep = BigInt(first.maintenance_cost);
  const secondUpkeep = BigInt(second.maintenance_cost);
  return {
    source: 'shop_catalog_list_v2' as const,
    items,
    cheaperCatalogId: firstPrice === secondPrice ? null : firstPrice < secondPrice ? first.catalog_id : second.catalog_id,
    priceDifference: (firstPrice > secondPrice ? firstPrice - secondPrice : secondPrice - firstPrice).toString(),
    weeklyUpkeepDifference: (firstUpkeep > secondUpkeep ? firstUpkeep - secondUpkeep : secondUpkeep - firstUpkeep).toString(),
  };
}
