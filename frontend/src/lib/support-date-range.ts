export interface SupportDateRange {
  readonly fromUtc: string;
  readonly toUtcExclusive: string;
}

export function parseSupportDateRange(from: unknown, to: unknown): SupportDateRange | null {
  const validDay = (value: unknown): number | null => {
    if (typeof value !== 'string' || !/^20\d\d-(0[1-9]|1[0-2])-([0-2]\d|3[01])$/.test(value)) return null;
    const day = Date.parse(`${value}T00:00:00Z`);
    return Number.isFinite(day) && new Date(day).toISOString().slice(0, 10) === value ? day : null;
  };
  const first = validDay(from);
  const last = validDay(to);
  if (first === null || last === null || first > last || (last - first) / 86_400_000 >= 366) return null;
  return { fromUtc: new Date(first - 9 * 3_600_000).toISOString(),
    toUtcExclusive: new Date(last + 86_400_000 - 9 * 3_600_000).toISOString() };
}

export function isVerifiedSupportDateRows(payload: unknown, range: SupportDateRange, status: string | null, q: string | null, sort: string | null): boolean {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return false;
  const rows = (payload as { threads?: unknown }).threads;
  if (!Array.isArray(rows) || rows.length > 50) return false;
  const ids = new Set<string>();
  let previous = sort === 'oldest' ? -Infinity : Infinity;
  for (const row of rows) {
    if (!row || typeof row !== 'object' || Array.isArray(row)) return false;
    const item = row as Record<string, unknown>;
    if (typeof item.thread_id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(item.thread_id) || ids.has(item.thread_id)) return false;
    if (typeof item.subject !== 'string' || item.subject.length > 120 ||
      !['open', 'waiting_user', 'resolved'].includes(String(item.status))) return false;
    if (typeof item.last_message_at !== 'string' || !/^\d{4}-\d{2}-\d{2}T/.test(item.last_message_at)) return false;
    const time = Date.parse(item.last_message_at);
    if (!Number.isFinite(time) || time < Date.parse(range.fromUtc) || time >= Date.parse(range.toUtcExclusive)) return false;
    if (sort === 'oldest' ? time < previous : time > previous) return false;
    if (status && item.status !== status) return false;
    if (q && !item.subject.toLocaleLowerCase().includes(q.toLocaleLowerCase())) return false;
    previous = time;
    ids.add(item.thread_id);
  }
  return true;
}
