import { describe, expect, it } from 'vitest';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminBackupController } from './admin-backup.controller';

describe('admin backup ACL and evidence', () => {
  it('requires admin authorization for backup inventory and trigger', () => {
    const guards: unknown[] = Reflect.getMetadata(GUARDS_METADATA, AdminBackupController) ?? [];
    expect(guards).toContain(AdminGuard);
  });
  it('does not claim successful backup execution without durable completion evidence', async () => {
    const controller = new AdminBackupController();
    await expect(controller.triggerBackup()).rejects.toMatchObject({ status: 503 });
  });
});
