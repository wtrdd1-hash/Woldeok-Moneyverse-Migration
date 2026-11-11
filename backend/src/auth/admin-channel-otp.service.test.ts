import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AdminChannelOtpService } from './admin-channel-otp.service';
import type { TelegramAlertService } from '../telegram/telegram-alert.service';
import type { DiscordAlertService } from '../discord/discord-alert.service';

describe('AdminChannelOtpService (Telegram & Discord OTP Verification)', () => {
  let service: AdminChannelOtpService;
  let mockTelegram: Partial<TelegramAlertService>;
  let mockDiscord: Partial<DiscordAlertService>;

  beforeEach(() => {
    mockTelegram = {
      sendAlert: vi.fn().mockResolvedValue(true),
    };
    mockDiscord = {
      sendAdminDirectMessage: vi.fn().mockResolvedValue(true),
    };
    service = new AdminChannelOtpService(
      mockTelegram as TelegramAlertService,
      mockDiscord as DiscordAlertService,
    );
  });

  it('generates OTP and dispatches to both Telegram and Discord', async () => {
    const adminId = 'admin-user-uuid-1';
    const result = await service.requestOtp(adminId, '국고 1억 WLD 지출 승인');

    expect(result.success).toBe(true);
    expect(result.expiresAt).toBeGreaterThan(Date.now());
    expect(mockTelegram.sendAlert).toHaveBeenCalledTimes(1);
    expect(mockDiscord.sendAdminDirectMessage).toHaveBeenCalledTimes(1);
  });

  it('rejects OTP verification with wrong code', async () => {
    const adminId = 'admin-user-uuid-2';
    await service.requestOtp(adminId);

    const verified = service.verifyOtp(adminId, '000000');
    expect(verified).toBe(false);
  });

  it('successfully verifies correct code and consumes it for single-use', async () => {
    const adminId = 'admin-user-uuid-3';
    let interceptedCode = '';

    // Mock 디스코드 발송 내용에서 코드 가로채기
    (mockDiscord.sendAdminDirectMessage as any).mockImplementation((opts: any) => {
      const match = opts.description.match(/\[ (\d{6}) \]/);
      if (match) interceptedCode = match[1];
      return Promise.resolve(true);
    });

    await service.requestOtp(adminId, '테스트 승인');
    expect(interceptedCode).toHaveLength(6);

    // 1회차 검증: 성공
    const firstCheck = service.verifyOtp(adminId, interceptedCode);
    expect(firstCheck).toBe(true);

    // 2회차 재사용 시도: 이미 소모되었으므로 실패해야 함 (Replay Attack 차단)
    const secondCheck = service.verifyOtp(adminId, interceptedCode);
    expect(secondCheck).toBe(false);
  });

  it('elevates R2 session for 15 minutes upon correct OTP and reports status', async () => {
    const adminId = 'admin-user-uuid-4';
    let interceptedCode = '';
    (mockDiscord.sendAdminDirectMessage as any).mockImplementation((opts: any) => {
      const match = opts.description.match(/\[ (\d{6}) \]/);
      if (match) interceptedCode = match[1];
      return Promise.resolve(true);
    });

    await service.requestOtp(adminId, 'R2 페이지 진입 승격');
    expect(service.getR2ElevationStatus(adminId).elevated).toBe(false);

    // 정상 코드로 승격
    const res = service.elevateR2Session(adminId, interceptedCode);
    expect(res.success).toBe(true);
    expect(res.expiresAt).toBeDefined();

    const status = service.getR2ElevationStatus(adminId);
    expect(status.elevated).toBe(true);
    expect(status.remainingSeconds).toBeGreaterThan(800);
  });

  it('allows immediate revocation of R2 session for lockout', async () => {
    const adminId = 'admin-user-uuid-5';
    let interceptedCode = '';
    (mockDiscord.sendAdminDirectMessage as any).mockImplementation((opts: any) => {
      const match = opts.description.match(/\[ (\d{6}) \]/);
      if (match) interceptedCode = match[1];
      return Promise.resolve(true);
    });

    await service.requestOtp(adminId, 'R2 페이지 진입');
    service.elevateR2Session(adminId, interceptedCode);
    expect(service.getR2ElevationStatus(adminId).elevated).toBe(true);

    service.revokeR2Session(adminId);
    expect(service.getR2ElevationStatus(adminId).elevated).toBe(false);
  });

  it('dispatches test ping alerts to telegram and discord', async () => {
    const adminId = 'admin-user-uuid-6';
    const result = await service.sendTestPing(adminId, 'all');

    expect(result.success).toBe(true);
    expect(result.dispatchedTo).toEqual(['telegram', 'discord']);
    expect(mockTelegram.sendAlert).toHaveBeenCalled();
    expect(mockDiscord.sendAdminDirectMessage).toHaveBeenCalled();
  });
});
