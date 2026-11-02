/** Only selects image-attached posts inside the backend's latest-50 public window. */
export function parseBoardImageFilter(value: unknown): { imageOnly: boolean; invalid: boolean } {
  if (value === undefined) return { imageOnly: false, invalid: false };
  if (value === '1') return { imageOnly: true, invalid: false };
  return { imageOnly: false, invalid: true };
}

/** Reject legacy success-shaped image-only responses, including unverifiable empty results. */
export function verifiedBoardImageResults(payload: unknown): boolean {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return false;
  const record = payload as Record<string, unknown>;
  if (record.imageFilter !== 'with' || !Array.isArray(record.posts) || record.posts.length > 50) return false;
  const seen = new Set<string>();
  for (const item of record.posts) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return false;
    const post = item as Record<string, unknown>;
    if (typeof post.postId !== 'string' ||
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(post.postId) ||
        seen.has(post.postId.toLowerCase()) ||
        typeof post.title !== 'string' || !post.title.trim() || post.hasImage !== true) return false;
    seen.add(post.postId.toLowerCase());
  }
  return true;
}
