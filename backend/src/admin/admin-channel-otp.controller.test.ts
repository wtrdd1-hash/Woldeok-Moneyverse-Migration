import { GUARDS_METADATA } from '@nestjs/common/constants';
import { describe, expect, it, vi } from 'vitest';
import { AdminChannelOtpController } from './admin-channel-otp.controller';
import { FundedTreasuryDonationController } from './treasury/treasury.controller';
import { AdminSessionGuard } from '../auth/guards/admin-session.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { AdminChannelOtpService } from '../auth/admin-channel-otp.service';
import type { RequestWithSession } from '../auth/session.context';
import type { TreasuryService } from './treasury/treasury.service';

const request = {
  session: { id: 'session-one', user_id: 'superadmin-uuid' },
  adminRoles: ['superadmin'],
} as unknown as RequestWithSession;
const mint = {
  action: 'treasury_mint_topup' as const,
  amountWld: '1000000',
  reason: 'Treasury issuance approved',
  requestKey: '77e539ef-1019-4e6a-92c5-3d9b405ea609',
};
const salary = {
  action: 'treasury_salary_disburse' as const,
  targetAdminId: 'a9461a37-2780-4340-a312-8069c9570831',
  amountWld: '10000',
  reason: 'Operations salary authorization',
};
const otpCode = '123456';

describe('Admin channel OTP HTTP guard and Treasury enforcement', () => {
  it('requires a superadmin and full guard chain when requesting a bound code', async () => {
    const service = { requestOtp: vi.fn().mockResolvedValue({ success: true, expiresAt: Date.now() + 1000 }) };
    const controller = new AdminChannelOtpController(service as unknown as AdminChannelOtpService);
    await controller.requestOtp(request, mint);
    expect(service.requestOtp).toHaveBeenCalledWith('superadmin-uuid', 'session-one', mint);
    await expect(controller.requestOtp({ ...request, adminRoles: ['admin'] } as RequestWithSession, mint))
      .rejects.toThrow();
    expect(service.requestOtp).toHaveBeenCalledTimes(1);
    const routeGuards = Reflect.getMetadata(GUARDS_METADATA, controller.requestOtp) as unknown[];
    expect(routeGuards).toContain(AdminSessionGuard);
    expect(routeGuards).toContain(CsrfGuard);
  });

  it('refuses mint without a valid, intent-bound OTP before touching the financial service', async () => {
    const financial = { topupFromMintDirect: vi.fn().mockResolvedValue({ id: 'receipt' }) };
    const otp = { verifyOtp: vi.fn().mockReturnValue(false) };
    const controller = new FundedTreasuryDonationController(financial as unknown as TreasuryService, otp as unknown as AdminChannelOtpService);
    await expect(controller.topupFromMintDirect(request, { ...mint, otpCode }))
      .rejects.toThrow();
    expect(financial.topupFromMintDirect).not.toHaveBeenCalled();
    expect(otp.verifyOtp).toHaveBeenCalledWith('superadmin-uuid', 'session-one', mint, otpCode);
    otp.verifyOtp.mockReturnValue(true);
    await expect(controller.topupFromMintDirect(request, { ...mint, otpCode }))
      .resolves.toMatchObject({ ok: true });
    expect(financial.topupFromMintDirect).toHaveBeenCalledWith(
      'superadmin-uuid', mint.amountWld, mint.reason, mint.requestKey,
    );
  });

  it('refuses salary without a valid OTP and only executes the exact bound intent', async () => {
    const financial = { disburseAdminSalary: vi.fn().mockResolvedValue({ id: 'receipt' }) };
    const otp = { verifyOtp: vi.fn().mockReturnValue(false) };
    const controller = new FundedTreasuryDonationController(financial as unknown as TreasuryService, otp as unknown as AdminChannelOtpService);
    await expect(controller.disburseAdminSalary(request, { ...salary, otpCode }))
      .rejects.toThrow();
    expect(financial.disburseAdminSalary).not.toHaveBeenCalled();
    expect(otp.verifyOtp).toHaveBeenCalledWith('superadmin-uuid', 'session-one', salary, otpCode);
    otp.verifyOtp.mockReturnValue(true);
    await expect(controller.disburseAdminSalary(request, { ...salary, otpCode }))
      .resolves.toMatchObject({ ok: true });
    expect(financial.disburseAdminSalary).toHaveBeenCalledWith(
      'superadmin-uuid', salary.targetAdminId, salary.amountWld, salary.reason,
    );
  });

  it('enforces open admin console and CSRF at both money mutation endpoints', () => {
    const mintGuards = Reflect.getMetadata(GUARDS_METADATA, FundedTreasuryDonationController.prototype.topupFromMintDirect) as unknown[];
    const salaryGuards = Reflect.getMetadata(GUARDS_METADATA, FundedTreasuryDonationController.prototype.disburseAdminSalary) as unknown[];
    for (const guards of [mintGuards, salaryGuards]) {
      expect(guards).toContain(AdminSessionGuard);
      expect(guards).toContain(CsrfGuard);
    }
  });
});
