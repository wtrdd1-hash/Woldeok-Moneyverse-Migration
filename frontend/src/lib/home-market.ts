export interface HomeStockQuote {
  readonly symbol: string;
  readonly name: string;
  readonly current_price: string;
  readonly day_open_price: string;
}

export interface HomeTopMover extends HomeStockQuote {
  readonly cur: number;
  readonly open: number;
  readonly diff: number;
  readonly pct: number;
}

function safePrice(value: string): number | null {
  if (!/^\d+$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed >= 0 ? parsed : null;
}

/** An unavailable or malformed quote is never replaced by a fabricated live quote. */
export function selectTopMovers(quotes: readonly HomeStockQuote[] | null): HomeTopMover[] {
  if (!quotes?.length) return [];

  return quotes
    .flatMap((quote) => {
      const cur = safePrice(quote.current_price);
      const open = safePrice(quote.day_open_price);
      if (cur === null || open === null || open <= 0) return [];
      const diff = cur - open;
      const pct = (diff / open) * 100;
      if (!Number.isFinite(pct)) return [];
      return [{ ...quote, cur, open, diff, pct }];
    })
    .sort((a, b) => Math.abs(b.pct) - Math.abs(a.pct))
    .slice(0, 4);
}
