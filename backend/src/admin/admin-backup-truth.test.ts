import 'reflect-metadata';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { describe, expect, it } from 'vitest';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminSessionGuard } from '../auth/guards/admin-session.guard';
import { ReauthGuard } from '../auth/guards/reauth.guard';
import { AdminBackupController } from './admin-backup.controller';

describe('admin backup evidence and authorization', () => {
  it('requires an administrator role and open console for backup inventory and triggering', () => {
    const guards = (Reflect.getMetadata(GUARDS_METADATA, AdminBackupController) as unknown[]) ?? [];
    expect(guards).toContain(AdminGuard);
    expect(guards).toContain(AdminSessionGuard);
    const triggerGuards = (Reflect.getMetadata(GUARDS_METADATA, AdminBackupController.prototype.triggerBackup) as unknown[]) ?? [];
    expect(triggerGuards).toContain(ReauthGuard);
  });

  it('never labels a file verified merely because it exists', async () => {
    const result = await new AdminBackupController().getBackupStatus();
    expect(result.files.every((file) => file.status !== 'VERIFIED')).toBe(true);
    if (!result.r2Configured) expect(result.r2Bucket).toBeNull();
  });
});
