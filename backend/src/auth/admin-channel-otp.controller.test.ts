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
    elevateR2Session: ReturnType<typeof vi.fn>;
    getR2ElevationStatus: ReturnType<typeof vi.fn>;
    revokeR2Session: ReturnType<typeof vi.fn>;
    sendTestPing: ReturnType<typeof vi.fn>;
  };

  const fakeReq = {
    session: { user_id: 'admin-1234' },
  } as unknown as RequestWithSession;

  beforeEach(() => {
    mockOtpService = {
      requestOtp: vi.fn().mockResolvedValue({ success: true, expiresAt: Date.now() + 300000 }),
      verifyOtp: vi.fn(),
      elevateR2Session: vi.fn(),
      getR2ElevationStatus: vi.fn(),
      revokeR2Session: vi.fn(),
      sendTestPing: vi.fn(),
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

  it('elevate 성공 시 15분 세션 승격 성공을 반환해야 한다', async () => {
    const expiresAt = Date.now() + 900000;
    mockOtpService.elevateR2Session.mockReturnValue({ success: true, expiresAt });
    const res = await controller.elevate(fakeReq, { otpCode: '123456' });
    expect(res.ok).toBe(true);
    expect(res.elevated).toBe(true);
    expect(res.expiresAt).toBe(expiresAt);
  });

  it('elevate 실패 시 UnauthorizedException을 발생시켜야 한다', async () => {
    mockOtpService.elevateR2Session.mockReturnValue({ success: false });
    await expect(controller.elevate(fakeReq, { otpCode: 'wrong' })).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('status 조회 시 현재 승격 상태를 반환해야 한다', async () => {
    mockOtpService.getR2ElevationStatus.mockReturnValue({ elevated: true, remainingSeconds: 850, expiresAt: 123456789 });
    const res = await controller.status(fakeReq);
    expect(res.ok).toBe(true);
    expect(res.elevated).toBe(true);
    expect(res.remainingSeconds).toBe(850);
  });

  it('revoke 호출 시 세션 잠금을 수행해야 한다', async () => {
    mockOtpService.revokeR2Session.mockReturnValue({ success: true });
    const res = await controller.revoke(fakeReq);
    expect(res.ok).toBe(true);
    expect(res.revoked).toBe(true);
  });

  it('testPing 호출 시 메신저 핑 발송 결과를 반환해야 한다', async () => {
    mockOtpService.sendTestPing.mockResolvedValue({ success: true, dispatchedTo: ['telegram', 'discord'] });
    const res = await controller.testPing(fakeReq, { channel: 'all' });
    expect(res.ok).toBe(true);
    expect(res.dispatchedTo).toEqual(['telegram', 'discord']);
  });
});
