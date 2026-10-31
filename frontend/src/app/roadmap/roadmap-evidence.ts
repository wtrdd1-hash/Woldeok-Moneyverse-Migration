/** A valid API envelope is not a guarantee that its market quotes are fresh. */
export type RoadmapMarketEvidence =
  | { readonly kind: 'available'; readonly count: number }
  | { readonly kind: 'unavailable' };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SYMBOL = /^[A-Z0-9._-]{1,16}$/;
const NATURAL = /^(0|[1-9]\d*)$/;
const UNAVAILABLE: RoadmapMarketEvidence = { kind: 'unavailable' };

export function parseRoadmapMarketEvidence(payload: unknown): RoadmapMarketEvidence {
  if (typeof payload !== 'object' || payload === null || Array.isArray(payload)) return UNAVAILABLE;
  const rows = (payload as Record<string, unknown>).stocks;
  if (!Array.isArray(rows) || rows.length > 500) return UNAVAILABLE;

  const ids = new Set<string>();
  const symbols = new Set<string>();
  for (const row of rows) {
    if (typeof row !== 'object' || row === null || Array.isArray(row)) return UNAVAILABLE;
    const item = row as Record<string, unknown>;
    if (typeof item.id !== 'string' || !UUID.test(item.id) ||
        typeof item.symbol !== 'string' || !SYMBOL.test(item.symbol) ||
        typeof item.name !== 'string' || item.name.trim().length === 0 || item.name.length > 200 ||
        typeof item.current_price !== 'string' || !NATURAL.test(item.current_price) || item.current_price === '0' ||
        typeof item.shares_available !== 'string' || !NATURAL.test(item.shares_available)) return UNAVAILABLE;
    const id = item.id.toLowerCase();
    if (ids.has(id) || symbols.has(item.symbol)) return UNAVAILABLE;
    ids.add(id);
    symbols.add(item.symbol);
  }
  return { kind: 'available', count: rows.length };
}
