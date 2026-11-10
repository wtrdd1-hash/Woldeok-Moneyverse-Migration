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
      sendDirectAlert: vi.fn().mockResolvedValue(true),
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
    expect(mockTelegram.sendDirectAlert).toHaveBeenCalledTimes(1);
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
});
