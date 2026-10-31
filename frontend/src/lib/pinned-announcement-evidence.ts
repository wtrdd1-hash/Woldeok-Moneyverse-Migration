/** The public SQL read is bounded to 20 published rows; a gateway must not turn a stale 200 into verified results. */
export function verifiedPublishedAnnouncements(value: unknown, pinnedOnly: boolean): boolean {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const announcements = (value as { announcements?: unknown }).announcements;
  if (!Array.isArray(announcements) || announcements.length > 20) return false;
  const seen = new Set<string>();
  for (const row of announcements) {
    if (!row || typeof row !== 'object' || Array.isArray(row)) return false;
    const item = row as Record<string, unknown>;
    if (
      typeof item.announcementId !== 'string' ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        item.announcementId,
      ) ||
      seen.has(item.announcementId)
    )
      return false;
    seen.add(item.announcementId);
    if (
      typeof item.title !== 'string' ||
      !item.title.trim() ||
      item.title.length > 160 ||
      typeof item.body !== 'string' ||
      !item.body.trim() ||
      item.body.length > 12_000 ||
      typeof item.isPinned !== 'boolean' ||
      (pinnedOnly && !item.isPinned)
    )
      return false;
    if (
      item.imageUrl !== null &&
      (typeof item.imageUrl !== 'string' || !item.imageUrl.startsWith('/media/'))
    )
      return false;
    if (item.imageAltText !== null && typeof item.imageAltText !== 'string') return false;
    if (
      item.publishedAt !== null &&
      (typeof item.publishedAt !== 'string' || !Number.isFinite(Date.parse(item.publishedAt)))
    )
      return false;
  }
  return true;
}
