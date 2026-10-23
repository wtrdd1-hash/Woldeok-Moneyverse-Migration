import { GUARDS_METADATA } from '@nestjs/common/constants';
import { describe, expect, it } from 'vitest';
import { AdminSessionGuard } from '../../auth/guards/admin-session.guard';
import { CsrfGuard } from '../../auth/guards/csrf.guard';
import { ReauthGuard } from '../../auth/guards/reauth.guard';
import { AdminNationalPensionController } from './national-pension.controller';

describe('pension payout authorization boundary', () => {
  it('requires an elevated console, one-time CSRF, and recent reauthentication before mass payouts', () => {
    const classGuards = (Reflect.getMetadata(GUARDS_METADATA, AdminNationalPensionController) as unknown[]) ?? [];
    const methodGuards = (Reflect.getMetadata(
      GUARDS_METADATA,
      AdminNationalPensionController.prototype.distributePayouts,
    ) as unknown[]) ?? [];
    expect(classGuards).toContain(AdminSessionGuard);
    expect(methodGuards).toContain(CsrfGuard);
    expect(methodGuards).toContain(ReauthGuard);
  });
});
