import { BadRequestException } from '@nestjs/common';
import type { ShopHoldingRow } from './shop.repository';

export type ShopHoldingsStatus = 'all' | 'attention';

/** A strict query token prevents silent fallback to an unfiltered private shelf. */
export function parseShopHoldingsStatus(value: unknown): ShopHoldingsStatus {
  if (value === undefined || value === 'all') return 'all';
  if (value === 'attention') return 'attention';
  throw new BadRequestException('filter must be all or attention');
}

/** The caller's rows have already been scoped by shop_my_items_v2(actor). */
export function filterShopHoldings(
  rows: readonly ShopHoldingRow[],
  status: ShopHoldingsStatus,
): ShopHoldingRow[] {
  if (status === 'all') return [...rows];
  return rows.filter(
    (row) =>
      row.suspended === true ||
      (row.unpaid_weeks ?? 0) > 0 ||
      (typeof row.arrears_due === 'string' &&
        /^\d+$/.test(row.arrears_due) &&
        BigInt(row.arrears_due) > 0n),
  );
}
