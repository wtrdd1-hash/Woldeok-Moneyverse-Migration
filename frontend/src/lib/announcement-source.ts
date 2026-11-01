/**
 * Public announcement snapshot proof. The database's SECURITY DEFINER read
 * is authoritative; an HTTP 200 or an empty array alone is not evidence.
 */
export interface VerifiedAnnouncement {
  readonly announcementId: string;
  readonly title: string;
  readonly body: string;
  readonly imageUrl: string | null;
  readonly imageAltText: string | null;
  readonly isPinned: boolean;
  readonly publishedAt: string | null;
}

export interface VerifiedAnnouncementSnapshot {
  readonly sourceStatus: 'VERIFIED';
  readonly count: number;
  readonly announcements: VerifiedAnnouncement[];
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isAnnouncement(value: unknown): value is VerifiedAnnouncement {
  if (!isRecord(value)) return false;
  return typeof value.announcementId === 'string' && UUID.test(value.announcementId) &&
    typeof value.title === 'string' && value.title.trim().length > 0 && value.title.length <= 160 &&
    typeof value.body === 'string' && value.body.trim().length > 0 && value.body.length <= 12_000 &&
    typeof value.isPinned === 'boolean' &&
    (value.imageUrl === null || (typeof value.imageUrl === 'string' &&
      /^\/media\/[a-zA-Z0-9._/-]+$/.test(value.imageUrl) && !value.imageUrl.includes('..'))) &&
    (value.imageAltText === null || (typeof value.imageAltText === 'string' && value.imageAltText.length <= 300)) &&
    (value.publishedAt === null || (typeof value.publishedAt === 'string' &&
      /^\d{4}-\d{2}-\d{2}T/.test(value.publishedAt) && Number.isFinite(Date.parse(value.publishedAt))));
}

export function parseVerifiedAnnouncements(value: unknown): VerifiedAnnouncementSnapshot | null {
  if (!isRecord(value) || value.sourceStatus !== 'VERIFIED' ||
    !Array.isArray(value.announcements) || value.announcements.length > 20 ||
    value.count !== value.announcements.length ||
    !value.announcements.every(isAnnouncement)) return null;
  const announcements = value.announcements as VerifiedAnnouncement[];
  if (new Set(announcements.map(row => row.announcementId.toLowerCase())).size !== announcements.length) return null;
  return {sourceStatus:'VERIFIED',count:announcements.length,announcements};
}
