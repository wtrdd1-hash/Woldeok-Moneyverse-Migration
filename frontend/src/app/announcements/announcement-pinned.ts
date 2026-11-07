export function announcementFeedPath(pinnedOnly: boolean): string {
  return pinnedOnly ? '/api/v1/announcements?pinnedOnly=1' : '/api/v1/announcements';
}

export function isVerifiedPinnedAnnouncementResponse(value: unknown): boolean {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const rows = (value as { announcements?: unknown }).announcements;
  return Array.isArray(rows) && rows.length <= 20 && rows.every((row) =>
    row !== null && typeof row === 'object' && !Array.isArray(row) &&
    typeof (row as { announcementId?: unknown }).announcementId === 'string' &&
    (row as { isPinned?: unknown }).isPinned === true
  );
}
