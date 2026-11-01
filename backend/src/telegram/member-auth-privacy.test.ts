import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TelegramAlertService } from './telegram-alert.service';
import * as ssrfDefense from '../security/ssrf-defense';

const member = {
  userId: 'private-user-uuid', displayName: 'Sensitive Member', email: 'member@example.test',
  ipAddress: '203.0.113.99', userAgent: 'Sensitive Browser Agent',
};

describe('Telegram member-auth PII minimization', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    process.env.TELEGRAM_BOT_TOKEN = 'synthetic-token-not-real';
    process.env.TELEGRAM_CHAT_ID = 'synthetic-chat';
  });

  it('never dispatches a registration event without a verified-account contract', async () => {
    const fetch = vi.spyOn(ssrfDefense, 'safeFetch').mockResolvedValue({ ok: true, status: 200 } as never);
    const service = new TelegramAlertService();
    expect(await service.notifyUserRegister(member)).toBe(false);
    expect(await service.notifyUserRegistered(member)).toBe(false);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('never serializes raw member identifiers or untrusted request metadata to Telegram', async () => {
    const fetch = vi.spyOn(ssrfDefense, 'safeFetch').mockResolvedValue({ ok: true, status: 200 } as never);
    const service = new TelegramAlertService();
    expect(await service.notifyUserLogin(member)).toBe(true);
    expect(fetch).toHaveBeenCalledTimes(1);
    const body = JSON.parse(String(fetch.mock.calls[0]?.[1]?.body));
    for (const value of Object.values(member)) expect(body.text).not.toContain(value);
    expect(body.text).toContain('회원 로그인');
  });

  it('does not send a member event when transport is not configured', async () => {
    const fetch = vi.spyOn(ssrfDefense, 'safeFetch').mockResolvedValue({ ok: true, status: 200 } as never);
    const service = new TelegramAlertService();
    (service as unknown as { cachedBotToken: string | null }).cachedBotToken = null;
    (service as unknown as { cachedChatId: string | null }).cachedChatId = null;
    delete process.env.TELEGRAM_BOT_TOKEN;
    delete process.env.TELEGRAM_CHAT_ID;
    expect(await service.notifyUserLogin(member)).toBe(false);
    expect(fetch).not.toHaveBeenCalled();
  });
});
