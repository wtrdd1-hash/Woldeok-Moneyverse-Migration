/** The stock listing is a reference-only read model, never a prediction-market ledger. */
export type StockPreview = Readonly<{ symbol: string; name: string; price: string }>;
export type PredictionSource = Readonly<{
  status: 'verified' | 'empty' | 'unavailable';
  stocks: readonly StockPreview[];
}>;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const WLD = /^(0|[1-9][0-9]{0,29})$/;

export function parseStockPreview(raw: unknown): PredictionSource {
  const unavailable: PredictionSource = { status: 'unavailable', stocks: [] };
  if (typeof raw !== 'object' || raw === null || !('stocks' in raw)) return unavailable;
  const stocks = raw.stocks;
  if (!Array.isArray(stocks) || stocks.length > 50) return unavailable;
  const seenIds = new Set<string>();
  const seenSymbols = new Set<string>();
  const parsed: StockPreview[] = [];
  for (const row of stocks) {
    if (!row || typeof row !== 'object' ||
      typeof row.id !== 'string' || !UUID.test(row.id) ||
      typeof row.symbol !== 'string' || !/^[A-Z0-9]{1,16}$/.test(row.symbol) ||
      typeof row.name !== 'string' || row.name.trim().length < 1 || row.name.length > 120 ||
      typeof row.current_price !== 'string' || !WLD.test(row.current_price) ||
      seenIds.has(row.id.toLowerCase()) || seenSymbols.has(row.symbol)) return unavailable;
    seenIds.add(row.id.toLowerCase());
    seenSymbols.add(row.symbol);
    parsed.push({ symbol: row.symbol, name: row.name, price: row.current_price });
  }
  return { status: parsed.length ? 'verified' : 'empty', stocks: parsed };
}
