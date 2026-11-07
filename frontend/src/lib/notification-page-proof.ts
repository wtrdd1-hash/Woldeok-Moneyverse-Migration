import type { NotificationItem } from '@/components/notification-feed';

export interface NotificationPageProofOptions {
  readonly category: string;
  readonly unreadOnly: boolean;
  readonly readOnly: boolean;
  readonly previous: readonly NotificationItem[];
  readonly maxRows?: number;
}

const SERVER_CATEGORIES = new Set([
  'TRANSACTIONAL', 'PRODUCT_ACTIVITY', 'SEASON_LIVEOPS', 'SECURITY_CRITICAL',
  'BUSINESS', 'BANK', 'SEASON', 'SPACE', 'SECURITY', 'SYSTEM',
]);

/** The response shape alone cannot prove it belongs to the selected owner filter. */
export function verifyNotificationPage(
  rows: readonly NotificationItem[],
  { category, unreadOnly, readOnly, previous, maxRows = 21 }: NotificationPageProofOptions,
): readonly NotificationItem[] {
  if (!Array.isArray(rows) || rows.length > maxRows ||
      (category !== 'ALL' && !SERVER_CATEGORIES.has(category)) ||
      (unreadOnly && readOnly)) {
    throw new Error('Invalid notification page request or response');
  }
  const seen = new Set(previous.map((item) => item.id.toLowerCase()));
  for (const item of rows) {
    if (!SERVER_CATEGORIES.has(item.category) ||
        (category !== 'ALL' && item.category !== category) ||
        (unreadOnly && item.is_read) || (readOnly && !item.is_read) ||
        seen.has(item.id.toLowerCase())) {
      throw new Error('Notification page does not match the requested filter');
    }
    seen.add(item.id.toLowerCase());
  }
  return rows;
}
