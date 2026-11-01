/**
 * Read-only, SQL-backed season events. Never promote a malformed successful
 * response to a verified empty calendar or a spendable WLD claim.
 */
export interface SeasonCalendarEvent {
  readonly event_id: string;
  readonly season_id: string;
  readonly season_name: string;
  readonly title: string;
  readonly description: string;
  readonly cost_wld: string;
  readonly points_per_entry: number;
  readonly ends_at: string;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const WLD = /^(0|[1-9][0-9]{0,29})$/;
const ISO_TIME = /^(\d{4})-(\d{2})-(\d{2})T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?(?:Z|[+-]\d{2}:\d{2})$/;

function isIsoDate(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const match = ISO_TIME.exec(value);
  if (!match || !Number.isFinite(Date.parse(value))) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const calendar = new Date(Date.UTC(year, month - 1, day));
  return calendar.getUTCFullYear() === year && calendar.getUTCMonth() === month - 1 &&
    calendar.getUTCDate() === day;
}

function text(value: unknown, max: number, allowEmpty = false): value is string {
  return typeof value === 'string' && value.length <= max && (allowEmpty || value.trim().length > 0);
}

export function parseSeasonCalendarEvents(value: unknown): readonly SeasonCalendarEvent[] | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const rows = (value as Record<string, unknown>).events;
  if (!Array.isArray(rows) || rows.length > 200) return null;
  const result: SeasonCalendarEvent[] = [];
  const seen = new Set<string>();
  for (const entry of rows) {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return null;
    const row = entry as Record<string, unknown>;
    if (typeof row.event_id !== 'string' || !UUID.test(row.event_id) ||
        typeof row.season_id !== 'string' || !UUID.test(row.season_id) ||
        seen.has(row.event_id.toLowerCase()) ||
        !text(row.season_name, 160) || !text(row.title, 200) ||
        !text(row.description, 5000, true) ||
        typeof row.cost_wld !== 'string' || !WLD.test(row.cost_wld) ||
        typeof row.points_per_entry !== 'number' || !Number.isSafeInteger(row.points_per_entry) ||
        row.points_per_entry < 0 || !isIsoDate(row.ends_at)) return null;
    seen.add(row.event_id.toLowerCase());
    result.push({
      event_id: row.event_id,
      season_id: row.season_id,
      season_name: row.season_name,
      title: row.title,
      description: row.description,
      cost_wld: row.cost_wld,
      points_per_entry: row.points_per_entry,
      ends_at: row.ends_at,
    });
  }
  return result;
}
