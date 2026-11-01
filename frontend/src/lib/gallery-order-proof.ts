export type GalleryOrder = 'newest' | 'oldest';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

export function verifiedGalleryOrder(payload: unknown, order: GalleryOrder): boolean {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return false;
  const photos = (payload as { photos?: unknown }).photos;
  if (!Array.isArray(photos) || photos.length > 24) return false;
  const ids = new Set<string>();
  let previous: { publishedAt: string; photoId: string } | null = null;
  for (const row of photos) {
    if (!row || typeof row !== 'object' || Array.isArray(row)) return false;
    const photo = row as Record<string, unknown>;
    if (typeof photo.photoId !== 'string' || !UUID.test(photo.photoId) || ids.has(photo.photoId) ||
        typeof photo.altText !== 'string' || photo.altText.length === 0 || photo.altText.length > 300 ||
        typeof photo.imageUrl !== 'string' || photo.imageUrl.length === 0 ||
        typeof photo.publishedAt !== 'string' || !ISO.test(photo.publishedAt) ||
        !Number.isFinite(Date.parse(photo.publishedAt))) return false;
    const current = { publishedAt: photo.publishedAt, photoId: photo.photoId };
    if (previous) {
      const date = previous.publishedAt.localeCompare(current.publishedAt);
      const comparison = date || previous.photoId.localeCompare(current.photoId);
      if (order === 'oldest' ? comparison > 0 : comparison < 0) return false;
    }
    ids.add(current.photoId);
    previous = current;
  }
  return true;
}
