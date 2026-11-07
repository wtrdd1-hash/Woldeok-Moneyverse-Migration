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

export interface VerifiedStockHistoryTrade {
  readonly trade_id: string;
  readonly symbol: string;
  readonly side: 'buy' | 'sell';
  readonly quantity: string;
  readonly unit_price: string;
  readonly gross_amount: string;
  readonly tax_amount: string;
  readonly created_at: string;
}

export interface VerifiedStockHistory {
  readonly trades: VerifiedStockHistoryTrade[];
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const NONNEGATIVE_WLD = /^(0|[1-9][0-9]{0,37})$/;

/** A successful HTTP response is not proof that owner trade rows are safe to render. */
export function parseVerifiedStockHistory(payload: unknown, limit: StockHistoryWindow, minGross?: string): VerifiedStockHistory | null {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload) ||
      !Array.isArray((payload as { trades?: unknown }).trades)) return null;
  if (minGross !== undefined && normalizeStockHistoryGrossFloor(minGross) === null) return null;
  const trades = (payload as { trades: unknown[] }).trades;
  if (trades.length > limit) return null;
  const seen = new Set<string>();
  const verified: VerifiedStockHistoryTrade[] = [];
  for (const raw of trades) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
    const row = raw as Record<string, unknown>;
    if (typeof row.trade_id !== 'string' || !UUID.test(row.trade_id) || seen.has(row.trade_id.toLowerCase()) ||
        typeof row.symbol !== 'string' || !/^[A-Za-z0-9._-]{1,30}$/.test(row.symbol) ||
        (row.side !== 'buy' && row.side !== 'sell') ||
        typeof row.created_at !== 'string' || !/^\d{4}-\d{2}-\d{2}T/.test(row.created_at) ||
        !Number.isFinite(Date.parse(row.created_at))) return null;
    seen.add(row.trade_id.toLowerCase());
    for (const key of ['quantity', 'unit_price', 'gross_amount', 'tax_amount']) {
      if (typeof row[key] !== 'string' || !NONNEGATIVE_WLD.test(row[key])) return null;
    }
    if (BigInt(row.quantity as string) === 0n || BigInt(row.unit_price as string) === 0n ||
        BigInt(row.gross_amount as string) === 0n ||
        (minGross !== undefined && BigInt(row.gross_amount as string) < BigInt(minGross))) return null;
    verified.push(row as unknown as VerifiedStockHistoryTrade);
  }
  return { trades: verified };
}

/** Kept for existing Android gross-floor callers; all requests now share the parser. */
export function isVerifiedStockHistoryGrossResponse(payload: unknown, minGross: string, limit: number): boolean {
  return (limit === 50 || limit === 100 || limit === 200) &&
    parseVerifiedStockHistory(payload, limit, minGross) !== null;
}
