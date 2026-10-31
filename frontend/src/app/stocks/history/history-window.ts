/** The DB authority caps stock_my_trades at 200; this is a recent window, not full history. */
export type StockHistoryWindow = 50 | 100 | 200;

export function normalizeStockHistoryWindow(value: unknown): StockHistoryWindow {
  if (value === '100') return 100;
  if (value === '200') return 200;
  return 50;
}

export function normalizeStockHistoryGrossFloor(value: unknown): string | null {
  return typeof value === 'string' && /^[1-9][0-9]{0,29}$/.test(value) ? value : null;
}

/** Only a bounded owner-only recent window is filtered; this is not all-time history. */
export function stockHistoryApiPath(window: StockHistoryWindow, minGross?: string): string {
  return `/api/v1/stocks/history?limit=${window}${minGross ? `&minGross=${encodeURIComponent(minGross)}` : ''}`;
}

export function isVerifiedStockHistoryGrossResponse(payload: unknown, minGross: string, limit: number): boolean {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload) ||
      !Array.isArray((payload as { trades?: unknown }).trades)) return false;
  const trades = (payload as { trades: unknown[] }).trades;
  if (trades.length > limit || !normalizeStockHistoryGrossFloor(minGross)) return false;
  const minimum = BigInt(minGross);
  const seen = new Set<string>();
  for (const raw of trades) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return false;
    const row = raw as Record<string, unknown>;
    if (typeof row.trade_id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(row.trade_id) || seen.has(row.trade_id) ||
        typeof row.symbol !== 'string' || !/^[A-Za-z0-9._-]{1,30}$/.test(row.symbol) ||
        (row.side !== 'buy' && row.side !== 'sell') ||
        typeof row.created_at !== 'string' || !Number.isFinite(Date.parse(row.created_at))) return false;
    seen.add(row.trade_id);
    for (const key of ['quantity', 'unit_price', 'gross_amount', 'tax_amount']) {
      if (typeof row[key] !== 'string' || !/^[0-9]+$/.test(row[key])) return false;
    }
    if (BigInt(row.gross_amount as string) < minimum || BigInt(row.quantity as string) === 0n) return false;
  }
  return true;
}
