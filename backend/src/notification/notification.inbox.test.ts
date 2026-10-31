import { describe, expect, it, vi } from 'vitest';
import { NotificationService } from './notification.service';

describe('verified owner notification listing', () => {
  it('filters by authenticated actor and category before pagination with stable tie ordering', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [] });
    const service = new NotificationService({ query } as never);
    await service.listNotifications('11111111-1111-4111-8111-111111111111', {
      category: 'TRANSACTIONAL', limit: 20, offset: 40, unreadOnly: true,
    });
    expect(query).toHaveBeenCalledTimes(1);
    const [sql, params] = query.mock.calls[0]!;
    expect(sql).toContain('user_id = $1');
    expect(sql).toContain('category = $2');
    expect(sql).toContain('ORDER BY created_at DESC, id DESC');
    expect(params).toEqual(['11111111-1111-4111-8111-111111111111', 'TRANSACTIONAL', true, null, 20, 40]);
  });
  it('uses owner-scoped SQL for explicit unread true and false with category filters', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [] });
    const service = new NotificationService({ query } as never);
    for (const unreadOnly of [true, false]) {
      await service.listNotifications('11111111-1111-4111-8111-111111111111', {
        category: 'SYSTEM', unreadOnly, limit: 21, offset: 0,
      });
    }
    expect(query).toHaveBeenCalledTimes(2);
    expect(query.mock.calls[0]![1]).toEqual(['11111111-1111-4111-8111-111111111111', 'SYSTEM', true, null, 21, 0]);
    expect(query.mock.calls[1]![1]).toEqual(['11111111-1111-4111-8111-111111111111', 'SYSTEM', null, null, 21, 0]);
    expect(query.mock.calls[0]![0]).toContain('user_id = $1');
    expect(query.mock.calls[0]![0]).toContain('is_read = FALSE');
  });

  it('never returns an untrusted navigation link from the owner notification list', async () => {
    const links = [
      'https://evil.example/redirect', '//evil.example/path', 'javascript:alert(1)',
      '/wallet%2f%2fevil.example', '/wallet\\evil.example', '/wallet\nnext',
      '/wallets', '/inventory/expiring', '/wallet?tab=history', '/shop/purchases', null,
    ];
    const query = vi.fn().mockResolvedValue({ rows: links.map((link, index) => ({
      id: String(index), user_id: 'owner', category: 'SYSTEM', title: 'notice', body: 'safe', link,
      dedupe_key: null, is_read: false, read_at: null, created_at: new Date('2026-10-30T00:00:00Z'),
    })) });
    const service = new NotificationService({ query } as never);
    const rows = await service.listNotifications('11111111-1111-4111-8111-111111111111', {});
    expect(rows.map((row) => (row as { link: string | null }).link)).toEqual([
      null, null, null, null, null, null, null, null,
      '/wallet?tab=history', '/shop/purchases', null,
    ]);
    expect(query.mock.calls[0]?.[1]?.[0]).toBe('11111111-1111-4111-8111-111111111111');
  });

});
