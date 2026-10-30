import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import type { Queryable } from '../core/db';
import type { RequestWithSession } from '../auth/session.context';
import { ChatController } from './chat.controller';
import { ChatInputError, PostgresChatRepository } from './chat.repository';
import type { ChatService } from './chat.service';

const actorId = '11111111-1111-4111-8111-111111111111';
const conversationId = '22222222-2222-4222-8222-222222222222';
const request = { session: { user_id: actorId } } as unknown as RequestWithSession;
const service = {
  listMessages: vi.fn().mockResolvedValue([]),
  syncMessages: vi.fn().mockResolvedValue([]),
};
const controller = new ChatController(service as unknown as ChatService);
const query = vi.fn().mockResolvedValue({ rows: [] });
const repo = new PostgresChatRepository({ query } as unknown as Queryable);

beforeEach(() => vi.clearAllMocks());

describe('private chat message history page limit', () => {
  it('uses default 50 only when limit is absent', async () => {
    await expect(controller.listMessages(request, conversationId)).resolves.toEqual({ messages: [] });
    expect(service.listMessages).toHaveBeenCalledWith(actorId, conversationId, 50, undefined);
  });

  it.each(['1', '50', '100'])('accepts canonical page limit %s', async (raw) => {
    await controller.listMessages(request, conversationId, raw);
    expect(service.listMessages).toHaveBeenCalledWith(actorId, conversationId, Number(raw), undefined);
  });

  it.each(['', '0', '-1', '+1', '01', '2junk', '1e2', '1.5', ' 2', '2 ', '101', '9007199254740993', ['1', '2'], { x: 1 }])(
    'rejects invalid page limit %j before service or database access', async (raw) => {
      await expect(controller.listMessages(request, conversationId, raw as string)).rejects.toBeInstanceOf(BadRequestException);
      expect(service.listMessages).not.toHaveBeenCalled();
    },
  );
});

describe('private chat delta sync page limit', () => {
  it('uses default 100 only when limit is absent', async () => {
    await expect(controller.syncMessages(request, conversationId)).resolves.toEqual({ messages: [] });
    expect(service.syncMessages).toHaveBeenCalledWith(actorId, conversationId, '0', 100);
  });

  it.each(['1', '100', '200'])('accepts canonical sync limit %s', async (raw) => {
    await controller.syncMessages(request, conversationId, undefined, raw);
    expect(service.syncMessages).toHaveBeenCalledWith(actorId, conversationId, '0', Number(raw));
  });

  it.each(['', '0', '-1', '+1', '01', '2junk', '1e2', '1.5', ' 2', '2 ', '201', '9007199254740993', ['1', '2'], { x: 1 }])(
    'rejects invalid sync limit %j before service or database access', async (raw) => {
      await expect(controller.syncMessages(request, conversationId, undefined, raw as string)).rejects.toBeInstanceOf(BadRequestException);
      expect(service.syncMessages).not.toHaveBeenCalled();
    },
  );
});

describe('repository direct-call limit guard', () => {
  it.each([0, -1, 101, 1.5, Number.NaN, Number.POSITIVE_INFINITY, Number.MAX_SAFE_INTEGER + 1])(
    'rejects invalid history limit %s without issuing SQL', async (limit) => {
      await expect(repo.listMessages(actorId, conversationId, limit)).rejects.toBeInstanceOf(ChatInputError);
      expect(query).not.toHaveBeenCalled();
    },
  );

  it.each([0, -1, 201, 1.5, Number.NaN, Number.POSITIVE_INFINITY, Number.MAX_SAFE_INTEGER + 1])(
    'rejects invalid sync limit %s without issuing SQL', async (limit) => {
      await expect(repo.syncMessages(actorId, conversationId, 0, limit)).rejects.toBeInstanceOf(ChatInputError);
      expect(query).not.toHaveBeenCalled();
    },
  );
});

describe('private chat bigint cursor integrity', () => {
  it('preserves history cursor beyond JavaScript safe integer without rounding', async () => {
    await controller.listMessages(request, conversationId, '50', '9007199254740993');
    expect(service.listMessages).toHaveBeenCalledWith(actorId, conversationId, 50, '9007199254740993');
  });

  it('preserves the maximum PostgreSQL bigint delta cursor', async () => {
    await controller.syncMessages(request, conversationId, '9223372036854775807', '100');
    expect(service.syncMessages).toHaveBeenCalledWith(actorId, conversationId, '9223372036854775807', 100);
  });

  it.each(['', '0', '-1', '+1', '01', '2junk', '1e2', '1.5', ' 2', '2 ', '9223372036854775808', ['1', '2']])(
    'rejects malformed history cursor %j before service or database access', async (raw) => {
      await expect(controller.listMessages(request, conversationId, '50', raw as string)).rejects.toBeInstanceOf(BadRequestException);
      expect(service.listMessages).not.toHaveBeenCalled();
    },
  );

  it.each(['', '-1', '+1', '01', '2junk', '1e2', '1.5', ' 2', '2 ', '9223372036854775808', ['1', '2']])(
    'rejects malformed sync cursor %j before service or database access', async (raw) => {
      await expect(controller.syncMessages(request, conversationId, raw as string, '100')).rejects.toBeInstanceOf(BadRequestException);
      expect(service.syncMessages).not.toHaveBeenCalled();
    },
  );

  it('accepts canonical zero as a sync cursor', async () => {
    await controller.syncMessages(request, conversationId, '0', '100');
    expect(service.syncMessages).toHaveBeenCalledWith(actorId, conversationId, '0', 100);
  });

  it('passes exact bigint strings to PostgreSQL query bindings', async () => {
    await repo.listMessages(actorId, conversationId, 50, '9007199254740993');
    expect(query).toHaveBeenLastCalledWith(expect.stringContaining('private_chat_list_messages'),
      [actorId, conversationId, '9007199254740993', 50, 'before']);
    await repo.syncMessages(actorId, conversationId, '9007199254740993', 100);
    expect(query).toHaveBeenLastCalledWith(expect.stringContaining('private_chat_list_messages'),
      [actorId, conversationId, '9007199254740993', 100, 'after']);
  });
});


describe('repository direct-call cursor validation', () => {
  it('rejects unsafe numeric read receipts before SQL', async () => {
    await expect(repo.markAsRead(actorId, conversationId, Number('9007199254740993')))
      .rejects.toBeInstanceOf(ChatInputError);
    expect(query).not.toHaveBeenCalled();
  });

  it.each(['0', '01', '2junk', '9223372036854775808'])(
    'rejects invalid history cursor %s before SQL', async (raw) => {
      await expect(repo.listMessages(actorId, conversationId, 50, raw))
        .rejects.toBeInstanceOf(ChatInputError);
      expect(query).not.toHaveBeenCalled();
    },
  );

  it.each(['01', '2junk', '9223372036854775808'])(
    'rejects invalid delta cursor %s before SQL', async (raw) => {
      await expect(repo.syncMessages(actorId, conversationId, raw, 100))
        .rejects.toBeInstanceOf(ChatInputError);
      expect(query).not.toHaveBeenCalled();
    },
  );
});
