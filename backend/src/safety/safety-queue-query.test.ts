import 'reflect-metadata';
import { BadRequestException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { RequestWithSession } from '../auth/session.context';
import type { SafetyService } from './safety.service';
import { SafetyController } from './safety.controller';

const actorId = '11111111-1111-4111-8111-111111111111';
const req = { session: { user_id: actorId } } as unknown as RequestWithSession;

describe('SafetyController moderation queue query integrity', () => {
  const service = {
    adminListTakedowns: vi.fn().mockResolvedValue({ items: [], count: 0 }),
    adminListChatReports: vi.fn().mockResolvedValue({ items: [], count: 0 }),
  };
  const controller = new SafetyController(service as unknown as SafetyService);

  beforeEach(() => vi.clearAllMocks());

  for (const endpoint of [
    { name: 'takedowns', call: (status?: string, limit?: string, offset?: string) => controller.adminListTakedowns(req, status, limit, offset), spy: service.adminListTakedowns, validStatus: 'TRIAGED' },
    { name: 'chat-reports', call: (status?: string, limit?: string, offset?: string) => controller.adminListChatReports(req, status, limit, offset), spy: service.adminListChatReports, validStatus: 'ACTIONED_BLOCKED' },
  ]) {
    it.each([
      ['unsupported status', 'INVALID', '50', '0'],
      ['fractional limit', undefined, '1.5', '0'],
      ['trailing garbage limit', undefined, '20xyz', '0'],
      ['negative limit', undefined, '-1', '0'],
      ['excessive limit', undefined, '101', '0'],
      ['scientific limit', undefined, '1e2', '0'],
      ['negative offset', undefined, '50', '-1'],
      ['fractional offset', undefined, '50', '0.5'],
      ['unsafe offset', undefined, '50', '9007199254740993'],
      ['excessive offset', undefined, '50', '10001'],
    ])(endpoint.name + ': rejects %s without querying sensitive records', async (_reason, status, limit, offset) => {
      await expect(endpoint.call(status, limit, offset)).rejects.toThrow(BadRequestException);
      expect(endpoint.spy).not.toHaveBeenCalled();
    });

    it(endpoint.name + ': defaults to a bounded first page', async () => {
      await endpoint.call();
      expect(endpoint.spy).toHaveBeenCalledWith(actorId, undefined, 50, 0);
    });

    it(endpoint.name + ': forwards valid status and page boundaries unchanged', async () => {
      await endpoint.call(endpoint.validStatus, '100', '10000');
      expect(endpoint.spy).toHaveBeenCalledWith(actorId, endpoint.validStatus, 100, 10000);
    });
  }
});
