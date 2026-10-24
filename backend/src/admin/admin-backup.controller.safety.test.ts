import { afterEach, describe, expect, it, vi } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { HttpStatus } from '@nestjs/common';
import { spawn } from 'node:child_process';
import { AdminBackupController } from './admin-backup.controller';

vi.mock('node:child_process', () => ({ spawn: vi.fn(() => ({ unref: vi.fn() })) }));

afterEach(() => vi.restoreAllMocks());

describe('admin backup safety boundary', () => {
  it('never reports a successful manual backup without verified encrypted runner', async () => {
    const controller = new AdminBackupController();
    await expect(controller.triggerBackup()).rejects.toMatchObject({
      status: HttpStatus.SERVICE_UNAVAILABLE,
      response: expect.objectContaining({ code: 'BACKUP_TRIGGER_UNAVAILABLE' }),
    });
    expect(spawn).not.toHaveBeenCalled();
  });

  it('does not mark a legacy dump verified based only on a filename/stat', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'moneyverse-backup-status-'));
    try {
      writeFileSync(join(dir, 'unverified.sql.gz'), 'not a verified encrypted backup');
      const controller = new AdminBackupController();
      vi.spyOn(controller as unknown as { getBackupDir(): string }, 'getBackupDir').mockReturnValue(dir);
      const status = await controller.getBackupStatus();
      expect(status.files).toHaveLength(1);
      expect(status.files[0]?.status).toBe('PENDING');
      expect(status.totalBackups).toBe(1);
      expect(status.retentionDays).toBe(0);
      expect(status.lastBackupAt).toBeNull();
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
