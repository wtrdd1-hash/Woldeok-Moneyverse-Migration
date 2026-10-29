import { describe, expect, it, vi } from 'vitest';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import type { RequestWithSession } from '../auth/session.context';

describe('NotificationController', () => {
  const mockService = {
    listNotifications: vi.fn().mockResolvedValue([{ id: 'n1', title: '시스템 공지' }]),
    unreadCount: vi.fn().mockResolvedValue(3),
    markRead: vi.fn().mockResolvedValue(true),
    markAllRead: vi.fn().mockResolvedValue(3),
    searchNotifications: vi.fn().mockResolvedValue({ items: [], hasMore: false, nextCursor: null, asOfUtc: '2026-10-29T00:00:00Z' }),
  } as unknown as NotificationService;

  const controller = new NotificationController(mockService);
  const mockReq = {
    session: {
      id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      user_id: '11111111-1111-4111-8111-111111111111',
    },
  } as unknown as RequestWithSession;

  it('listNotifications returns notifications list', async () => {
    const result = await controller.listNotifications(mockReq, {});
    expect(result).toHaveLength(1);
    expect(mockService.listNotifications).toHaveBeenCalledWith('11111111-1111-4111-8111-111111111111', {});
  });


  it('searchNotifications binds the authenticated actor and session, not client-provided user IDs', async () => {
    const body = { query: '은행', fromUtc: '2026-10-01T00:00:00.000Z', toUtc: '2026-10-30T00:00:00.000Z' };
    await controller.searchNotifications(mockReq, body);
    expect(mockService.searchNotifications).toHaveBeenCalledWith(
      '11111111-1111-4111-8111-111111111111',
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', body,
    );
  });

  it('unreadCount returns unreadCount object', async () => {
    const result = await controller.unreadCount(mockReq);
    expect(result).toEqual({ unreadCount: 3 });
  });
});
