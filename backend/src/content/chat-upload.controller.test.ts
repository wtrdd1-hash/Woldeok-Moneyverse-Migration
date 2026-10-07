import { describe, expect, it, vi, beforeEach } from 'vitest';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { Response } from 'express';
import { ChatUploadController } from './chat-upload.controller';
import { AntivirusThreatError } from './antivirus-scanner.service';
import type { ChatImageStorage } from './chat-image-storage';
import type { DiscordAlertService } from '../discord/discord-alert.service';
import type { RequestWithSession } from '../auth/session.context';

describe('ChatUploadController', () => {
  let controller: ChatUploadController;
  let mockStorage: Partial<ChatImageStorage>;
  let mockDiscordAlert: Partial<DiscordAlertService>;

  beforeEach(() => {
    mockStorage = {
      save: vi.fn(),
      read: vi.fn(),
    };
    mockDiscordAlert = {
      sendAdminDirectMessage: vi.fn().mockResolvedValue(true),
    };
    controller = new ChatUploadController(
      mockStorage as ChatImageStorage,
      mockDiscordAlert as DiscordAlertService,
    );
  });

  it('파일이 전달되지 않은 경우 BadRequestException을 던진다', async () => {
    const req = { session: { user_id: 'user_1' } } as RequestWithSession;
    await expect(controller.uploadChatImage(req, undefined)).rejects.toThrow(BadRequestException);
  });

  it('정상 파일 업로드 시 성공 응답을 반환한다', async () => {
    const req = { session: { user_id: 'user_1' } } as RequestWithSession;
    const file = {
      buffer: Buffer.from('image-data'),
      originalname: 'clean.png',
      size: 10,
      mimetype: 'image/png',
    };

    vi.mocked(mockStorage.save!).mockResolvedValue({
      storageKey: 'chat_123.png',
      mimeType: 'image/png',
      width: 100,
      height: 100,
      size: 10,
      url: '/api/v1/content/chat/media/chat_123.png',
    });

    const res = await controller.uploadChatImage(req, file);
    expect(res.success).toBe(true);
    expect(res.storageKey).toBe('chat_123.png');
    expect(res.url).toBe('/api/v1/content/chat/media/chat_123.png');
  });

  it('바이러스 감지(AntivirusThreatError) 시 관리자 디스코드 알림을 트리거하고 BadRequestException을 던진다', async () => {
    const req = { session: { user_id: 'bad_actor' } } as RequestWithSession;
    const file = {
      buffer: Buffer.from('malicious-payload'),
      originalname: 'trojan.png',
      size: 17,
      mimetype: 'image/png',
    };

    vi.mocked(mockStorage.save!).mockRejectedValue(
      new AntivirusThreatError('EICAR_TEST_VIRUS', '테스트 바이러스 감지'),
    );

    await expect(controller.uploadChatImage(req, file)).rejects.toThrow(BadRequestException);
    expect(mockDiscordAlert.sendAdminDirectMessage).toHaveBeenCalledTimes(1);
    expect(mockDiscordAlert.sendAdminDirectMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        title: expect.stringContaining('보안 경보'),
      }),
    );
  });

  it('존재하지 않는 미디어 요청 시 NotFoundException을 던진다', async () => {
    vi.mocked(mockStorage.read!).mockResolvedValue(null);
    const mockRes = {
      setHeader: vi.fn(),
      end: vi.fn(),
    } as unknown as Response;

    await expect(controller.getChatMedia('non_existent.png', mockRes)).rejects.toThrow(NotFoundException);
  });
});
