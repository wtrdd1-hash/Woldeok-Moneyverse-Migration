/** Query and response boundaries for the privileged, read-only activity log view. */
export interface ActivityLogRow {
  readonly id: string;
  readonly user_id: string | null;
  readonly username: string;
  readonly session_id: string | null;
  readonly event_type: string;
  readonly path: string;
  readonly target_label: string | null;
  readonly dwell_time_ms: number | null;
  readonly ip: string | null;
  readonly user_agent: string | null;
  readonly metadata: Record<string, unknown>;
  readonly created_at: string;
}

type SearchParams = Record<string, string | string[] | undefined>;
type Granularity = 'day' | 'month' | 'year';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EVENT_TYPES = new Set(['page_view', 'page_dwell', 'button_click', 'api_request', 'admin_request']);
const PAGE_MAX = 1000;

export function parseActivityQuery(params: SearchParams) {
  const granularity: Granularity = params.granularity === 'month' || params.granularity === 'year'
    ? params.granularity : 'day';
  const periods = granularity === 'day' ? 30 : granularity === 'month' ? 24 : 10;
  const limit = params.limit === '30' ? 30 : params.limit === '100' ? 100 : 50;
  const pageText = typeof params.page === 'string' ? params.page : '1';
  const pageNumber = /^[1-9][0-9]{0,3}$/.test(pageText) ? Number(pageText) : 1;
  const page = pageNumber <= PAGE_MAX ? pageNumber : 1;
  const rawEvent = params.eventType;
  const eventType = typeof rawEvent === 'string' && EVENT_TYPES.has(rawEvent) ? rawEvent : '';
  const invalidEventType = rawEvent !== undefined && rawEvent !== '' && eventType === '';
  const userValue = params.userId ?? params.userSearch;
  // Invalid array or oversized filters must never silently become an unfiltered query.
  const rawUser = typeof userValue === 'string' ? userValue.trim() : userValue === undefined ? '' : '[invalid member filter]';
  return { granularity, periods, eventType, invalidEventType, limit, page,
    offset: (page - 1) * limit, rawUser };
}

interface Member { readonly user_id: string; readonly display_name: string }
export type MemberFilter =
  | { readonly status: 'all' | 'unavailable' | 'not_found' | 'ambiguous' }
  | { readonly status: 'resolved'; readonly userId: string };

function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function resolveActivityMember(raw: string, directory: unknown): MemberFilter {
  const input = raw.trim();
  if (!input) return { status: 'all' };
  if (UUID.test(input)) return { status: 'resolved', userId: input.toLowerCase() };
  if (input.length > 80 || !Array.isArray(directory)) return { status: 'unavailable' };
  if (!directory.every((u): u is Member => record(u) &&
    typeof u.display_name === 'string' && typeof u.user_id === 'string' && UUID.test(u.user_id))) {
    return { status: 'unavailable' };
  }
  const normalized = input.toLowerCase();
  const exact = directory.filter((u) => u.display_name.toLowerCase() === normalized);
  const matches: Member[] = exact.length ? exact : directory.filter((u) => u.display_name.toLowerCase().includes(normalized));
  const ids = [...new Set(matches.map((u) => u.user_id.toLowerCase()))];
  if (ids.length === 0) return { status: 'not_found' };
  if (ids.length > 1) return { status: 'ambiguous' };
  return { status: 'resolved', userId: ids[0]! };
}

export function parseActivityLogs(value: unknown, limit: number): ActivityLogRow[] | null {
  if (!Array.isArray(value) || value.length > limit) return null;
  const seen = new Set<string>();
  const parsed: ActivityLogRow[] = [];
  for (const entry of value) {
    if (!record(entry) || typeof entry.id !== 'string' || !/^[1-9][0-9]*$/.test(entry.id) ||
      seen.has(entry.id) || (entry.user_id !== null && (typeof entry.user_id !== 'string' || !UUID.test(entry.user_id))) ||
      typeof entry.username !== 'string' || (entry.session_id !== null && typeof entry.session_id !== 'string') ||
      typeof entry.event_type !== 'string' || typeof entry.path !== 'string' ||
      (entry.target_label !== null && typeof entry.target_label !== 'string') ||
      (entry.dwell_time_ms !== null && (!Number.isSafeInteger(entry.dwell_time_ms) || (entry.dwell_time_ms as number) < 0)) ||
      (entry.ip !== null && typeof entry.ip !== 'string') ||
      (entry.user_agent !== null && typeof entry.user_agent !== 'string') ||
      !record(entry.metadata) || typeof entry.created_at !== 'string' ||
      !Number.isFinite(Date.parse(entry.created_at))) return null;
    seen.add(entry.id);
    parsed.push(entry as unknown as ActivityLogRow);
  }
  return parsed;
}
