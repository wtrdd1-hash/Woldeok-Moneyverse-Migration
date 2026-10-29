/** The DB authority caps stock_my_trades at 200; this is a recent window, not full history. */
export type StockHistoryWindow = 50 | 100 | 200;

export function normalizeStockHistoryWindow(value: unknown): StockHistoryWindow {
  if (value === '100') return 100;
  if (value === '200') return 200;
  return 50;
}

export function stockHistoryApiPath(window: StockHistoryWindow): string {
  return `/api/v1/stocks/history?limit=${window}`;
}
