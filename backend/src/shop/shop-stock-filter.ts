import { BadRequestException } from '@nestjs/common';

interface StockListing {
  readonly quantity: number | null;
}

// Stock is an optional presentation filter on the already-authorized database
// read model. The purchase function remains authoritative for availability.
export function filterCatalogByStock<T extends StockListing>(
  items: readonly T[],
  stock?: unknown,
): T[] {
  if (stock === undefined || stock === 'all') return [...items];
  if (stock !== 'available') {
    throw new BadRequestException('stock must be all or available');
  }
  return items.filter((item) => item.quantity === null || item.quantity > 0);
}
