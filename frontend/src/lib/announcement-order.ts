export type AnnouncementOrder = 'pinned' | 'newest' | 'oldest';

/** Keep Android and web requests on the same strict public query allowlist. */
export function parseAnnouncementOrder(query: URLSearchParams): AnnouncementOrder | null {
  if ([...query.keys()].some((key) => key !== 'sort')) return null;
  const values = query.getAll('sort');
  if (values.length === 0) return 'pinned';
  if (values.length !== 1) return null;
  return values[0] === 'pinned' || values[0] === 'newest' || values[0] === 'oldest' ? values[0] : null;
}

/** Fail closed if a stale backend ignores a requested sort on Android. */
export function verifiedAnnouncementOrder(payload: unknown, order: 'newest' | 'oldest'): boolean {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return false;
  const rows = (payload as { announcements?: unknown }).announcements;
  if (!Array.isArray(rows) || rows.length > 20) return false;
  let previous: { time: number; id: string } | null = null;
  const ids = new Set<string>();
  for (const row of rows) {
    if (!row || typeof row !== 'object' || Array.isArray(row)) return false;
    const notice = row as Record<string, unknown>;
    if (typeof notice.announcementId !== 'string' ||
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(notice.announcementId) ||
        ids.has(notice.announcementId)) return false;
    if (typeof notice.publishedAt !== 'string' ||
        !/^\d{4}-\d{2}-\d{2}T/.test(notice.publishedAt)) return false;
    const time = Date.parse(notice.publishedAt);
    if (!Number.isFinite(time)) return false;
    const id = notice.announcementId;
    if (previous && (order === 'oldest'
      ? time < previous.time || (time === previous.time && id.localeCompare(previous.id) < 0)
      : time > previous.time || (time === previous.time && id.localeCompare(previous.id) > 0))) return false;
    ids.add(id);
    previous = { time, id };
  }
  return true;
}
