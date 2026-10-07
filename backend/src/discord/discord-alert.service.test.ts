import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { DiscordAlertService } from './discord-alert.service';
import type { Pool } from 'pg';
import * as ssrfDefense from '../security/ssrf-defense';

describe('DiscordAlertService Direct Message', () => {
  let service: DiscordAlertService;
  const mockPool = {} as Pool;
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      DISCORD_BOT_TOKEN: 'mock-bot-token',
      DISCORD_ADMIN_ALERT_USER_ID: '886478189520637992',
    };
    service = new DiscordAlertService(mockPool);
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it('resolves configured admin user id correctly', () => {
    expect(service.getAdminUserId()).toBe('886478189520637992');
  });

  it('fails gracefully when DISCORD_BOT_TOKEN is missing', async () => {
    delete process.env.DISCORD_BOT_TOKEN;
    const result = await service.sendAdminDirectMessage({
      title: 'Test',
      color: 0x10b981,
    });
    expect(result.success).toBe(false);
    expect(result.error).toBe('DISCORD_BOT_TOKEN_NOT_CONFIGURED');
  });

  it('opens a DM channel and delivers the message embed', async () => {
    const fetchSpy = vi.spyOn(ssrfDefense, 'safeFetch').mockImplementation(async (url) => {
      const urlStr = String(url);
      if (urlStr.includes('/users/@me/channels')) {
        return new Response(JSON.stringify({ id: 'dm-channel-12345' }), { status: 200 });
      }
      if (urlStr.includes('/channels/dm-channel-12345/messages')) {
        return new Response(JSON.stringify({ id: 'msg-999' }), { status: 200 });
      }
      return new Response('Not Found', { status: 404 });
    });

    const result = await service.sendAdminDirectMessage({
      title: '🚨 긴급 알림',
      description: '중요 정보 발생',
      color: 0xef4444,
    });

    expect(result.success).toBe(true);
    expect(result.channelId).toBe('dm-channel-12345');
    expect(fetchSpy).toHaveBeenCalledTimes(2);

    // 두 번째 호출 시 DM 채널 캐시 활용 검증
    const secondResult = await service.sendAdminDirectMessage({
      title: '두 번째 알림',
      color: 0x3b82f6,
    });
    expect(secondResult.success).toBe(true);
    expect(fetchSpy).toHaveBeenCalledTimes(3); // 채널 개설 API 없이 메시지만 발송
  });
});
