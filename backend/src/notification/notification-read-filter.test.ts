import { describe, expect, it, vi } from 'vitest';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { NotificationQueryDto } from './notification.dto';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';

const actor = '11111111-1111-4111-8111-111111111111';

describe('owner-private read notification filter', () => {
  it('accepts only boolean readOnly query values', () => {
    expect(validateSync(plainToInstance(NotificationQueryDto, { readOnly: 'true' }))).toHaveLength(
      0,
    );
    expect(validateSync(plainToInstance(NotificationQueryDto, { readOnly: 'false' }))).toHaveLength(
      0,
    );
    expect(
      validateSync(plainToInstance(NotificationQueryDto, { readOnly: 'anything' })).length,
    ).toBeGreaterThan(0);
  });

  it('filters read notifications before pagination without changing actor scope', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [] });
    const service = new NotificationService({ query } as never);
    await service.listNotifications(actor, {
      category: 'SECURITY',
      readOnly: true,
      limit: 21,
      offset: 40,
    });
    const [sql, params] = query.mock.calls[0]!;
    expect(sql).toContain('user_id = $1');
    expect(sql).toContain('is_read = TRUE');
    expect(sql).toContain('ORDER BY created_at DESC, id DESC');
    expect(params).toEqual([actor, 'SECURITY', null, true, 21, 40]);
  });

  it('rejects contradictory read and unread filters before SQL', async () => {
    const query = vi.fn();
    const service = new NotificationService({ query } as never);
    await expect(
      service.listNotifications(actor, { readOnly: true, unreadOnly: true }),
    ).rejects.toThrow();
    expect(query).not.toHaveBeenCalled();
    const controller = new NotificationController(service);
    const request = { session: { user_id: actor } } as never;
    await expect(
      controller.listNotifications(request, { readOnly: true, unreadOnly: true }),
    ).rejects.toThrow();
  });
});
