import { groupDigits } from '@/lib/money';

interface StockIdentity {
  readonly id: string;
  readonly symbol: string;
}

/**
 * Authoritative WLD values stay integer strings all the way to this helper.
 * BigInt keeps comparisons exact beyond Number.MAX_SAFE_INTEGER.
 */
export function signedDelta(current: string, open: string): string {
  const delta = BigInt(current) - BigInt(open);
  if (delta === 0n) return '0';
  const prefix = delta > 0n ? '+' : '-';
  const absolute = delta > 0n ? delta : -delta;
  return `${prefix}${groupDigits(absolute.toString())}`;
}


/**
 * Resolves symbols from stock-detail/other entry points against the current
 * authoritative market list. Unknown/duplicate values are ignored and the
 * comparison UI never preselects more than three stocks.
 */
export function initialComparisonIds(
  stocks: readonly StockIdentity[],
  symbols: readonly string[],
  maxSelected = 3,
): string[] {
  const normalized = symbols
    .map((symbol) => symbol.trim().toUpperCase())
    .filter(Boolean);
  if (normalized.length === 0) return stocks.slice(0, 2).map((stock) => stock.id);

  const bySymbol = new Map(stocks.map((stock) => [stock.symbol.toUpperCase(), stock.id]));
  const selected: string[] = [];
  for (const symbol of normalized) {
    const id = bySymbol.get(symbol);
    if (!id || selected.includes(id)) continue;
    selected.push(id);
    if (selected.length >= maxSelected) break;
  }
  return selected;
}

/**
 * Builds the canonical query used to share a stock comparison. Symbols are
 * resolved from the authoritative market list and emitted in selection order.
 */
export function comparisonSymbolsQuery(
  stocks: readonly StockIdentity[],
  selectedIds: readonly string[],
  maxSelected = 3,
): string {
  const byId = new Map(stocks.map((stock) => [stock.id, stock.symbol.trim().toUpperCase()]));
  const symbols: string[] = [];
  for (const id of selectedIds) {
    const symbol = byId.get(id);
    if (!symbol || symbols.includes(symbol)) continue;
    symbols.push(symbol);
    if (symbols.length >= maxSelected) break;
  }
  return symbols.length > 0 ? `symbols=${encodeURIComponent(symbols.join(','))}` : '';
}
