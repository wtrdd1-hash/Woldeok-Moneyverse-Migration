import { describe, expect, it, vi } from 'vitest';
import type { Queryable } from '../core/db';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import type { RequestWithSession } from '../auth/session.context';

const actor = '11111111-1111-4111-8111-111111111111';

describe('verified read-all notification receipt', () => {
  it('returns the actual remaining unread count after the owner-scoped mutation, not zero', async () => {
    const query = vi.fn().mockResolvedValueOnce({ rows: [{ affected_count: 4 }] })
      .mockResolvedValueOnce({ rows: [{ unread_count: 2 }] });
    const service = new NotificationService({ query } as unknown as Queryable);
    await expect(service.markAllReadWithReceipt(actor)).resolves.toEqual({ updatedCount: 4, remainingUnreadCount: 2 });
    expect(query).toHaveBeenCalledTimes(2);
    expect(query.mock.calls[0]![1]).toEqual([actor]);
    expect(query.mock.calls[1]![1]).toEqual([actor]);
    expect(query.mock.calls[0]![0]).toContain('notification_mark_all_read');
    expect(query.mock.calls[1]![0]).toContain('notification_unread_count');
  });

  it('fails closed on a malformed database count', async () => {
    const query = vi.fn().mockResolvedValueOnce({ rows: [{ affected_count: 1 }] })
      .mockResolvedValueOnce({ rows: [{ unread_count: -1 }] });
    await expect(new NotificationService({ query } as unknown as Queryable).markAllReadWithReceipt(actor))
      .rejects.toThrow();
  });

  it('uses the authenticated session actor for the new receipt endpoint', async () => {
    const service = { markAllReadWithReceipt: vi.fn().mockResolvedValue({ updatedCount: 2, remainingUnreadCount: 1 }) };
    const controller = new NotificationController(service as unknown as NotificationService);
    const request = { session: { user_id: actor } } as unknown as RequestWithSession;
    await expect(controller.markAllReadWithReceipt(request)).resolves.toEqual({ updatedCount: 2, remainingUnreadCount: 1 });
    expect(service.markAllReadWithReceipt).toHaveBeenCalledWith(actor);
  });
});
