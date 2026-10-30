import { describe, expect, it } from 'vitest';
import { parseNotificationSearch } from './notification-search-client';
const id = '11111111-1111-4111-8111-111111111111';
describe('private notification search envelope', () => {
  it('parses verified items but strips external links', () => {
    const result = parseNotificationSearch({
      items: [{ id, title: 'Notice', body: 'Bank', category: 'BANK', isRead: false,
        createdAt: '2026-10-29T00:00:00Z', link: '//evil.example' }],
      hasMore: false, nextCursor: null, asOfUtc: '2026-10-29T00:00:00Z',
    });
    expect(result.items[0]?.link).toBeNull();
    expect(result.items[0]?.is_read).toBe(false);
  });
  it('fails closed on forged hasMore, malformed or duplicate rows', () => {
    expect(() => parseNotificationSearch({ items: [], hasMore: true, nextCursor: null, asOfUtc: '2026-10-29T00:00:00Z' })).toThrow();
    const item = { id, title: 'Notice', body: 'Bank', category: 'BANK', isRead: false, createdAt: '2026-10-29T00:00:00Z' };
    expect(() => parseNotificationSearch({ items: [item, item], hasMore: false, nextCursor: null, asOfUtc: '2026-10-29T00:00:00Z' })).toThrow();
  });
});
