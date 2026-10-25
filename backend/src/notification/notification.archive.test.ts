import { describe, expect, it, vi } from 'vitest';
import { ConflictException } from '@nestjs/common';
import type { Queryable } from '../core/db';
import type { RequestWithSession } from '../auth/session.context';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';

const actor = '11111111-1111-4111-8111-111111111111';
const request = { session: { user_id: actor } } as unknown as RequestWithSession;
const row = { id: '22222222-2222-4222-8222-222222222222', category: 'system', title: 'News', body: 'Safe', link: null, is_read: false, read_at: null, created_at: new Date('2026-10-26T00:00:00Z') };

describe('owner-bound notification archive snapshot', () => {
  it('uses server-derived actor and one bounded owner SQL query', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [row] });
    const service = new NotificationService({ query } as unknown as Queryable);
    const controller = new NotificationController(service);
    expect(await controller.archiveSnapshot(request)).toEqual({ notifications: [row], complete: true });
    expect(query).toHaveBeenCalledTimes(1);
    expect(query.mock.calls[0][0]).toMatch(/WHERE user_id = \$1/);
    expect(query.mock.calls[0][0]).toMatch(/LIMIT \$2/);
    expect(query.mock.calls[0][1]).toEqual([actor, 101]);
  });
  it('rejects 101 rows rather than presenting a partial archive', async () => {
    const query = vi.fn().mockResolvedValue({ rows: Array.from({ length: 101 }, () => row) });
    const service = new NotificationService({ query } as unknown as Queryable);
    await expect(service.archiveSnapshot(actor)).rejects.toBeInstanceOf(ConflictException);
  });
  it('fails closed when database is unavailable', async () => {
    const service = new NotificationService(null);
    await expect(service.archiveSnapshot(actor)).rejects.toThrow('database pool unavailable');
  });
});
