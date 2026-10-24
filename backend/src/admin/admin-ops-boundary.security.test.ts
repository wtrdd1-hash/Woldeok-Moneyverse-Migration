import { GUARDS_METADATA } from '@nestjs/common/constants';
import { describe, expect, it } from 'vitest';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminSessionGuard } from '../auth/guards/admin-session.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { ReauthGuard } from '../auth/guards/reauth.guard';
import { AdminBackupController } from './admin-backup.controller';
import { ApiHealthController } from './api-health.controller';

function controllerGuards(controller: Function): unknown[] {
  return (Reflect.getMetadata(GUARDS_METADATA, controller) as unknown[]) ?? [];
}

function methodGuards(controller: Function, method: string): unknown[] {
  return (Reflect.getMetadata(GUARDS_METADATA, controller.prototype[method]) as unknown[]) ?? [];
}

describe('administrator operations boundary', () => {
  it.each([AdminBackupController, ApiHealthController])(
    '%s requires administrator role and an open console session',
    (controller) => {
      expect(controllerGuards(controller)).toContain(AdminGuard);
      expect(controllerGuards(controller)).toContain(AdminSessionGuard);
    },
  );

  it('requires CSRF and recent reauthentication before launching a backup', () => {
    expect(controllerGuards(AdminBackupController)).toContain(CsrfGuard);
    expect(methodGuards(AdminBackupController, 'triggerBackup')).toContain(ReauthGuard);
  });
});
