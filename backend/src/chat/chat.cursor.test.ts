import { BadRequestException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import type { RequestWithSession } from '../auth/session.context';
import { ChatController } from './chat.controller';
import type { ChatService } from './chat.service';
import { PostgresChatRepository } from './chat.repository';
import type { Queryable } from '../core/db';

const actor = '11111111-2222-4333-8444-555555555555';
const conversation = '22222222-3333-4444-8555-666666666666';
const request = { session: { user_id: actor } } as unknown as RequestWithSession;
const aboveSafe = '9007199254740993';

describe('private chat bigint sequence cursors', () => {
  it('preserves the exact 64-bit beforeSequence at the API boundary', async () => {
    const listMessages = vi.fn().mockResolvedValue([]);
    const controller = new ChatController({ listMessages } as unknown as ChatService);
    await controller.listMessages(request, conversation, '50', aboveSafe);
    expect(listMessages).toHaveBeenCalledWith(actor, conversation, 50, aboveSafe);
  });

  it('preserves the exact 64-bit sinceSequence for delta sync', async () => {
    const syncMessages = vi.fn().mockResolvedValue([]);
    const controller = new ChatController({ syncMessages } as unknown as ChatService);
    await controller.syncMessages(request, conversation, aboveSafe, '100');
    expect(syncMessages).toHaveBeenCalledWith(actor, conversation, aboveSafe, 100);
  });

  it.each(['12junk', '-1', '1.5', '9'.repeat(30), '0003', '1e3'])('rejects malformed cursor %s rather than silently coercing', async (cursor) => {
    const listMessages = vi.fn().mockResolvedValue([]);
    const controller = new ChatController({ listMessages } as unknown as ChatService);
    await expect(controller.listMessages(request, conversation, '50', cursor)).rejects.toThrow(BadRequestException);
    expect(listMessages).not.toHaveBeenCalled();
  });

  it('rejects unsafe JSON number read receipts instead of rounding them', async () => {
    const markAsRead = vi.fn();
    const controller = new ChatController({ markAsRead } as unknown as ChatService);
    await expect(controller.markAsRead(request, conversation, { sequence: Number(aboveSafe) })).rejects.toThrow(BadRequestException);
    expect(markAsRead).not.toHaveBeenCalled();
  });

  it('accepts a string read receipt beyond the JavaScript safe integer range', async () => {
    const markAsRead = vi.fn().mockResolvedValue({ lastReadSequence: aboveSafe });
    const controller = new ChatController({ markAsRead } as unknown as ChatService);
    await controller.markAsRead(request, conversation, { sequence: aboveSafe });
    expect(markAsRead).toHaveBeenCalledWith(actor, conversation, aboveSafe);
  });

  it('refuses an out-of-range cursor before issuing any database query', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [] });
    const repository = new PostgresChatRepository({ query } as unknown as Queryable);
    await expect(repository.syncMessages(actor, conversation, '9223372036854775808' as unknown as number)).rejects.toThrow();
    expect(query).not.toHaveBeenCalled();
  });

  it('keeps exact cursor strings in parameterized PostgreSQL queries', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [] });
    const repository = new PostgresChatRepository({ query } as unknown as Queryable);
    await repository.listMessages(actor, conversation, 50, aboveSafe as unknown as number);
    expect(query.mock.calls[0]?.[1]?.[2]).toBe(aboveSafe);
    await repository.syncMessages(actor, conversation, aboveSafe as unknown as number, 50);
    expect(query.mock.calls[1]?.[1]?.[2]).toBe(aboveSafe);
  });
});
