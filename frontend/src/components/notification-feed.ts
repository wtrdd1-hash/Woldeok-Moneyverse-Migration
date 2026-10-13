/** Validate the real backend notification envelope; never render malformed data as empty. */
export interface NotificationItem {
  readonly id: string;
  readonly category: string;
  readonly title: string;
  readonly body: string;
  readonly is_read: boolean;
  readonly created_at: string;
}
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function parseNotificationFeed(payload: unknown): NotificationItem[] {
  if (!payload || typeof payload !== 'object' || !('notifications' in payload)) throw new Error('Invalid notification envelope');
  const rows = (payload as { notifications: unknown }).notifications;
  if (!Array.isArray(rows)) throw new Error('Invalid notification list');
  const seen = new Set<string>();
  return rows.map((item: unknown): NotificationItem => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) throw new Error('Invalid notification row');
    const row = item as Record<string, unknown>;
    if (typeof row.id !== 'string' || !uuid.test(row.id) ||
        typeof row.title !== 'string' || typeof row.body !== 'string' ||
        typeof row.category !== 'string' || typeof row.is_read !== 'boolean' ||
        typeof row.created_at !== 'string' || !Number.isFinite(Date.parse(row.created_at))) {
      throw new Error('Invalid notification fields');
    }
    const id = row.id.toLowerCase();
    if (seen.has(id)) throw new Error('Duplicate notification ID');
    seen.add(id);
    return { id: row.id, title: row.title, body: row.body, category: row.category,
      is_read: row.is_read, created_at: row.created_at };
  });
}
