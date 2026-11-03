import { describe, expect, it } from 'vitest';
import { parseNotificationFeed } from './notification-feed';
describe('notification feed validation', () => {
  it('rejects invalid payloads', () => {
    expect(() => parseNotificationFeed(null)).toThrow();
    expect(() => parseNotificationFeed({ notifications: null })).toThrow();
  });
  it('rejects oversized upstream feed instead of rendering unbounded records', () => {
    const row = { id: '00000000-0000-4000-8000-000000000001', title: 'ok', body: 'ok', category: 'SYSTEM', is_read: false, created_at: '2026-11-03T00:00:00Z' };
    expect(() => parseNotificationFeed({ notifications: Array.from({ length: 101 }, (_, i) => ({ ...row, id: `00000000-0000-4000-8000-${String(i).padStart(12, '0')}` })) })).toThrow();
    expect(() => parseNotificationFeed({ notifications: [{ ...row, body: 'x'.repeat(10001) }] })).toThrow();
  });
  it('preserves an empty valid feed', () => {
    expect(parseNotificationFeed({ notifications: [] })).toEqual([]);
  });
});
