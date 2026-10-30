import { parseNotificationFeed, type NotificationItem } from '@/components/notification-feed';

export interface SearchResult {
  readonly items: (NotificationItem & { link: string | null })[];
  readonly hasMore: boolean;
  readonly nextCursor: string | null;
  readonly asOfUtc: string;
}

/** A malformed response is a visible failure, not a fabricated empty inbox. */
export function parseNotificationSearch(payload: unknown): SearchResult {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) throw new Error('Invalid search result');
  const data = payload as Record<string, unknown>;
  if (!Array.isArray(data.items) || data.items.length > 50 || typeof data.hasMore !== 'boolean' ||
      (data.nextCursor !== null && (typeof data.nextCursor !== 'string' || data.nextCursor.length > 2048)) ||
      typeof data.asOfUtc !== 'string' || !Number.isFinite(Date.parse(data.asOfUtc)) ||
      (data.hasMore && (typeof data.nextCursor !== 'string' || data.nextCursor.length === 0)) ||
      (!data.hasMore && data.nextCursor !== null)) throw new Error('Invalid search result');
  const rows = data.items.map((row: unknown) => {
    if (!row || typeof row !== 'object') throw new Error('Invalid search row');
    const r = row as Record<string, unknown>;
    return { ...r, is_read: r.isRead, created_at: r.createdAt };
  });
  const items = parseNotificationFeed({ notifications: rows });
  return {
    items: items.map((item, index) => {
      const link = (data.items as Record<string, unknown>[])[index]?.link;
      return { ...item, link: typeof link === 'string' && /^\/(?:account|wallet|shop|work|quests|stocks|banking|businesses|board|help|casino|marketplace|notifications)(?:\/|\?|$)/.test(link) && !/[\\%\u0000-\u001f]/.test(link) ? link : null };
    }),
    hasMore: data.hasMore, nextCursor: data.nextCursor as string | null, asOfUtc: data.asOfUtc,
  };
}
