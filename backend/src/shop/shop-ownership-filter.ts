import { BadRequestException } from '@nestjs/common';

export type ShopOwnership = 'all' | 'owned' | 'unowned';

export function parseShopOwnership(value: unknown): ShopOwnership {
  if (value === undefined || value === 'all') return 'all';
  if (value === 'owned' || value === 'unowned') return value;
  throw new BadRequestException('ownership must be all, owned, or unowned');
}

/** The owner-scoped SECURITY DEFINER catalogue already returns this count. */
export function filterShopOwnership<T extends { readonly user_owned_quantity: unknown }>(
  items: readonly T[],
  ownership: ShopOwnership,
): T[] {
  if (ownership === 'all') return [...items];
  return items.filter((item) => {
    const count = item.user_owned_quantity;
    if (typeof count !== 'number' || !Number.isSafeInteger(count) || count < 0) {
      throw new Error('database returned an invalid shop ownership quantity');
    }
    return ownership === 'owned' ? count > 0 : count === 0;
  });
}
