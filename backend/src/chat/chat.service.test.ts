import { describe, expect, it, vi } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { ChatService } from './chat.service';
import type { PostgresChatRepository } from './chat.repository';

describe('ChatService', () => {
  const mockRepo = {
    openConversation: vi.fn(),
    sendMessage: vi.fn(),
    markAsRead: vi.fn(),
    listConversations: vi.fn(),
    listMessages: vi.fn(),
    archiveConversation: vi.fn(),
    totalUnreadCount: vi.fn(),
  } as unknown as PostgresChatRepository;

  const service = new ChatService(mockRepo);

  it('rejects opening conversation with oneself', async () => {
    const userId = '11111111-1111-1111-1111-111111111111';
    await expect(service.openConversation(userId, userId)).rejects.toThrow(BadRequestException);
  });

  it('sanitizes ASCII control characters from message body', async () => {
    const actorId = '11111111-1111-1111-1111-111111111111';
    const convId = '22222222-2222-2222-2222-222222222222';
    const key = '33333333-3333-3333-3333-333333333333';
    const rawBody = '안녕\x00하세요\x07반갑습니다!';

    vi.mocked(mockRepo.sendMessage).mockResolvedValueOnce({
      message_id: '44444444-4444-4444-4444-444444444444',
      sequence: '1',
      body: '안녕하세요반갑습니다!',
      created_at: new Date(),
    });

    const result = await service.sendMessage(actorId, convId, key, rawBody);
    expect(mockRepo.sendMessage).toHaveBeenCalledWith(actorId, convId, key, '안녕하세요반갑습니다!');
    expect(result.sequence).toBe('1');
  });

  it('rejects empty or whitespace-only messages', async () => {
    const actorId = '11111111-1111-1111-1111-111111111111';
    const convId = '22222222-2222-2222-2222-222222222222';
    const key = '33333333-3333-3333-3333-333333333333';

    await expect(service.sendMessage(actorId, convId, key, '   ')).rejects.toThrow(BadRequestException);
  });

  it('returns messages in chronological order', async () => {
    const actorId = '11111111-1111-1111-1111-111111111111';
    const convId = '22222222-2222-2222-2222-222222222222';

    // repo returns descending (latest first)
    vi.mocked(mockRepo.listMessages).mockResolvedValueOnce([
      { id: '2', conversation_id: convId, sender_id: actorId, sequence: '2', body: '둘째', created_at: new Date(), is_mine: true },
      { id: '1', conversation_id: convId, sender_id: actorId, sequence: '1', body: '첫째', created_at: new Date(), is_mine: true },
    ]);

    const messages = await service.listMessages(actorId, convId);
    expect(messages[0].sequence).toBe('1');
    expect(messages[1].sequence).toBe('2');
  });

  it('delegates markAsRead to repository', async () => {
    const actorId = '11111111-1111-1111-1111-111111111111';
    const convId = '22222222-2222-2222-2222-222222222222';

    vi.mocked(mockRepo.markAsRead).mockResolvedValueOnce('5');

    const result = await service.markAsRead(actorId, convId, 5);
    expect(result.lastReadSequence).toBe('5');
    expect(mockRepo.markAsRead).toHaveBeenCalledWith(actorId, convId, 5);
  });
});
