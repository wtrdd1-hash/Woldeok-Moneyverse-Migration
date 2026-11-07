/** Strict Gregorian date and exact Seoul-day bounds; never search outside latest 50. */
export function parseBoardDay(value: unknown): { day: string | null; invalid: boolean } {
  if (value === undefined) return { day: null, invalid: false };
  if (typeof value !== 'string' || !/^20[0-9]{2}-[0-9]{2}-[0-9]{2}$/.test(value)) return { day: null, invalid: true };
  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed.valueOf()) || parsed.toISOString().slice(0, 10) !== value) return { day: null, invalid: true };
  return { day: value, invalid: false };
}

export function isVerifiedBoardDayResponse(payload: unknown, day: string): boolean {
  if (parseBoardDay(day).invalid || !payload || typeof payload !== 'object' || Array.isArray(payload)) return false;
  const value = payload as Record<string, unknown>;
  // An empty list alone cannot prove that an older backend applied the filter.
  if (value.appliedDay !== day || !Array.isArray(value.posts) || value.posts.length > 50) return false;
  const start = Date.parse(`${day}T00:00:00+09:00`);
  const end = start + 86_400_000;
  const ids = new Set<string>();
  for (const post of value.posts) {
    if (!post || typeof post !== 'object' || Array.isArray(post)) return false;
    const row = post as Record<string, unknown>;
    if (typeof row.postId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(row.postId) || ids.has(row.postId)) return false;
    if (typeof row.createdAt !== 'string' || !/^\d{4}-\d{2}-\d{2}T/.test(row.createdAt)) return false;
    const time = Date.parse(row.createdAt);
    if (!Number.isFinite(time) || time < start || time >= end) return false;
    ids.add(row.postId);
  }
  return true;
}
