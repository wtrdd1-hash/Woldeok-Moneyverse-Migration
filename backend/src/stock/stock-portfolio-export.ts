import type { StockPortfolioRow } from './stock.repository';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const INTEGER = /^(0|[1-9][0-9]{0,37})$/;
const LABEL = /^[^\u0000-\u001f\u007f]{1,200}$/;

/** No silent truncation: reject incomplete/invalid data before claiming a snapshot. */
export function assertCurrentStockHoldings(rows: unknown): asserts rows is readonly StockPortfolioRow[] {
  if (!Array.isArray(rows) || rows.length > 100) throw new Error('stock holdings snapshot unavailable');
  for (const raw of rows) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error('invalid stock holding');
    const row = raw as Record<string, unknown>;
    if (typeof row['stock_id'] !== 'string' || !UUID.test(row['stock_id']) ||
        typeof row['symbol'] !== 'string' || row['symbol'].length > 32 || !LABEL.test(row['symbol']) ||
        typeof row['name'] !== 'string' || !LABEL.test(row['name']) ||
        typeof row['halt_status'] !== 'string' || !/^[A-Z_]{1,40}$/.test(row['halt_status']) ||
        !['quantity', 'average_cost', 'market_value', 'current_price'].every(
          (key) => typeof row[key] === 'string' && INTEGER.test(row[key]),
        )) throw new Error('unverified stock holding');
  }
}
