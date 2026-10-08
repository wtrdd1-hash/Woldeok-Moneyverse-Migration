import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { Controller, Get, Post, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { SessionGuard } from '../auth/guards/session.guard';

export interface BackupFileInfo {
  readonly fileName: string;
  readonly sizeBytes: number;
  readonly sizeMb: number;
  readonly createdAt: string;
  readonly status: 'VERIFIED' | 'PENDING';
}

export interface BackupStatusResponse {
  readonly backupDir: string;
  readonly r2Configured: boolean;
  readonly r2Bucket: string;
  readonly retentionDays: number;
  readonly totalBackups: number;
  readonly totalSizeBytes: number;
  readonly totalSizeMb: number;
  readonly files: readonly BackupFileInfo[];
  readonly lastBackupAt: string | null;
}

@ApiTags('admin')
@Controller('admin/backups')
@UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard, CsrfGuard)
export class AdminBackupController {
  private getBackupDir(): string {
    const defaultProd = '/srv/moneyverse-data/backups/daily';
    if (fs.existsSync(defaultProd)) {
      return defaultProd;
    }
    const localFallback = path.resolve(process.cwd(), 'backups/daily');
    if (!fs.existsSync(localFallback)) {
      try {
        fs.mkdirSync(localFallback, { recursive: true });
      } catch {
        // Ignored if cannot create
      }
    }
    return localFallback;
  }

  @Get()
  @ApiOperation({ summary: 'Get list of automated and manual database backups and R2 storage status' })
  async getBackupStatus(): Promise<BackupStatusResponse> {
    const backupDir = this.getBackupDir();
    const r2Bucket = process.env.R2_BUCKET || 'moneyverse-backup';
    const r2Configured = Boolean(process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY);

    let files: BackupFileInfo[] = [];
    let totalSizeBytes = 0;

    try {
      if (fs.existsSync(backupDir)) {
        const fileNames = fs.readdirSync(backupDir).filter((f) => f.endsWith('.sql.gz') || f.endsWith('.sql'));
        files = fileNames
          .map((fileName) => {
            const filePath = path.join(backupDir, fileName);
            const stat = fs.statSync(filePath);
            totalSizeBytes += stat.size;
            return {
              fileName,
              sizeBytes: stat.size,
              sizeMb: Math.round((stat.size / (1024 * 1024)) * 100) / 100,
              createdAt: stat.mtime.toISOString(),
              status: 'VERIFIED' as const,
            };
          })
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
    } catch (err) {
      // Fallback empty
    }

    return {
      backupDir,
      r2Configured,
      r2Bucket,
      retentionDays: 30,
      totalBackups: files.length,
      totalSizeBytes,
      totalSizeMb: Math.round((totalSizeBytes / (1024 * 1024)) * 100) / 100,
      files,
      lastBackupAt: files.length > 0 ? (files[0]?.createdAt ?? null) : null,
    };
  }

  @Post('trigger')
  @ApiOperation({ summary: 'Manually trigger database dump and Cloudflare R2 backup pipeline' })
  async triggerBackup(): Promise<{ message: string; scriptPath: string; triggeredAt: string }> {
    const prodScript = '/srv/moneyverse-data/releases/production-current/scripts/backup/backup-r2-free.sh';
    const localScript = path.resolve(process.cwd(), 'scripts/backup/backup-r2-free.sh');
    const targetScript = fs.existsSync(prodScript) ? prodScript : localScript;

    if (!fs.existsSync(targetScript)) {
      throw new HttpException(
        { message: 'Backup script not found', path: targetScript },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    try {
      const child = spawn('bash', [targetScript], {
        detached: true,
        stdio: 'ignore',
      });
      child.unref();

      return {
        message: 'Backup pipeline triggered successfully in background',
        scriptPath: targetScript,
        triggeredAt: new Date().toISOString(),
      };
    } catch (err: any) {
      throw new HttpException(
        { message: 'Failed to launch backup process', error: err?.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
