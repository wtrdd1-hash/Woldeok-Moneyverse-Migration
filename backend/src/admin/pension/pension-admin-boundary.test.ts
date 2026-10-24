import 'reflect-metadata';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { describe, expect, it, vi } from 'vitest';
import { AdminSessionGuard } from '../../auth/guards/admin-session.guard';
import { CsrfGuard } from '../../auth/guards/csrf.guard';
import { ReauthGuard } from '../../auth/guards/reauth.guard';
import type { SessionRepository } from '../../auth/session.repository';
import { AdminNationalPensionController } from './national-pension.controller';

describe('P0 pension manual payout admin boundary', () => {
  it('keeps the admin console guard for reads and payout requests', () => {
    expect(Reflect.getMetadata(GUARDS_METADATA, AdminNationalPensionController)).toContain(AdminSessionGuard);
  });

  it('requires CSRF and fresh reauthentication before the payout handler runs', () => {
    expect(Reflect.getMetadata(
      GUARDS_METADATA,
      AdminNationalPensionController.prototype.distributePayouts,
    )).toEqual([CsrfGuard, ReauthGuard]);
  });

  it('denies absent CSRF and expired reauthentication', async () => {
    const sessions = {
      verifyCsrf: vi.fn().mockResolvedValue(false),
      hasRecentReauthentication: vi.fn().mockResolvedValue(false),
    } as unknown as SessionRepository;
    const request = { method: 'POST', headers: {}, session: { id: 'session-id' } };
    const context = { switchToHttp: () => ({ getRequest: () => request }) } as unknown as ExecutionContext;
    await expect(new CsrfGuard(sessions).canActivate(context)).rejects.toBeInstanceOf(ForbiddenException);
    await expect(new ReauthGuard(sessions).canActivate(context)).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
