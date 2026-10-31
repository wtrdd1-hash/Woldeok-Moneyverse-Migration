/** A season entry fee is PostgreSQL bigint WLD, never a JavaScript number. */
const MAX_WLD = 9223372036854775807n;
const CANONICAL = /^(0|[1-9][0-9]{0,18})$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function normalizeSeasonMaxCost(value: unknown): string | null {
  if (typeof value !== 'string' || !CANONICAL.test(value)) return null;
  return BigInt(value) <= MAX_WLD ? value : null;
}

export function filterSeasonEventsByCost<T extends { readonly cost_wld: unknown }>(
  events: readonly T[], maxCost: string,
): T[] | null {
  if (!Array.isArray(events) || normalizeSeasonMaxCost(maxCost) === null) return null;
  const max = BigInt(maxCost);
  const result: T[] = [];
  for (const event of events) {
    if (!event || normalizeSeasonMaxCost(event.cost_wld) === null) return null;
    if (BigInt(event.cost_wld as string) <= max) result.push(event);
  }
  return result;
}

/** A filtered Android/web 200 must echo its cap and prove each returned row. */
export function isVerifiedSeasonCostResponse(value: unknown, maxCost: string): boolean {
  if (normalizeSeasonMaxCost(maxCost) === null || !value || typeof value !== 'object' || Array.isArray(value)) return false;
  const payload = value as Record<string, unknown>;
  if (payload.maxCost !== maxCost || !Array.isArray(payload.events)) return false;
  const seen = new Set<string>();
  for (const raw of payload.events) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return false;
    const row = raw as Record<string, unknown>;
    if (typeof row.event_id !== 'string' || !UUID.test(row.event_id) || seen.has(row.event_id) ||
        typeof row.season_id !== 'string' || !UUID.test(row.season_id) ||
        typeof row.season_name !== 'string' || typeof row.title !== 'string' ||
        typeof row.description !== 'string' ||
        !Number.isSafeInteger(row.points_per_entry) || (row.points_per_entry as number) < 0 ||
        (row.ends_at !== null && (typeof row.ends_at !== 'string' || !Number.isFinite(Date.parse(row.ends_at))))) return false;
    seen.add(row.event_id);
  }
  return filterSeasonEventsByCost(payload.events, maxCost)?.length === payload.events.length;
}
