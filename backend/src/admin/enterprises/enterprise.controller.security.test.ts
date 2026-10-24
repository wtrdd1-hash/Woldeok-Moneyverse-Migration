import { GUARDS_METADATA } from '@nestjs/common/constants';
import { describe, expect, it } from 'vitest';
import { AdminSessionGuard } from '../../auth/guards/admin-session.guard';
import { CsrfGuard } from '../../auth/guards/csrf.guard';
import { ReauthGuard } from '../../auth/guards/reauth.guard';
import { AdminEnterpriseController } from './enterprise.controller';

describe('enterprise treasury mutation boundary', () => {
  it.each(['harvestSoeDividends', 'updateSoeStatus'] as const)(
    '%s requires elevated admin console, CSRF, and recent reauthentication',
    (method) => {
      const classGuards = (Reflect.getMetadata(GUARDS_METADATA, AdminEnterpriseController) as unknown[]) ?? [];
      const methodGuards = (Reflect.getMetadata(GUARDS_METADATA, AdminEnterpriseController.prototype[method]) as unknown[]) ?? [];
      expect(classGuards).toContain(AdminSessionGuard);
      expect(methodGuards).toContain(CsrfGuard);
      expect(methodGuards).toContain(ReauthGuard);
    },
  );
});
