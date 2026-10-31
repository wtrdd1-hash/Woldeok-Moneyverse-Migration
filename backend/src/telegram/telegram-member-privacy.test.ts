import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TelegramAlertService } from './telegram-alert.service';
import * as ssrfDefense from '../security/ssrf-defense';

vi.mock('node:fs', () => ({
  existsSync: vi.fn(() => false),
  readFileSync: vi.fn(() => ''),
}));

describe('member alert destination approval and minimization', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    delete process.env.TELEGRAM_MEMBER_LOGIN_ALERTS_APPROVED;
    process.env.TELEGRAM_BOT_TOKEN = 'fake-test-transport';
    process.env.TELEGRAM_CHAT_ID = '123456789';
  });

  afterEach(() => {
    delete process.env.TELEGRAM_MEMBER_LOGIN_ALERTS_APPROVED;
    delete process.env.TELEGRAM_BOT_TOKEN;
    delete process.env.TELEGRAM_CHAT_ID;
  });

  it('defaults to no member alert even when a destination is configured', async () => {
    const fetchSpy = vi.spyOn(ssrfDefense, 'safeFetch');
    expect(await new TelegramAlertService().notifyUserLogin({
      userId: 'private-id', ipAddress: '203.0.113.99', consentCurrent: true,
    })).toBe(false);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('never transmits unverified registration PII even with login approval', async () => {
    process.env.TELEGRAM_MEMBER_LOGIN_ALERTS_APPROVED = 'true';
    const fetchSpy = vi.spyOn(ssrfDefense, 'safeFetch');
    expect(await new TelegramAlertService().notifyUserRegistered({
      email: 'private@example.test', displayName: 'PRIVATE-NAME',
    })).toBe(false);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('refuses direct member login notification without current consent', async () => {
    process.env.TELEGRAM_MEMBER_LOGIN_ALERTS_APPROVED = 'true';
    const fetchSpy = vi.spyOn(ssrfDefense, 'safeFetch');
    expect(await new TelegramAlertService().notifyUserLogin({ userId: 'private-id', consentCurrent: false })).toBe(false);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('sends only a generic login event with approval and no personal data', async () => {
    process.env.TELEGRAM_MEMBER_LOGIN_ALERTS_APPROVED = 'true';
    const fetchSpy = vi.spyOn(ssrfDefense, 'safeFetch').mockResolvedValueOnce({
      ok: true, status: 200,
    } as unknown as Response);
    expect(await new TelegramAlertService().notifyUserLogin({
      userId: 'private-uuid', displayName: 'PRIVATE-NAME',
      email: 'private@example.test', ipAddress: '203.0.113.99',
      userAgent: 'PRIVATE-DEVICE-FINGERPRINT', consentCurrent: true,
    })).toBe(true);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const body = JSON.parse(fetchSpy.mock.calls[0][1]?.body as string);
    expect(body.text).toContain('회원 로그인 감지');
    for (const secret of [
      'private-uuid', 'PRIVATE-NAME', 'private@example.test',
      '203.0.113.99', 'PRIVATE-DEVICE-FINGERPRINT',
    ]) {
      expect(body.text).not.toContain(secret);
    }
  });

  it('does not send when transport is unconfigured even if approved', async () => {
    process.env.TELEGRAM_MEMBER_LOGIN_ALERTS_APPROVED = 'true';
    delete process.env.TELEGRAM_BOT_TOKEN;
    delete process.env.TELEGRAM_CHAT_ID;
    const fetchSpy = vi.spyOn(ssrfDefense, 'safeFetch');
    expect(await new TelegramAlertService().notifyUserLogin({ userId: 'private-id', consentCurrent: true })).toBe(false);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
