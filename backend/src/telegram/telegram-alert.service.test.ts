import { describe, expect, it, vi, beforeEach } from 'vitest';
import { TelegramAlertService } from './telegram-alert.service';
import * as ssrfDefense from '../security/ssrf-defense';

describe('TelegramAlertService', () => {
  let service: TelegramAlertService;

  beforeEach(() => {
    vi.restoreAllMocks();
    service = new TelegramAlertService();
    process.env.TELEGRAM_BOT_TOKEN = '123456789:ABCdefGHIjklMNOpqrSTUvwxYZ_1234567';
    process.env.TELEGRAM_CHAT_ID = '987654321';
  });

  it('formats precise KST timestamp with seconds in [YYYY-MM-DD HH:MM:SS KST] format', () => {
    const fixedDate = new Date('2026-10-31T14:05:15Z'); // 23:05:15 KST
    const formatted = service.formatKstTimestamp(fixedDate);
    expect(formatted).toBe('［2026-10-31 23:05:15 KST］');
  });

  it('redacts tokens and sensitive parameters from alert messages', () => {
    const raw = 'Auth error with token 123456789:ABCdefGHIjklMNOpqrSTUvwxYZ_1234567 and password: secret_pass_123';
    const redacted = service.redact(raw);
    expect(redacted).not.toContain('123456789:ABCdefGHIjklMNOpqrSTUvwxYZ_1234567');
    expect(redacted).not.toContain('secret_pass_123');
    expect(redacted).toContain('[REDACTED_TOKEN]');
    expect(redacted).toContain('password=[REDACTED]');
  });

  it('sends treasury grant alert formatted with timestamp header', async () => {
    const fetchSpy = vi.spyOn(ssrfDefense, 'safeFetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ ok: true, result: { message_id: 42 } }),
    } as any);

    const sent = await service.notifyTreasuryGrant({
      action: 'APPROVE',
      grantId: 'grant-uuid-1',
      applicant: 'test-user',
      amount: 50000,
      purpose: '길드 지원금',
      reviewer: 'admin-super',
    });

    expect(sent).toBe(true);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const callArgs = fetchSpy.mock.calls[0];
    expect(callArgs[0]).toContain('/bot123456789:ABCdefGHIjklMNOpqrSTUvwxYZ_1234567/sendMessage');
    const body = JSON.parse(callArgs[1]?.body as string);
    expect(body.chat_id).toBe('987654321');
    expect(body.text).toMatch(/^［\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} KST］/);
    expect(body.text).toContain('국고 보조금 승인 및 지급 완료');
    expect(body.text).toContain('50,000 WLD');
    expect(body.text).toContain('길드 지원금');
  });

  it('sends admin login alert with IP and authentication details', async () => {
    const fetchSpy = vi.spyOn(ssrfDefense, 'safeFetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ ok: true }),
    } as any);

    const sent = await service.notifyAdminLogin({
      adminId: 'admin-1',
      email: 'admin@easy-scraping.com',
      ip: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      method: 'TOTP',
    });

    expect(sent).toBe(true);
    const body = JSON.parse(fetchSpy.mock.calls[0][1]?.body as string);
    expect(body.text).toContain('관리자 콘솔 접속 & 인증 완료');
    expect(body.text).toContain('2FA/TOTP 스텝업 인증');
    expect(body.text).toContain('192.168.1.100');
  });

  it('sends casino jackpot alert with game and win multiplier', async () => {
    const fetchSpy = vi.spyOn(ssrfDefense, 'safeFetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ ok: true }),
    } as any);

    const sent = await service.notifyCasinoJackpot({
      game: 'CYBER_SLOTS_777',
      username: 'lucky_winner',
      betAmount: 100,
      winAmount: 77700,
      multiplier: 777,
    });

    expect(sent).toBe(true);
    const body = JSON.parse(fetchSpy.mock.calls[0][1]?.body as string);
    expect(body.text).toContain('카지노 잭팟 대박 당첨');
    expect(body.text).toContain('77,700 WLD');
    expect(body.text).toContain('777x');
  });

  it('fails gracefully without throwing when Telegram API returns error', async () => {
    vi.spyOn(ssrfDefense, 'safeFetch').mockRejectedValueOnce(new Error('Network timeout'));

    const result = await service.sendAlert('Test', ['Line 1']);
    expect(result).toBe(false);
  });
});
