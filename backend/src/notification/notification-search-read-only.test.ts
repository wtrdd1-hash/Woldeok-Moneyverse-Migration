import { afterEach, describe, expect, it, vi } from 'vitest';
import { NotificationService } from './notification.service';
import { createNotificationSearchCursor, parseNotificationSearchCursor, validateNotificationSearch } from './notification-search';

const owner = '11111111-1111-4111-8111-111111111111';
const session = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const now = new Date('2026-10-29T13:00:00.000Z');
const input = { query: '은행', fromUtc: '2026-10-01T00:00:00.000Z', toUtc: '2026-10-30T00:00:00.000Z', readOnly: true };

describe('owner notification search read-only filter', () => {
  afterEach(() => { delete process.env.NOTIFICATION_SEARCH_ENABLED; delete process.env.SESSION_CURRENT_KEY; });
  it('accepts read-only and refuses contradictory or nonboolean filters', () => {
    expect(validateNotificationSearch(input, now).readOnly).toBe(true);
    expect(() => validateNotificationSearch({ ...input, unreadOnly: true }, now)).toThrow();
    expect(() => validateNotificationSearch({ ...input, readOnly: 'true' as never }, now)).toThrow();
  });
  it('binds the read filter to the signed cursor', () => {
    process.env.SESSION_CURRENT_KEY = 'notification-read-search-test-signing-key-long-enough';
    const filter = validateNotificationSearch(input, now);
    const cursor = createNotificationSearchCursor(owner, session, filter, now.toISOString(), now.toISOString(), owner, now);
    expect(parseNotificationSearchCursor(cursor, owner, session, filter, now).afterId).toBe(owner);
    expect(() => parseNotificationSearchCursor(cursor, owner, session, { ...filter, readOnly: false }, now)).toThrow();
  });
  it('uses owner-bound read-state SQL and rejects forged unread rows', async () => {
    process.env.NOTIFICATION_SEARCH_ENABLED = 'true';
    process.env.SESSION_CURRENT_KEY = 'notification-read-search-test-signing-key-long-enough';
    const query = vi.fn().mockImplementation(async (sql: string) => {
      if (sql.includes('pg_indexes')) return { rows: [{ available: true }] };
      if (sql.includes('clock_timestamp')) return { rows: [{ as_of: now }] };
      if (sql.includes('FROM public.in_app_notifications')) return { rows: [{ id: owner, category: 'BANK', title: '은행', body: '알림', link: null, is_read: false, created_at: now }] };
      return { rows: [] };
    });
    const release = vi.fn();
    const service = new NotificationService({ query, connect: vi.fn().mockResolvedValue({ query, release }) } as never);
    await expect(service.searchNotifications(owner, session, input)).rejects.toThrow();
    const [sql, params] = query.mock.calls.find(([text]) => String(text).includes('FROM public.in_app_notifications'))!;
    expect(sql).toContain('is_read = TRUE');
    expect(params[0]).toBe(owner);
    expect(params).toContain(true);
    expect(release).toHaveBeenCalledOnce();
  });
});
