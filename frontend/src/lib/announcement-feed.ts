/**
 * A public feed is verified only when the payload is shaped like the published
 * Nest read model. An absent source is not a verified empty publication set.
 */
export interface PublicAnnouncement {
  readonly announcementId: string;
  readonly title: string;
  readonly body: string;
  readonly imageUrl: string | null;
  readonly imageAltText: string | null;
  readonly isPinned: boolean;
  readonly publishedAt: string | null;
}

export interface PublicAnnouncementFeed {
  readonly announcements: PublicAnnouncement[];
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MEDIA = /^\/media\/[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)*\.(?:png|jpe?g|webp)$/i;

function isPlainText(value: unknown, max: number): value is string {
  return typeof value === 'string' && value.length >= 1 && value.length <= max &&
    value === value.trim() && !/[\u0000-\u001f\u007f<>]/.test(value);
}

export function parsePublicAnnouncements(payload: unknown): PublicAnnouncementFeed | null {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return null;
  const announcements = (payload as { announcements?: unknown }).announcements;
  if (!Array.isArray(announcements) || announcements.length > 20) return null;

  const seen = new Set<string>();
  const verified: PublicAnnouncement[] = [];
  for (const item of announcements) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return null;
    const row = item as Record<string, unknown>;
    if (typeof row.announcementId !== 'string' || !UUID.test(row.announcementId) ||
        seen.has(row.announcementId.toLowerCase())) return null;
    seen.add(row.announcementId.toLowerCase());
    if (!isPlainText(row.title, 160) ||
        typeof row.body !== 'string' || row.body.trim().length < 1 ||
        row.body.length > 12_000 || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f<>]/.test(row.body) ||
        typeof row.isPinned !== 'boolean') return null;
    if (row.imageUrl !== null &&
        (typeof row.imageUrl !== 'string' || !MEDIA.test(row.imageUrl))) return null;
    if (row.imageAltText !== null && !isPlainText(row.imageAltText, 300)) return null;
    if (row.publishedAt !== null &&
        (typeof row.publishedAt !== 'string' || !/^\d{4}-\d{2}-\d{2}T/.test(row.publishedAt) ||
          !Number.isFinite(Date.parse(row.publishedAt)))) return null;
    // Never forward unexpected upstream fields (storage keys, editorial metadata).
    verified.push({
      announcementId: row.announcementId as string,
      title: row.title as string,
      body: row.body as string,
      imageUrl: row.imageUrl as string | null,
      imageAltText: row.imageAltText as string | null,
      isPinned: row.isPinned as boolean,
      publishedAt: row.publishedAt as string | null,
    });
  }
  return { announcements: verified };
}
