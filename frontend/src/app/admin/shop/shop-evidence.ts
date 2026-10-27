import type { AdminShopItem } from './admin-shop-view';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const POSITIVE_BIGINT = /^[1-9]\d*$/;
const MAX_BIGINT = 9223372036854775807n;
const MAX_STOCK = 2147483647;

function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function validShopPrice(value: unknown): value is string {
  return typeof value === 'string' && POSITIVE_BIGINT.test(value) &&
    value.length <= 19 && BigInt(value) <= MAX_BIGINT;
}

export function validShopStock(value: unknown): value is number | null {
  return value === null || (typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 && value <= MAX_STOCK);
}

function shopItem(value: unknown): value is AdminShopItem {
  if (!record(value) || typeof value.id !== 'string' || !UUID.test(value.id) ||
    typeof value.code !== 'string' || value.code.trim().length === 0 ||
    typeof value.name !== 'string' || value.name.trim().length === 0 ||
    typeof value.description !== 'string' || typeof value.category !== 'string' || !value.category.trim() ||
    !validShopPrice(value.base_price) || typeof value.rarity !== 'string' ||
    !validShopStock(value.max_stock) || !validShopStock(value.current_stock) ||
    typeof value.is_limited !== 'boolean' || typeof value.active !== 'boolean' ||
    typeof value.purchase_limit !== 'string') return false;
  if (value.max_stock !== null && value.current_stock !== null && value.current_stock > value.max_stock) return false;
  return true;
}

/** A failed or malformed read is never equivalent to a verified empty catalog. */
export function parseShopCatalog(value: unknown): AdminShopItem[] | null {
  if (!record(value) || !Array.isArray(value.items) || !value.items.every(shopItem)) return null;
  const items: AdminShopItem[] = value.items;
  if (new Set(items.map((item) => item.id.toLowerCase())).size !== items.length ||
    new Set(items.map((item) => item.code.toLowerCase())).size !== items.length) return null;
  return items;
}
