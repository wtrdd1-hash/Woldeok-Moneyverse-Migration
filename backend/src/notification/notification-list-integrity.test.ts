import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { describe, expect, it, vi } from 'vitest';
import type { Queryable } from '../core/db';
import { NotificationQueryDto } from './notification.dto';
import { NotificationService } from './notification.service';

const ACTOR = '11111111-1111-4111-8111-111111111111';

describe('notification list query integrity', () => {
  it('parses the literal false filter as false, not true', () => {
    const query = plainToInstance(NotificationQueryDto, { unreadOnly: 'false' });
    expect(query.unreadOnly).toBe(false);
    expect(validateSync(query)).toEqual([]);
  });

  it('parses the literal true filter as true', () => {
    const query = plainToInstance(NotificationQueryDto, { unreadOnly: 'true' });
    expect(query.unreadOnly).toBe(true);
    expect(validateSync(query)).toEqual([]);
  });

  it('rejects arbitrary strings rather than interpreting them as true', () => {
    for (const input of ['no', '1', 'FALSE', 'unread']) {
      const query = plainToInstance(NotificationQueryDto, { unreadOnly: input });
      expect(validateSync(query).some((error) => error.property === 'unreadOnly')).toBe(true);
    }
  });

  it('preserves an absent filter and native booleans', () => {
    expect(plainToInstance(NotificationQueryDto, {}).unreadOnly).toBeUndefined();
    for (const value of [true, false]) {
      const query = plainToInstance(NotificationQueryDto, { unreadOnly: value });
      expect(query.unreadOnly).toBe(value);
      expect(validateSync(query)).toEqual([]);
    }
  });

  it('uses an owner-scoped, stable secondary UUID sort for offset pages', async () => {
    const query = vi.fn(async () => ({ rows: [] }));
    const service = new NotificationService({ query } as unknown as Queryable);
    await service.listNotifications(ACTOR, { unreadOnly: false, limit: 25, offset: 25 });
    const [sql, params] = query.mock.calls[0] as unknown as [string, unknown[]];
    expect(sql).toMatch(/WHERE user_id = \$1/);
    expect(sql).toMatch(/ORDER BY created_at DESC, id DESC/);
    expect(sql).toMatch(/LIMIT \$3 OFFSET \$4/);
    expect(params).toEqual([ACTOR, null, 25, 25]);
  });
});
