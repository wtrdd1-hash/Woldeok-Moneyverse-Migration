/** The public notice filter is a Seoul calendar day, not a browser-local day. */
export function parseAnnouncementDay(value: unknown): string | null {
  if (typeof value !== 'string' || !/^20\d{2}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split('-').map(Number);
  const utcMidnight = Date.UTC(year!, month! - 1, day!);
  return Number.isFinite(utcMidnight) &&
    new Date(utcMidnight).toISOString().slice(0, 10) === value ? value : null;
}

export function isVerifiedAnnouncementDayResponse(payload: unknown, day: string): boolean {
  if (!parseAnnouncementDay(day) || !payload || typeof payload !== 'object' || Array.isArray(payload)) return false;
  const response = payload as { publicationDay?: unknown; announcements?: unknown };
  if (response.publicationDay !== day || !Array.isArray(response.announcements) || response.announcements.length > 20) return false;
  const [year, month, date] = day.split('-').map(Number);
  const from = Date.UTC(year!, month! - 1, date!) - 9 * 60 * 60 * 1000;
  const seen = new Set<string>();
  return response.announcements.every((entry: unknown) => {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return false;
    const row = entry as { announcementId?: unknown; publishedAt?: unknown; title?: unknown };
    if (typeof row.announcementId !== 'string' ||
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(row.announcementId) ||
        seen.has(row.announcementId) || typeof row.title !== 'string' ||
        typeof row.publishedAt !== 'string' ||
        !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(row.publishedAt)) return false;
    const time = Date.parse(row.publishedAt);
    if (!Number.isFinite(time) || time < from || time >= from + 86_400_000) return false;
    seen.add(row.announcementId);
    return true;
  });
}
