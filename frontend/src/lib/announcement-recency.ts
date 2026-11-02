export type AnnouncementRecency = '7d' | '30d';

export function parseAnnouncementRecencyQuery(value: unknown): AnnouncementRecency | null | 'invalid' {
  if (value === undefined) return null;
  return value === '7d' || value === '30d' ? value : 'invalid';
}

export function verifiedAnnouncementRecency(
  payload: unknown,
  recent: AnnouncementRecency,
  now = Date.now(),
): boolean {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return false;
  const record = payload as Record<string, unknown>;
  if (record.recentApplied !== recent || record.scope !== 'latest-20-published' ||
      typeof record.asOfUtc !== 'string' || !Array.isArray(record.announcements) ||
      record.announcements.length > 20) return false;
  const asOf = Date.parse(record.asOfUtc);
  if (!Number.isFinite(asOf) || Math.abs(now - asOf) > 300_000) return false;
  const cutoff = asOf - (recent === '7d' ? 7 : 30) * 86_400_000;
  const seen = new Set<string>();
  for (const item of record.announcements) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return false;
    const row = item as Record<string, unknown>;
    if (typeof row.announcementId !== 'string' ||
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(row.announcementId) ||
        seen.has(row.announcementId) || typeof row.title !== 'string' ||
        typeof row.publishedAt !== 'string') return false;
    const published = Date.parse(row.publishedAt);
    if (!Number.isFinite(published) || published < cutoff || published > asOf) return false;
    seen.add(row.announcementId);
  }
  return true;
}
