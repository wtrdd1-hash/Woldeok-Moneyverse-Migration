import { BadRequestException } from '@nestjs/common';

/** The exact persisted rarity CHECK values from migration 114. */
export const SHOP_RARITY_VALUES = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'] as const;
const RARITIES = new Set<string>(SHOP_RARITY_VALUES);

export function parseShopRarity(value: unknown): string | null {
  if (value === undefined || value === '') return null;
  if (typeof value !== 'string' || !RARITIES.has(value)) {
    throw new BadRequestException('rarity must be one of common, uncommon, rare, epic, legendary, mythic');
  }
  return value;
}

/** Filter only the rows returned by the actor-scoped database read function. */
export function filterCatalogRarity<T extends { readonly rarity: string }>(
  rows: readonly T[], rarity: string | null,
): T[] {
  return rarity === null ? [...rows] : rows.filter((row) => row.rarity === rarity);
}
