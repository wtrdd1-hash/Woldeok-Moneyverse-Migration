/** Android public announcement search is bounded to the latest published rows.
 * This validates response shape and search parity, not independent publication authority.
 */
export function isVerifiedAnnouncementTitleSearch(payload: unknown, q: string | null, limit: number): boolean {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return false;
  const rows = (payload as { announcements?: unknown }).announcements;
  if (!Array.isArray(rows) || rows.length > limit) return false;
  const ids = new Set<string>();
  let lastPinned = true;
  let lastDate = Number.POSITIVE_INFINITY;
  let lastId = '';
  for (const raw of rows) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return false;
    const item = raw as Record<string, unknown>;
    if (typeof item.announcementId !== 'string' ||
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(item.announcementId) ||
        ids.has(item.announcementId)) return false;
    if (typeof item.title !== 'string' || item.title.length === 0 || item.title.length > 160 ||
        typeof item.body !== 'string' || item.body.length > 12000 ||
        typeof item.isPinned !== 'boolean' ||
        (item.imageUrl !== null && (typeof item.imageUrl !== 'string' || !/^\/media\/[a-zA-Z0-9._/-]+$/.test(item.imageUrl))) ||
        (item.imageAltText !== null && typeof item.imageAltText !== 'string')) return false;
    if (q !== null && !item.title.toLocaleLowerCase().includes(q.toLocaleLowerCase())) return false;
    if (item.isPinned && !lastPinned) return false;
    const when = typeof item.publishedAt === 'string' ? Date.parse(item.publishedAt) : NaN;
    if (!Number.isFinite(when)) return false;
    if (lastPinned === item.isPinned && (when > lastDate ||
        (when === lastDate && lastId && item.announcementId > lastId))) return false;
    lastPinned = item.isPinned;
    lastDate = when;
    lastId = item.announcementId;
    ids.add(item.announcementId);
  }
  return true;
}
