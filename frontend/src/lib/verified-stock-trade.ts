export interface VerifiedStockTrade {
  readonly id: string;
  readonly stockId: string;
  readonly price: string;
  readonly quantity: number;
  readonly side: 'BUY' | 'SELL';
  readonly timestamp: string;
}

const INTEGER_PRICE = /^\d{1,24}$/;

export function parseVerifiedStockTrade(payload: unknown): VerifiedStockTrade | null {
  if (!payload || typeof payload !== 'object') return null;
  const row = payload as Record<string, unknown>;
  if (typeof row.id !== 'string' || row.id.length === 0 || row.id.length > 128) return null;
  if (typeof row.stockId !== 'string' || row.stockId.length === 0 || row.stockId.length >= 64) return null;
  if (typeof row.price !== 'string' || !INTEGER_PRICE.test(row.price) || BigInt(row.price) === 0n) return null;
  if (typeof row.quantity !== 'number' || !Number.isSafeInteger(row.quantity) || row.quantity <= 0) return null;
  if (row.side !== 'BUY' && row.side !== 'SELL') return null;
  if (typeof row.timestamp !== 'string' || !/^\d{4}-\d{2}-\d{2}T/.test(row.timestamp)) return null;
  const time = Date.parse(row.timestamp);
  if (!Number.isFinite(time) || time > Date.now() + 5 * 60_000) return null;
  return {
    id: row.id,
    stockId: row.stockId,
    price: row.price,
    quantity: row.quantity,
    side: row.side,
    timestamp: row.timestamp,
  };
}

export function appendVerifiedStockTrade(
  current: readonly VerifiedStockTrade[],
  payload: unknown,
): readonly VerifiedStockTrade[] {
  const trade = parseVerifiedStockTrade(payload);
  if (!trade || current.some((row) => row.id === trade.id)) return current;
  return [trade, ...current.slice(0, 49)];
}
