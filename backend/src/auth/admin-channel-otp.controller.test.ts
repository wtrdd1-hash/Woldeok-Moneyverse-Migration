import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AdminChannelOtpController } from './admin-channel-otp.controller';
import { AdminChannelOtpService } from './admin-channel-otp.service';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import type { RequestWithSession } from './session.context';

describe('AdminChannelOtpController', () => {
  let controller: AdminChannelOtpController;
  let mockOtpService: {
    requestOtp: ReturnType<typeof vi.fn>;
    verifyOtp: ReturnType<typeof vi.fn>;
  };

  const fakeReq = {
    session: { user_id: 'admin-1234' },
  } as unknown as RequestWithSession;

  beforeEach(() => {
    mockOtpService = {
      requestOtp: vi.fn().mockResolvedValue({ success: true, expiresAt: Date.now() + 300000 }),
      verifyOtp: vi.fn(),
    };
    controller = new AdminChannelOtpController(mockOtpService as unknown as AdminChannelOtpService);
  });

  it('요청 시 OTP 서비스를 호출하고 성공 응답을 반환해야 한다', async () => {
    const res = await controller.requestOtp(fakeReq, { actionName: '테스트 작업' });
    expect(res.ok).toBe(true);
    expect(mockOtpService.requestOtp).toHaveBeenCalledWith('admin-1234', '테스트 작업');
  });

  it('올바른 OTP 코드 검증 시 verified: true를 반환해야 한다', async () => {
    mockOtpService.verifyOtp.mockReturnValue(true);
    const res = await controller.verifyOtp(fakeReq, { otpCode: '123456' });
    expect(res.ok).toBe(true);
    expect(res.verified).toBe(true);
    expect(mockOtpService.verifyOtp).toHaveBeenCalledWith('admin-1234', '123456');
  });

  it('불일치 또는 만료된 OTP 코드 시 UnauthorizedException을 발생시켜야 한다', async () => {
    mockOtpService.verifyOtp.mockReturnValue(false);
    await expect(controller.verifyOtp(fakeReq, { otpCode: '999999' })).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('otpCode 미입력 시 BadRequestException을 발생시켜야 한다', async () => {
    await expect(controller.verifyOtp(fakeReq, { otpCode: '' })).rejects.toThrow(
      BadRequestException,
    );
  });
});
