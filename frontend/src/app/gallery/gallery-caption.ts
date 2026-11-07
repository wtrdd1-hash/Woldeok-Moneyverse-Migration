export function parseGalleryCaptionQuery(value: unknown): string | null {
  if (value === undefined) return '';
  if (typeof value !== 'string') return null;
  const caption = value.trim();
  if ([...caption].length < 2 || [...caption].length > 60 || /[\u0000-\u001F\u007F]/.test(caption)) return null;
  return caption;
}

export function isVerifiedCaptionGallery(payload: unknown, caption: string): boolean {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return false;
  const rows = (payload as { photos?: unknown }).photos;
  if (!Array.isArray(rows) || rows.length > 24 || !caption) return false;
  const seen = new Set<string>();
  return rows.every((row: unknown) => {
    if (!row || typeof row !== 'object' || Array.isArray(row)) return false;
    const photo = row as Record<string, unknown>;
    if (typeof photo.photoId !== 'string' || !photo.photoId || seen.has(photo.photoId)) return false;
    if (typeof photo.altText !== 'string' || typeof photo.imageUrl !== 'string' ||
        !(photo.publishedAt === null || typeof photo.publishedAt === 'string') ||
        !photo.altText.toLowerCase().includes(caption.toLowerCase())) return false;
    seen.add(photo.photoId);
    return true;
  });
}
