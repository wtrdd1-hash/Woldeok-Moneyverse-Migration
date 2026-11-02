/** A deterministic bytewise caption order for only the latest 24 approved photos. */
export function parseGallerySort(value: unknown): { sort: 'caption' | null; invalid: boolean } {
  if (value === undefined) return { sort: null, invalid: false };
  return value === 'caption'
    ? { sort: 'caption', invalid: false }
    : { sort: null, invalid: true };
}

const PHOTO_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MEDIA_URL = /^\/media\/[0-9a-f-]{36}\.(png|jpg|webp)$/;

/** Android must not accept a legacy 200 that silently ignores sort=caption. */
export function verifiedGalleryCaptionOrder(payload: unknown): boolean {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return false;
  const photos = (payload as { photos?: unknown }).photos;
  if (!Array.isArray(photos) || photos.length > 24) return false;
  const ids = new Set<string>();
  let previous: { caption: Buffer; id: string } | null = null;
  for (const photo of photos) {
    if (!photo || typeof photo !== 'object' || Array.isArray(photo)) return false;
    const row = photo as Record<string, unknown>;
    if (typeof row.photoId !== 'string' || !PHOTO_ID.test(row.photoId)) return false;
    const id = row.photoId.toLowerCase();
    if (ids.has(id)) return false;
    ids.add(id);
    if (typeof row.altText !== 'string' || row.altText.length < 1 || row.altText.length > 300 ||
        row.altText.trim() !== row.altText || /[<>\u0000-\u001f\u007f]/.test(row.altText)) return false;
    if (typeof row.imageUrl !== 'string' ||
        !(MEDIA_URL.test(row.imageUrl) || /^https:\/\/[a-z0-9.-]+\/[A-Za-z0-9._~%/@:+,;=!-]+$/i.test(row.imageUrl))) return false;
    if (row.publishedAt !== null && (typeof row.publishedAt !== 'string' ||
        !/^\d{4}-\d{2}-\d{2}T/.test(row.publishedAt) || !Number.isFinite(Date.parse(row.publishedAt)))) return false;
    const caption = Buffer.from(row.altText, 'utf8');
    if (previous) {
      const comparison = Buffer.compare(previous.caption, caption);
      if (comparison > 0 || (comparison === 0 && previous.id >= id)) return false;
    }
    previous = { caption, id };
  }
  return true;
}
