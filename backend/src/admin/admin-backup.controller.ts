import fs from 'node:fs';
import path from 'node:path';
import { Controller, Get, Post, UseGuards, ServiceUnavailableException } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

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
@UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard, CsrfGuard, AdminGuard)
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
              status: 'PENDING' as const,
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
  @ApiOperation({ summary: 'Manual backup disabled until verified job receipts and restore checks exist' })
  async triggerBackup(): Promise<never> {
    // A detached child PID is not a completed, durable or restorable backup receipt.
    throw new ServiceUnavailableException('Verified backup execution is not available');
  }
}
