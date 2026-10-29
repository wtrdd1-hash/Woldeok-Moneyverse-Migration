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
    expect(params).toEqual(['11111111-1111-4111-8111-111111111111', 'TRANSACTIONAL', true, 20, 40]);
  });
});
