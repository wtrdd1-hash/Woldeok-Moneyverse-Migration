export function verifiedSupportMessageKeywordResponse(payload: unknown, q: string): boolean {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return false;
  const rows = (payload as { messages?: unknown }).messages;
  if (!Array.isArray(rows) || rows.length > 200) return false;
  const ids = new Set<string>();
  let previousTime = -Infinity;
  return rows.every((raw: unknown) => {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return false;
    const row = raw as Record<string, unknown>;
    if (typeof row.message_id !== 'string' ||
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(row.message_id) ||
        ids.has(row.message_id) || !['user', 'admin'].includes(String(row.sender_kind)) ||
        typeof row.body !== 'string' || !row.body.toLocaleLowerCase().includes(q.toLocaleLowerCase()) ||
        typeof row.created_at !== 'string') return false;
    const time = Date.parse(row.created_at);
    if (!Number.isFinite(time) || time < previousTime) return false;
    previousTime = time;
    ids.add(row.message_id);
    return true;
  });
}
