/** Updated ordering is restricted to the public latest-50 snapshot, not the full archive. */
export function parseBoardUpdateOrder(value: unknown): { order: 'updated' | null; invalid: boolean } {
  if (value === undefined || value === 'latest') return { order: null, invalid: false };
  return value === 'updated' ? { order: 'updated', invalid: false } : { order: null, invalid: true };
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

/** A 200 response must prove ordering, even when the latest snapshot is empty. */
export function isVerifiedBoardUpdateOrder(payload: unknown): boolean {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return false;
  const result = payload as { order?: unknown; posts?: unknown };
  if (result.order !== 'updated' || !Array.isArray(result.posts) || result.posts.length > 50) return false;
  const ids = new Set<string>();
  let previousActivity = Infinity;
  let previousCreated = Infinity;
  let previousId = '';
  for (const post of result.posts) {
    if (!post || typeof post !== 'object' || Array.isArray(post)) return false;
    const row = post as Record<string, unknown>;
    if (typeof row.postId !== 'string' || !UUID.test(row.postId)) return false;
    const id = row.postId.toLowerCase();
    if (ids.has(id)) return false;
    ids.add(id);
    if (typeof row.createdAt !== 'string' || !ISO.test(row.createdAt)) return false;
    if (row.updatedAt !== null && (typeof row.updatedAt !== 'string' || !ISO.test(row.updatedAt))) return false;
    const created = Date.parse(row.createdAt);
    const updated = row.updatedAt === null ? created : Date.parse(row.updatedAt as string);
    if (!Number.isFinite(created) || !Number.isFinite(updated)) return false;
    const activity = Math.max(created, updated);
    if (activity > previousActivity || (activity === previousActivity && created > previousCreated) ||
        (activity === previousActivity && created === previousCreated && id > previousId)) return false;
    previousActivity = activity;
    previousCreated = created;
    previousId = id;
  }
  return true;
}
