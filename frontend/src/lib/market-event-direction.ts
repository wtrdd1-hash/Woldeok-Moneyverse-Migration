/** Public, read-only market event direction filter shared by Next and Android. */
export type MarketEventDirection = 'up' | 'down';

export function parseMarketEventDirection(value: string | null | undefined): MarketEventDirection | null {
  if (value === undefined || value === null) return null;
  if (value === 'up' || value === 'down') return value;
  throw new Error('Invalid market event direction');
}

export interface VerifiedMarketEvent {
  readonly id: string;
  readonly stock_id: string | null;
  readonly symbol: string | null;
  readonly name: string | null;
  readonly direction: MarketEventDirection;
  readonly strength: number;
  readonly headline: string;
  readonly body: string;
  readonly source: string;
  readonly starts_at: string;
  readonly ends_at: string;
}

export function verifiedMarketEvents(payload: unknown, direction: MarketEventDirection | null): readonly VerifiedMarketEvent[] | null {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return null;
  const envelope = payload as { events?: unknown; appliedDirection?: unknown };
  // A legacy backend may return an empty unfiltered list. Only an exact
  // source echo can certify that an empty filtered result was actually filtered.
  if (direction !== null && envelope.appliedDirection !== direction) return null;
  const rows = envelope.events;
  if (!Array.isArray(rows)) return null;
  const ids = new Set<string>();
  for (const row of rows) {
    if (!row || typeof row !== 'object' || Array.isArray(row)) return null;
    const item = row as Record<string, unknown>;
    if (typeof item.id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(item.id) || ids.has(item.id)) return null;
    if (item.direction !== 'up' && item.direction !== 'down') return null;
    if (direction !== null && item.direction !== direction) return null;
    if (!Number.isInteger(item.strength) || (item.strength as number) < 1 || (item.strength as number) > 3) return null;
    if (typeof item.headline !== 'string' || !item.headline.trim() || item.headline.length > 120 ||
        typeof item.body !== 'string' || typeof item.source !== 'string') return null;
    if (![item.stock_id, item.symbol, item.name].every((v) => v === null || typeof v === 'string')) return null;
    if (typeof item.starts_at !== 'string' || typeof item.ends_at !== 'string' ||
        !Number.isFinite(Date.parse(item.starts_at)) || !Number.isFinite(Date.parse(item.ends_at)) ||
        Date.parse(item.ends_at) <= Date.parse(item.starts_at)) return null;
    ids.add(item.id);
  }
  return rows as VerifiedMarketEvent[];
}
