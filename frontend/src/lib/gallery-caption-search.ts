export function normalizeGalleryCaptionQuery(raw: unknown): string | null {
  if (raw === undefined) return null;
  if (typeof raw !== 'string') throw new Error('gallery query must be text');
  const query = raw.trim();
  if (Array.from(query).length < 2 || Array.from(query).length > 40 || /[<>\u0000-\u001f\u007f]/u.test(query)) throw new Error('invalid gallery query');
  return query;
}
export interface GalleryPhoto {
  readonly photoId: string;
  readonly imageUrl: string;
  readonly altText: string;
  readonly publishedAt: string | null;
}
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MEDIA = /^\/media\/[0-9a-f-]{36}\.(png|jpg|webp)$/i;
const HTTPS = /^https:\/\/(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9-]{2,63}(?::443)?\/[A-Za-z0-9._~%/@:+,;=!-]+$/;
export function parseGalleryCaptionSearch(payload: unknown, query: string): GalleryPhoto[] | null {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return null;
  const value = payload as Record<string, unknown>;
  if (value.query !== query || value.scope !== 'latest_24_published' || !Array.isArray(value.photos) || value.photos.length > 24) return null;
  const ids = new Set<string>();
  const needle = query.toLocaleLowerCase('ko-KR');
  const result: GalleryPhoto[] = [];
  for (const raw of value.photos) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
    const photo = raw as Record<string, unknown>;
    if (typeof photo.photoId !== 'string' || !UUID.test(photo.photoId) || ids.has(photo.photoId) ||
        typeof photo.altText !== 'string' || photo.altText.length < 1 || photo.altText.length > 300 ||
        !photo.altText.toLocaleLowerCase('ko-KR').includes(needle) ||
        typeof photo.imageUrl !== 'string' || !(MEDIA.test(photo.imageUrl) || HTTPS.test(photo.imageUrl)) ||
        !(photo.publishedAt === null || (typeof photo.publishedAt === 'string' && !Number.isNaN(Date.parse(photo.publishedAt)) && new Date(photo.publishedAt).toISOString() === photo.publishedAt))) return null;
    ids.add(photo.photoId); result.push(photo as unknown as GalleryPhoto);
  }
  return result;
}
