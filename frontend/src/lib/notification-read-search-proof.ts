/** Read-state proof for owner-private notification search responses.
 * A 200 response with contradictory read flags is not verified evidence.
 */
export function verifiedNotificationReadSearch(payload: unknown, readOnly: boolean, unreadOnly: boolean): boolean {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return false;
  const data = payload as Record<string, unknown>;
  if (!Array.isArray(data.items) || data.items.length > 50 || typeof data.hasMore !== 'boolean' ||
      (data.nextCursor !== null && (typeof data.nextCursor !== 'string' || data.nextCursor.length > 2048)) ||
      (data.hasMore && (typeof data.nextCursor !== 'string' || !data.nextCursor)) ||
      (!data.hasMore && data.nextCursor !== null) ||
      typeof data.asOfUtc !== 'string' || !Number.isFinite(Date.parse(data.asOfUtc))) return false;
  const ids = new Set<string>();
  for (const value of data.items) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
    const row = value as Record<string, unknown>;
    if (typeof row.id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(row.id) || ids.has(row.id) ||
        typeof row.isRead !== 'boolean' || (readOnly && !row.isRead) || (unreadOnly && row.isRead) ||
        typeof row.title !== 'string' || typeof row.body !== 'string' || typeof row.category !== 'string' ||
        typeof row.createdAt !== 'string' || !Number.isFinite(Date.parse(row.createdAt))) return false;
    ids.add(row.id);
  }
  return true;
}
