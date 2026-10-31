/** Search only the latest 20 published announcements, never an unbounded archive. */
export function normalizeAnnouncementSearch(raw: unknown): string | null {
  if (raw === undefined) return null;
  if (typeof raw !== 'string' || /[\u0000-\u001f\u007f]/u.test(raw)) {
    throw new Error('invalid announcement title query');
  }
  const normalized = raw.trim().normalize('NFC');
  if ([...normalized].length < 2 || [...normalized].length > 40) {
    throw new Error('announcement title query must be 2–40 characters');
  }
  return normalized;
}

export function announcementSearchMatches(title: unknown, q: string): boolean {
  return typeof title === 'string' &&
    title.normalize('NFC').toLocaleLowerCase('ko-KR').includes(q.toLocaleLowerCase('ko-KR'));
}

/** Reject a stale HTTP 200 that ignored the filter; an empty verified page is valid. */
export function announcementSearchResponseMatches(payload: unknown, q: string): boolean {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return false;
  const rows = (payload as { announcements?: unknown }).announcements;
  return Array.isArray(rows) && rows.length <= 20 &&
    rows.every((row: unknown) => row && typeof row === 'object' && !Array.isArray(row) &&
      announcementSearchMatches((row as { title?: unknown }).title, q));
}
