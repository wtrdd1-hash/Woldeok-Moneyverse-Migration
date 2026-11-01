import { describe, expect, it } from 'vitest';
import type { NotificationItem } from '@/components/notification-feed';
import { verifyNotificationPage } from '@/lib/notification-page-proof';

const item = (id: string, category = 'TRANSACTIONAL', is_read = false): NotificationItem => ({
  id, category, is_read, title: 'Verified notice', body: 'Server receipt', created_at: '2026-11-01T00:00:00Z',
});
const options = { category: 'TRANSACTIONAL', unreadOnly: true, readOnly: false, previous: [] } as const;

describe('member notification page evidence', () => {
  it('accepts a verified empty page and matching owner rows', () => {
    expect(verifyNotificationPage([], options)).toEqual([]);
    expect(verifyNotificationPage([item('a')], options)).toHaveLength(1);
  });
  it('rejects rows outside the requested category and read-state filters', () => {
    expect(() => verifyNotificationPage([item('b', 'SECURITY')], options)).toThrow();
    expect(() => verifyNotificationPage([item('c', 'TRANSACTIONAL', true)], options)).toThrow();
    expect(() => verifyNotificationPage([item('d', 'TRANSACTIONAL', false)], { ...options, unreadOnly: false, readOnly: true })).toThrow();
  });
  it('rejects duplicate IDs across pages and oversized pages before appending', () => {
    expect(() => verifyNotificationPage([item('a')], { ...options, previous: [item('a')] })).toThrow();
    expect(() => verifyNotificationPage(Array.from({ length: 22 }, (_, index) => item(String(index))), options)).toThrow();
  });
  it('rejects contradictory filter requests and unknown server categories', () => {
    expect(() => verifyNotificationPage([item('a')], { ...options, readOnly: true })).toThrow();
    expect(() => verifyNotificationPage([item('a', 'UNKNOWN')], { ...options, category: 'ALL', unreadOnly: false })).toThrow();
  });
});
