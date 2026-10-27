import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import type { RequestWithSession } from '../auth/session.context';
import { ChatController } from './chat.controller';
import type { ChatService } from './chat.service';

const actorId = '11111111-1111-4111-8111-111111111111';
const request = { session: { user_id: actorId } } as unknown as RequestWithSession;
const service = {
  listConversations: vi.fn().mockResolvedValue([]),
  totalUnreadCount: vi.fn().mockResolvedValue(0),
  searchActiveUsers: vi.fn().mockResolvedValue([]),
};
const controller = new ChatController(service as unknown as ChatService);

beforeEach(() => vi.clearAllMocks());

describe('private chat conversation list page limit', () => {
  it('defaults to 50 only when the query parameter is absent', async () => {
    await expect(controller.listConversations(request)).resolves.toEqual({ conversations: [], totalUnread: 0 });
    expect(service.listConversations).toHaveBeenCalledWith(actorId, 50);
    expect(service.totalUnreadCount).toHaveBeenCalledWith(actorId);
  });

  it.each(['1', '20', '100'])('accepts canonical bounded decimal %s', async (raw) => {
    await controller.listConversations(request, raw);
    expect(service.listConversations).toHaveBeenCalledWith(actorId, Number(raw));
  });

  it.each(['', '0', '-1', '+1', '01', '2junk', '1e2', '1.5', ' 2', '2 ', '101', '9007199254740993', 'Infinity', 'NaN', ['1', '2'], { x: 1 }])(
    'rejects malformed or out-of-range limit %j before database access', async (raw) => {
      await expect(controller.listConversations(request, raw as string)).rejects.toBeInstanceOf(BadRequestException);
      expect(service.listConversations).not.toHaveBeenCalled();
      expect(service.totalUnreadCount).not.toHaveBeenCalled();
    },
  );
});

describe('private chat recipient search page limit', () => {
  it('defaults to 10 only when the query parameter is absent', async () => {
    await expect(controller.searchUsers(request, 'kim')).resolves.toEqual({ users: [] });
    expect(service.searchActiveUsers).toHaveBeenCalledWith(actorId, 'kim', 10);
  });

  it.each(['1', '10', '20'])('accepts canonical bounded decimal %s', async (raw) => {
    await controller.searchUsers(request, 'kim', raw);
    expect(service.searchActiveUsers).toHaveBeenCalledWith(actorId, 'kim', Number(raw));
  });

  it.each(['', '0', '-1', '01', '2junk', '1e1', '2.0', ' 2', '2 ', '21', '100', '9007199254740993', ['1', '2'], { x: 1 }])(
    'rejects malformed or out-of-range limit %j before searching members', async (raw) => {
      await expect(controller.searchUsers(request, 'kim', raw as string)).rejects.toBeInstanceOf(BadRequestException);
      expect(service.searchActiveUsers).not.toHaveBeenCalled();
    },
  );
});
