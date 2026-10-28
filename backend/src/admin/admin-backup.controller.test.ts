import fs from 'node:fs';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminSessionGuard } from '../auth/guards/admin-session.guard';
import { AdminBackupController } from './admin-backup.controller';

afterEach(() => vi.restoreAllMocks());

describe('backup admin boundary', () => {
  it('requires administrator role and an open admin console session on every route', () => {
    const guards: unknown[] = Reflect.getMetadata(GUARDS_METADATA, AdminBackupController) ?? [];
    expect(guards).toContain(AdminGuard);
    expect(guards).toContain(AdminSessionGuard);
  });

  it('never launches the unsafe manual backup script; refuses with 503', async () => {
    // Force legacy code down its missing-script path: never let a test spawn a real backup.
    vi.spyOn(fs, 'existsSync').mockReturnValue(false);
    const controller = new AdminBackupController();
    await expect(controller.triggerBackup()).rejects.toMatchObject({ status: 503 });
  });

  it('returns only unverified local file candidates, never a restore-verified badge', async () => {
    vi.spyOn(fs, 'existsSync').mockReturnValue(true);
    vi.spyOn(fs, 'readdirSync').mockReturnValue(['snapshot.sql.gz'] as never);
    vi.spyOn(fs, 'statSync').mockReturnValue({ size: 1024, mtime: new Date('2026-10-29T00:00:00Z') } as never);
    const inventory = await new AdminBackupController().getBackupStatus();
    expect(inventory.totalBackups).toBe(1);
    expect(inventory.files[0]?.status).toBe('PENDING');
  });

  it('refuses missing inventory rather than inventing zero verified backups or creating folders', async () => {
    vi.spyOn(fs, 'existsSync').mockReturnValue(false);
    const mkdir = vi.spyOn(fs, 'mkdirSync').mockImplementation(() => undefined);
    const controller = new AdminBackupController();
    await expect(controller.getBackupStatus()).rejects.toMatchObject({ status: 503 });
    expect(mkdir).not.toHaveBeenCalled();
  });
});
