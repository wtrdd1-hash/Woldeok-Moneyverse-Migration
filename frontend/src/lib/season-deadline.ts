/** Evidence for an optional read-only, authenticated seven-day season filter. */
export interface VerifiedSeasonDeadlineEvent {
  readonly event_id: string;
  readonly season_id: string;
  readonly season_name: string;
  readonly title: string;
  readonly description: string;
  readonly cost_wld: string;
  readonly points_per_entry: number;
  readonly ends_at: string;
}
export interface VerifiedSeasonDeadlinePayload {
  readonly events: readonly VerifiedSeasonDeadlineEvent[];
  readonly asOfUtc: string;
}
const TIMEZONE = /(?:Z|[+-]\d{2}:\d{2})$/;
const AMOUNT = /^(0|[1-9]\d*)$/;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
function timestamp(value: unknown): number | null {
  if (typeof value !== 'string' || !TIMEZONE.test(value)) return null;
  const result = Date.parse(value);
  return Number.isFinite(result) ? result : null;
}
export function verifiedSeasonDeadlinePayload(value: unknown, now = new Date()): VerifiedSeasonDeadlinePayload | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const raw = value as Record<string, unknown>;
  const asOf = timestamp(raw.asOfUtc);
  if (asOf === null || asOf > now.getTime() + 30_000 || asOf < now.getTime() - 15 * 60_000 || !Array.isArray(raw.events)) return null;
  const ids = new Set<string>();
  const events: VerifiedSeasonDeadlineEvent[] = [];
  let lastEnd = -Infinity;
  for (const candidate of raw.events) {
    if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) return null;
    const row = candidate as Record<string, unknown>;
    const end = timestamp(row.ends_at);
    if (typeof row.event_id !== 'string' || !row.event_id || ids.has(row.event_id) ||
        typeof row.season_id !== 'string' || !row.season_id ||
        typeof row.season_name !== 'string' || !row.season_name ||
        typeof row.title !== 'string' || !row.title ||
        typeof row.description !== 'string' ||
        typeof row.cost_wld !== 'string' || !AMOUNT.test(row.cost_wld) ||
        typeof row.points_per_entry !== 'number' || !Number.isSafeInteger(row.points_per_entry) || row.points_per_entry <= 0 ||
        end === null || end <= asOf || end > asOf + WEEK_MS || end < lastEnd) return null;
    ids.add(row.event_id);
    lastEnd = end;
    events.push(row as unknown as VerifiedSeasonDeadlineEvent);
  }
  return { events, asOfUtc: raw.asOfUtc as string };
}
