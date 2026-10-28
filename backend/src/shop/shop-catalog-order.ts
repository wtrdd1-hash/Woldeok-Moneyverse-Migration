import { BadRequestException } from '@nestjs/common';

export type ShopPriceOrder = 'default' | 'price_asc' | 'price_desc';

export function parseShopPriceOrder(raw?: string): ShopPriceOrder {
  if (raw === undefined) return 'default';
  if (raw === 'price_asc' || raw === 'price_desc') return raw;
  throw new BadRequestException('sort must be price_asc or price_desc');
}

interface PricedShopItem {
  readonly price: string;
  readonly code: string;
  readonly catalog_id: string;
}

function exactPrice(value: string): bigint {
  if (typeof value !== 'string' || !/^(0|[1-9]\d*)$/.test(value)) {
    throw new Error('database returned a noncanonical catalogue price');
  }
  return BigInt(value);
}

export function orderShopCatalog<T extends PricedShopItem>(items: readonly T[], order: ShopPriceOrder): T[] {
  if (order === 'default') return [...items];
  const priced = items.map((item) => ({ item, amount: exactPrice(item.price) }));
  priced.sort((left, right) => {
    if (left.amount !== right.amount) {
      const less = left.amount < right.amount ? -1 : 1;
      return order === 'price_asc' ? less : -less;
    }
    if (left.item.code !== right.item.code) return left.item.code < right.item.code ? -1 : 1;
    return left.item.catalog_id < right.item.catalog_id ? -1 : left.item.catalog_id > right.item.catalog_id ? 1 : 0;
  });
  return priced.map(({ item }) => item);
}
