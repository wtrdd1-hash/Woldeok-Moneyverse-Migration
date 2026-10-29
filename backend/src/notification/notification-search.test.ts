import { afterEach, describe, expect, it, vi } from 'vitest';
import { NotificationService } from './notification.service';
import { createNotificationSearchCursor, parseNotificationSearchCursor, validateNotificationSearch } from './notification-search';

const owner = '11111111-1111-4111-8111-111111111111';
const session = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const input = { query: '  은행  ', fromUtc: '2026-10-01T00:00:00.000Z', toUtc: '2026-10-30T00:00:00.000Z', limit: 20 };
const now = new Date('2026-10-29T13:00:00.000Z');

describe('private notification search validation and cursor', () => {
  afterEach(() => { delete process.env.SESSION_CURRENT_KEY; delete process.env.NOTIFICATION_SEARCH_ENABLED; });
  it('normalizes NFC, rejects invalid dates and overlong or empty searches', () => {
    const normalized = validateNotificationSearch({ ...input, query: '  e\u0301x  ' }, now);
    expect(normalized.query).toBe('éx');
    expect(() => validateNotificationSearch({ ...input, query: ' ' }, now)).toThrow();
    expect(() => validateNotificationSearch({ ...input, fromUtc: '2026-01-01T00:00:00.000Z' }, now)).toThrow();
    expect(() => validateNotificationSearch({ ...input, toUtc: '2026-09-30T00:00:00.000Z' }, now)).toThrow();
  });
  it('rejects forgery, wrong owner/session/filters and expired cursor', () => {
    process.env.SESSION_CURRENT_KEY = 'test-notification-search-signing-key-with-at-least-32-chars';
    const filters = validateNotificationSearch(input, now);
    const cursor = createNotificationSearchCursor(owner, session, filters, now.toISOString(), now.toISOString(), owner, now);
    expect(parseNotificationSearchCursor(cursor, owner, session, filters, now).afterId).toBe(owner);
    expect(() => parseNotificationSearchCursor(cursor, owner, 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', filters, now)).toThrow();
    expect(() => parseNotificationSearchCursor(cursor, owner, session, { ...filters, query: 'other' }, now)).toThrow();
    expect(() => parseNotificationSearchCursor(cursor.slice(0, -2) + 'aa', owner, session, filters, now)).toThrow();
    expect(() => parseNotificationSearchCursor(cursor, owner, session, filters, new Date(now.getTime() + 600_001))).toThrow();
  });
  it('uses owner-bound SQL parameters, deterministic keyset pagination and never returns external links', async () => {
    process.env.NOTIFICATION_SEARCH_ENABLED = 'true';
    process.env.SESSION_CURRENT_KEY = 'test-notification-search-signing-key-with-at-least-32-chars';
    const records = Array.from({ length: 3 }, (_, i) => ({
      id: `00000000-0000-4000-8000-00000000000${3 - i}`, category: 'BANK', title: '은행', body: '안내',
      link: i === 0 ? 'https://attacker.example/' : '/wallet', is_read: false,
      created_at: new Date(`2026-10-29T12:00:0${3 - i}.000Z`),
    }));
    const query = vi.fn().mockImplementation(async (sql: string) => {
      if (sql.includes('pg_indexes')) return { rows: [{ available: true }] };
      if (sql.includes('clock_timestamp')) return { rows: [{ as_of: now }] };
      if (sql.includes('FROM public.in_app_notifications')) return { rows: records };
      return { rows: [] };
    });
    const release = vi.fn();
    const service = new NotificationService({ query, connect: vi.fn().mockResolvedValue({ query, release }) } as never);
    const result = await service.searchNotifications(owner, session, { ...input, limit: 2 });
    expect(result.items).toHaveLength(2);
    expect(result.items[0]?.link).toBeNull();
    expect(result.hasMore).toBe(true);
    expect(result.nextCursor).toBeTruthy();
    const [sql, params] = query.mock.calls.find(([text]) => String(text).includes('FROM public.in_app_notifications'))!;
    expect(sql).toContain('user_id = $1::uuid');
    expect(sql).toContain('(created_at, id) <');
    expect(params[0]).toBe(owner);
    expect(params[6]).toBe('은행');
    expect(params[9]).toBe(3);
    expect(release).toHaveBeenCalledOnce();
  });
  it('fails closed if the PostgreSQL search index is not verified', async () => {
    process.env.NOTIFICATION_SEARCH_ENABLED = 'true';
    const query = vi.fn().mockResolvedValue({ rows: [{ available: false }] });
    const release = vi.fn();
    const service = new NotificationService({ query, connect: vi.fn().mockResolvedValue({ query, release }) } as never);
    await expect(service.searchNotifications(owner, session, input)).rejects.toThrow();
    expect(query.mock.calls.some(([sql]) => String(sql).includes('FROM public.in_app_notifications'))).toBe(false);
    expect(release).toHaveBeenCalled();
  });
});
