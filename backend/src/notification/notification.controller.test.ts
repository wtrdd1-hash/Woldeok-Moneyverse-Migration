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
  } as unknown as NotificationService;

  const controller = new NotificationController(mockService);
  const mockReq = {
    session: {
      user_id: '11111111-1111-4111-8111-111111111111',
    },
  } as unknown as RequestWithSession;

  it('listNotifications returns notifications list', async () => {
    const result = await controller.listNotifications(mockReq, {});
    expect(result).toHaveLength(1);
    expect(mockService.listNotifications).toHaveBeenCalledWith('11111111-1111-4111-8111-111111111111', {});
  });

  it('unreadCount returns unreadCount object', async () => {
    const result = await controller.unreadCount(mockReq);
    expect(result).toEqual({ unreadCount: 3 });
  });
});
