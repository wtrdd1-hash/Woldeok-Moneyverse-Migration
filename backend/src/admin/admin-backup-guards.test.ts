import { GUARDS_METADATA } from '@nestjs/common/constants';
import { describe, expect, it } from 'vitest';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminSessionGuard } from '../auth/guards/admin-session.guard';
import { ReauthGuard } from '../auth/guards/reauth.guard';
import { AdminBackupController } from './admin-backup.controller';
describe('backup admin privileges', () => {
  it('requires administrator role and console for listing backups', () => {
    const guards = Reflect.getMetadata(GUARDS_METADATA, AdminBackupController) as unknown[];
    expect(guards).toContain(AdminGuard);
    expect(guards).toContain(AdminSessionGuard);
  });
  it('requires recent reauthentication to launch backup', () => {
    const guards = Reflect.getMetadata(GUARDS_METADATA, AdminBackupController.prototype.triggerBackup) as unknown[];
    expect(guards).toContain(ReauthGuard);
  });
});
