export interface GalleryPhoto {
  readonly photoId: string;
  readonly imageUrl: string;
  readonly altText: string;
  readonly publishedAt: string | null;
}

/** null means an invalid request; undefined means no search requested. */
export function normalizeGalleryQuery(raw: unknown): string | null | undefined {
  if (raw === undefined) return undefined;
  if (typeof raw !== 'string') return null;
  if (/[\u0000-\u001f\u007f]/u.test(raw)) return null;
  const query = raw.trim();
  if ([...query].length < 2 || [...query].length > 40 || /[\u0000-\u001f\u007f]/u.test(query)) return null;
  return query;
}

export function verifiedGallerySearch(payload: unknown, query: string): GalleryPhoto[] | null {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return null;
  const record = payload as Record<string, unknown>;
  if (record.searchScope !== 'latest_24' || record.searchApplied !== true ||
      !Array.isArray(record.photos) || record.photos.length > 24) return null;
  const seen = new Set<string>();
  const needle = query.toLocaleLowerCase('ko');
  for (const row of record.photos) {
    if (!row || typeof row !== 'object' || Array.isArray(row)) return null;
    const photo = row as Record<string, unknown>;
    if (typeof photo.photoId !== 'string' || !/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(photo.photoId) || seen.has(photo.photoId)) return null;
    seen.add(photo.photoId);
    if (typeof photo.altText !== 'string' || photo.altText.length < 1 || photo.altText.length > 300 ||
        !photo.altText.toLocaleLowerCase('ko').includes(needle)) return null;
    if (typeof photo.imageUrl !== 'string' ||
        !(photo.imageUrl.startsWith('https://') ||
          (photo.imageUrl.startsWith('/media/') && !photo.imageUrl.includes('..') && !photo.imageUrl.includes('\\')))) return null;
    if (photo.publishedAt !== null &&
        (typeof photo.publishedAt !== 'string' || !Number.isFinite(Date.parse(photo.publishedAt)))) return null;
  }
  return record.photos as GalleryPhoto[];
}
