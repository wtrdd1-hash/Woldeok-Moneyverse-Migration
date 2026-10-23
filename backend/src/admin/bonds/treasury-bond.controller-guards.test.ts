import { GUARDS_METADATA } from '@nestjs/common/constants';
import { describe, expect, it } from 'vitest';
import { AdminSessionGuard } from '../../auth/guards/admin-session.guard';
import { CsrfGuard } from '../../auth/guards/csrf.guard';
import { ReauthGuard } from '../../auth/guards/reauth.guard';
import { AdminTreasuryBondController } from './treasury-bond.controller';

describe('admin bond settlement and configuration guard boundary', () => {
  it.each(['distributeCoupons', 'updateStatus'] as const)(
    '%s requires elevated admin session, one-time CSRF and recent reauthentication',
    (method) => {
      const classGuards = (Reflect.getMetadata(GUARDS_METADATA, AdminTreasuryBondController) as unknown[]) ?? [];
      const methodGuards = (Reflect.getMetadata(GUARDS_METADATA, AdminTreasuryBondController.prototype[method]) as unknown[]) ?? [];
      expect(classGuards).toContain(AdminSessionGuard);
      expect(methodGuards).toContain(CsrfGuard);
      expect(methodGuards).toContain(ReauthGuard);
    },
  );
});
