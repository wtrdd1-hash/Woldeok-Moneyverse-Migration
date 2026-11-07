/** Valid Gregorian YYYY-MM-DD; filtering uses the Asia/Seoul publication day. */
export function parseGalleryDay(value: unknown): string | null {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value ? value : null;
}

/** The Android gateway must not present an ignored upstream filter as verified. */
export function isVerifiedGalleryDayResponse(payload: unknown, day: string): boolean {
  if (!parseGalleryDay(day) || !payload || typeof payload !== 'object' || Array.isArray(payload)) return false;
  const photos = (payload as { photos?: unknown }).photos;
  if (!Array.isArray(photos) || photos.length > 24) return false;
  const seen = new Set<string>();
  for (const photo of photos) {
    if (!photo || typeof photo !== 'object' || Array.isArray(photo)) return false;
    const row = photo as Record<string, unknown>;
    if (typeof row.photoId !== 'string' ||
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(row.photoId) ||
        seen.has(row.photoId)) return false;
    seen.add(row.photoId);
    if (typeof row.altText !== 'string' || row.altText.length < 1 || row.altText.length > 300) return false;
    if (typeof row.imageUrl !== 'string' ||
        !(/^\/media\/[0-9a-f-]{36}\.(png|jpg|webp)$/.test(row.imageUrl) ||
          /^https:\/\/[a-z0-9.-]+(?::443)?\/[^?#\s]*$/i.test(row.imageUrl))) return false;
    if (typeof row.publishedAt !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(row.publishedAt)) return false;
    const timestamp = Date.parse(row.publishedAt);
    if (!Number.isFinite(timestamp) ||
        new Date(timestamp + 9 * 60 * 60 * 1000).toISOString().slice(0, 10) !== day) return false;
  }
  return true;
}
