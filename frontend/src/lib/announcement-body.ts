/** Parse the only supported filter, preserving invalid vs absent. */
export function parseAnnouncementBodyFilter(query: URLSearchParams): { body: string | null } | null {
  if ([...query.keys()].some((key) => key !== 'body')) return null;
  const values = query.getAll('body');
  if (values.length === 0) return { body: null };
  if (values.length !== 1) return null;
  const body = values[0]!;
  if (!body.trim() || body.trim().length > 80 || /[<>\u0000-\u001f\u007f]/.test(body)) return null;
  return { body: body.trim() };
}

/** Android cannot trust a 200 from an older backend that ignores the filter. */
export function verifiedAnnouncementBody(payload: unknown, body: string): boolean {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return false;
  const rows = (payload as { announcements?: unknown }).announcements;
  if (!Array.isArray(rows) || rows.length > 20) return false;
  const ids = new Set<string>();
  const needle = body.toLocaleLowerCase('ko-KR');
  for (const row of rows) {
    if (!row || typeof row !== 'object' || Array.isArray(row)) return false;
    const notice = row as Record<string, unknown>;
    if (typeof notice.announcementId !== 'string' ||
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(notice.announcementId) ||
        ids.has(notice.announcementId) ||
        typeof notice.body !== 'string' || notice.body.length > 12_000 ||
        !notice.body.toLocaleLowerCase('ko-KR').includes(needle)) return false;
    ids.add(notice.announcementId);
  }
  return true;
}
