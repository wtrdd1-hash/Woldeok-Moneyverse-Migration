import { BadRequestException } from '@nestjs/common';

const MAX_AMOUNT = 9223372036854775807n;

export function parseShopMinimumPrice(value: unknown): bigint | null {
  if (value === undefined) return null;
  if (typeof value !== 'string' || !/^(0|[1-9][0-9]{0,18})$/.test(value)) {
    throw new BadRequestException('minPrice must be a canonical non-negative WLD integer');
  }
  const amount = BigInt(value);
  if (amount > MAX_AMOUNT) throw new BadRequestException('minPrice exceeds the WLD amount range');
  return amount;
}

export function filterShopMinimumPrice<T extends { readonly price: string }>(items: readonly T[], minimum: bigint | null): T[] {
  if (minimum === null) return [...items];
  return items.filter((item) => {
    if (typeof item.price !== 'string' || !/^(0|[1-9][0-9]*)$/.test(item.price)) {
      throw new Error('database returned an invalid shop price');
    }
    return BigInt(item.price) >= minimum;
  });
}
