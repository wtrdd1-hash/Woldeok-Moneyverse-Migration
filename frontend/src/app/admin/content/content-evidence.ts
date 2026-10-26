import type { AdminAnnouncementItem, AdminPhotoItem, PendingPhotoItem } from './content-forms';

// JSON and HTTP status do not validate an administrator's evidence. All three
// lists are owner/operator-scoped NestJS/PostgreSQL read models; reject a bad
// snapshot rather than presenting it as a genuine empty moderation queue.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const record = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const string = (value: unknown): value is string => typeof value === 'string';
const nonempty = (value: unknown): value is string => string(value) && value.trim().length > 0;
const date = (value: unknown): value is string =>
  string(value) && /^\d{4}-\d\d-\d\dT/.test(value) && Number.isFinite(Date.parse(value));
const uuid = (value: unknown): value is string => string(value) && UUID.test(value);
const photoUrl = (value: unknown): value is string =>
  nonempty(value) && ((value.startsWith('/') && !value.startsWith('//') && !value.startsWith('/\\')) ||
    /^https?:\/\/[^\s]+$/i.test(value));

function parseList<T>(value: unknown, guard: (item: unknown) => item is T, key: (item: T) => string): T[] | null {
  if (!Array.isArray(value) || !value.every(guard)) return null;
  const ids = value.map(key);
  return new Set(ids).size === ids.length ? value : null;
}

function isPendingPhoto(value: unknown): value is PendingPhotoItem {
  return record(value) && uuid(value.photo_id) && nonempty(value.storage_key) &&
    photoUrl(value.image_url) && string(value.alt_text) && uuid(value.uploaded_by) &&
    string(value.uploader_display_name) && date(value.submitted_at);
}
function isAdminPhoto(value: unknown): value is AdminPhotoItem {
  return isPendingPhoto(value) && record(value) &&
    (value.content_state === 'draft' || value.content_state === 'published') &&
    (value.published_at === null || date(value.published_at));
}
function isAnnouncement(value: unknown): value is AdminAnnouncementItem {
  return record(value) && uuid(value.announcementId) && nonempty(value.title) &&
    string(value.body) && (value.contentState === 'draft' || value.contentState === 'published') &&
    typeof value.isPinned === 'boolean' && (value.publishedAt === null || date(value.publishedAt)) &&
    date(value.createdAt) && date(value.updatedAt);
}

export function parsePendingPhotos(value: unknown): PendingPhotoItem[] | null {
  return parseList(value, isPendingPhoto, (item) => item.photo_id);
}
export function parseAdminPhotos(value: unknown): AdminPhotoItem[] | null {
  return parseList(value, isAdminPhoto, (item) => item.photo_id);
}
export function parseAdminAnnouncements(value: unknown): AdminAnnouncementItem[] | null {
  const items = record(value) ? value.announcements : value;
  return parseList(items, isAnnouncement, (item) => item.announcementId);
}
