import { BadRequestException } from '@nestjs/common';

const CANONICAL_UPKEEP = /^(0|[1-9][0-9]{0,29})$/;
const DATABASE_UPKEEP = /^(0|[1-9][0-9]*)$/;

/** Validate before reading the catalogue so invalid queries never hit PostgreSQL. */
export function parseShopUpkeepCap(maxUpkeep?: unknown): bigint | null {
  if (maxUpkeep === undefined || maxUpkeep === '') return null;
  if (typeof maxUpkeep !== 'string' || !CANONICAL_UPKEEP.test(maxUpkeep)) {
    throw new BadRequestException(
      'maxUpkeep must be a canonical nonnegative WLD integer (up to 30 digits)',
    );
  }
  return BigInt(maxUpkeep);
}

/** Apply a user-supplied weekly upkeep ceiling without losing bigint precision. */
export function filterShopUpkeep<T extends { readonly maintenance_cost?: unknown }>(
  items: readonly T[],
  maxUpkeep?: unknown,
): T[] {
  const ceiling = parseShopUpkeepCap(maxUpkeep);
  if (ceiling === null) return [...items];
  return items.filter((item) => {
    if (typeof item.maintenance_cost !== 'string' || !DATABASE_UPKEEP.test(item.maintenance_cost)) {
      throw new Error('database returned an invalid shop upkeep amount');
    }
    return BigInt(item.maintenance_cost) <= ceiling;
  });
}
