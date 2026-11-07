const MONTH = /^20[0-9]{2}-(0[1-9]|1[0-2])$/;
const PHOTO_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SEOUL_OFFSET_MS = 9 * 60 * 60 * 1000;

export function parseGalleryMonth(value: string | string[] | undefined): string | null | 'INVALID' {
  if (value === undefined) return null;
  return typeof value === 'string' && MONTH.test(value) ? value : 'INVALID';
}

/** Fail closed when a stale backend ignores the requested month. */
export function isVerifiedGalleryMonthResponse(payload: unknown, month: string): boolean {
  if (!MONTH.test(month) || !payload || typeof payload !== 'object' || Array.isArray(payload)) return false;
  const data = payload as Record<string, unknown>;
  if (data.month !== month || !Array.isArray(data.photos) || data.photos.length > 24) return false;
  const ids = new Set<string>();
  for (const raw of data.photos) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return false;
    const photo = raw as Record<string, unknown>;
    if (typeof photo.photoId !== 'string' || !PHOTO_ID.test(photo.photoId) ||
        ids.has(photo.photoId.toLowerCase()) || typeof photo.imageUrl !== 'string' ||
        typeof photo.altText !== 'string' || typeof photo.publishedAt !== 'string' ||
        !/^\d{4}-\d{2}-\d{2}T/.test(photo.publishedAt)) return false;
    ids.add(photo.photoId.toLowerCase());
    const timestamp = Date.parse(photo.publishedAt);
    if (!Number.isFinite(timestamp) ||
        new Date(timestamp + SEOUL_OFFSET_MS).toISOString().slice(0, 7) !== month) return false;
  }
  return true;
}
