import { BadRequestException } from '@nestjs/common';
import type { ShopHoldingRow } from './shop.repository';

export type ShopHoldingsStatus = 'all' | 'attention';

/** A strict query token prevents silent fallback to an unfiltered private shelf. */
export function parseShopHoldingsStatus(value: string | undefined): ShopHoldingsStatus {
  if (value === undefined || value === 'all') return 'all';
  if (value === 'attention') return 'attention';
  throw new BadRequestException('status must be all or attention');
}

/** The caller's rows have already been scoped by shop_my_items_v2(actor). */
export function filterShopHoldings(
  rows: readonly ShopHoldingRow[],
  status: ShopHoldingsStatus,
): ShopHoldingRow[] {
  if (status === 'all') return [...rows];
  // Invalid source values must not become a verified empty attention shelf.
  for (const row of rows) {
    if (typeof row.suspended !== 'boolean' ||
        !Number.isSafeInteger(row.unpaid_weeks) || (row.unpaid_weeks ?? -1) < 0 ||
        typeof row.arrears_due !== 'string' ||
        !/^(0|[1-9][0-9]{0,39})$/.test(row.arrears_due)) {
      throw new Error('invalid owner holdings attention source');
    }
  }
  return rows.filter((row) =>
    row.suspended === true || (row.unpaid_weeks ?? 0) > 0 || BigInt(row.arrears_due!) > 0n,
  );
}
