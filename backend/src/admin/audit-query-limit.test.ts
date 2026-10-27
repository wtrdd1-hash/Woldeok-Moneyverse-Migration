import { BadRequestException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import type { RequestWithSession } from '../auth/session.context';
import { AdminAuditController } from './audit.controller';
import type { AuditRepository } from './audit.repository';

const ACTOR = 'c091eab0-a4bc-4f2a-b8a8-16b5d2e5a099';
const request = { session: { user_id: ACTOR } } as unknown as RequestWithSession;

function setup() {
  const searchEvents = vi.fn().mockResolvedValue([{ sequence: '9007199254740993' }]);
  const controller = new AdminAuditController({ searchEvents } as unknown as AuditRepository);
  return { controller, searchEvents };
}

describe('GET admin/audit/events wire limit validation', () => {
  it.each([undefined, '1', '30', '100'])(
    'accepts canonical bounded limit %s and preserves the audit cursor',
    async (limit) => {
      const { controller, searchEvents } = setup();
      const result = await controller.events(request, limit === undefined ? {} : { limit });
      expect(searchEvents).toHaveBeenCalledExactlyOnceWith({
        actorUserId: ACTOR,
        filters: expect.objectContaining({ limit: limit === undefined ? 30 : Number(limit) }),
      });
      expect(result.nextCursor).toBe('9007199254740993');
    },
  );

  it.each([
    '', '0', '101', '-1', '1.0', '1e2', '2junk', '0x10',
    '+2', '02', ' 2', '2 ', '9007199254740993', 'Infinity',
  ])('rejects malformed limit %j before accessing audit records', async (limit) => {
    const { controller, searchEvents } = setup();
    await expect(controller.events(request, { limit })).rejects.toBeInstanceOf(BadRequestException);
    expect(searchEvents).not.toHaveBeenCalled();
  });

  it('rejects duplicate query values instead of choosing a partial number', async () => {
    const { controller, searchEvents } = setup();
    await expect(controller.events(request, { limit: ['2', '3'] } as unknown as Record<string, string>))
      .rejects.toBeInstanceOf(BadRequestException);
    expect(searchEvents).not.toHaveBeenCalled();
  });
});
