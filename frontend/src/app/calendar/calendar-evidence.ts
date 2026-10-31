import type { ShopDeadlineItem } from './shop-deadlines';

export interface CalendarSeasonEvent {
  readonly event_id: string;
  readonly season_id: string;
  readonly season_name: string;
  readonly title: string;
  readonly description: string;
  readonly cost_wld: string;
  readonly points_per_entry: number;
  readonly ends_at: string;
}

export interface CalendarTodayEvent {
  readonly event_date: string;
  readonly event_label: string;
  readonly event_detail: string;
  readonly claimed: boolean;
}

export interface CalendarWeeklyGoal {
  readonly goal_code: string;
  readonly goal_window: string;
  readonly week_start: string;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const WLD = /^(0|[1-9][0-9]*)$/;
const ISO_INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function text(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function nonnegativeWld(value: unknown): value is string {
  return typeof value === 'string' && WLD.test(value);
}

function instant(value: unknown): value is string {
  return typeof value === 'string' && ISO_INSTANT.test(value) && Number.isFinite(Date.parse(value));
}

function day(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().startsWith(`${value}T`);
}

function verifiedRows<T>(
  response: unknown,
  key: string,
  valid: (row: unknown) => row is T,
  id: (row: T) => string,
): readonly T[] | null {
  if (!record(response) || !Array.isArray(response[key])) return null;
  const rows: unknown[] = response[key];
  const identifiers = new Set<string>();
  const verified: T[] = [];
  for (const row of rows) {
    if (!valid(row)) return null;
    const identifier = id(row);
    if (identifiers.has(identifier)) return null;
    identifiers.add(identifier);
    verified.push(row);
  }
  return verified;
}

function season(value: unknown): value is CalendarSeasonEvent {
  return record(value) &&
    typeof value.event_id === 'string' && UUID.test(value.event_id) &&
    typeof value.season_id === 'string' && UUID.test(value.season_id) &&
    text(value.season_name) && text(value.title) && typeof value.description === 'string' &&
    nonnegativeWld(value.cost_wld) && Number.isSafeInteger(value.points_per_entry) &&
    (value.points_per_entry as number) >= 0 && instant(value.ends_at);
}

function shop(value: unknown): value is ShopDeadlineItem {
  return record(value) &&
    typeof value.catalog_id === 'string' && UUID.test(value.catalog_id) &&
    text(value.name) && text(value.category) && nonnegativeWld(value.price) &&
    (value.sale_ends_at === null || instant(value.sale_ends_at));
}

function weekly(value: unknown): value is CalendarWeeklyGoal {
  return record(value) && text(value.goal_code) &&
    (value.goal_window === 'week' || value.goal_window === 'lifetime') &&
    day(value.week_start);
}

export function verifyCalendarSeasons(response: unknown): readonly CalendarSeasonEvent[] | null {
  return verifiedRows(response, 'events', season, (row) => row.event_id);
}

export function verifyCalendarShop(response: unknown): readonly ShopDeadlineItem[] | null {
  return verifiedRows(response, 'catalogItems', shop, (row) => row.catalog_id);
}

export function verifyCalendarWeeklyGoals(response: unknown): readonly CalendarWeeklyGoal[] | null {
  return verifiedRows(response, 'goals', weekly, (row) => row.goal_code);
}

/** Undefined means the source is unavailable; null is a verified empty event. */
export function verifyCalendarToday(response: unknown): CalendarTodayEvent | null | undefined {
  if (!record(response) || !Object.hasOwn(response, 'event')) return undefined;
  if (response.event === null) return null;
  const value = response.event;
  if (!record(value) || !day(value.event_date) || !text(value.event_label) ||
      typeof value.event_detail !== 'string' || typeof value.claimed !== 'boolean') {
    return undefined;
  }
  return value as unknown as CalendarTodayEvent;
}
