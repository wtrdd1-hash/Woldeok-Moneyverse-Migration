/** Validate an optional member sort without silently accepting ambiguous query values. */
export type SeasonCostSort = 'default' | 'cost_asc' | 'cost_desc';
export function parseSeasonCostSort(value: unknown): SeasonCostSort | null {
  if (value === undefined) return 'default';
  return value === 'cost_asc' || value === 'cost_desc' ? value : null;
}

export interface VerifiedSeasonEvent {
  readonly event_id: string;
  readonly season_id: string;
  readonly season_name: string;
  readonly title: string;
  readonly description: string;
  readonly cost_wld: string;
  readonly points_per_entry: number;
  readonly ends_at: string | null;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_WLD = 9223372036854775807n;

/** A stale backend can ignore sort while returning 200; reject that response at the edge. */
export function verifiedSeasonCostEvents(payload: unknown, sort: SeasonCostSort): VerifiedSeasonEvent[] | null {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return null;
  const events = (payload as { events?: unknown }).events;
  if (!Array.isArray(events) || events.length > 500) return null;
  const verified: VerifiedSeasonEvent[] = [];
  const ids = new Set<string>();
  let previous: bigint | null = null;
  for (const value of events) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
    const event = value as Record<string, unknown>;
    if (typeof event.event_id !== 'string' || !UUID.test(event.event_id) || ids.has(event.event_id) ||
        typeof event.season_id !== 'string' || !UUID.test(event.season_id) ||
        typeof event.season_name !== 'string' || event.season_name.length > 200 ||
        typeof event.title !== 'string' || event.title.length > 300 ||
        typeof event.description !== 'string' || event.description.length > 5000 ||
        typeof event.points_per_entry !== 'number' || !Number.isSafeInteger(event.points_per_entry) || event.points_per_entry < 0 ||
        typeof event.cost_wld !== 'string' || !/^(0|[1-9]\d{0,18})$/.test(event.cost_wld) ||
        (event.ends_at !== null && (typeof event.ends_at !== 'string' || !Number.isFinite(Date.parse(event.ends_at))))) return null;
    const amount = BigInt(event.cost_wld);
    if (amount > MAX_WLD ||
        (previous !== null && ((sort === 'cost_asc' && amount < previous) || (sort === 'cost_desc' && amount > previous)))) return null;
    ids.add(event.event_id);
    previous = amount;
    verified.push(event as unknown as VerifiedSeasonEvent);
  }
  return verified;
}
