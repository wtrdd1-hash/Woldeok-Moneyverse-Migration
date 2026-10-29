import type { BackupStatusResponse } from './api-health-dashboard';

const record = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);
const count = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
const amount = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0;
const date = (value: unknown): value is string =>
  typeof value === 'string' && Number.isFinite(Date.parse(value));

/** Never turn an absent/invalid response into a verified empty backup inventory. */
export function parseBackupInventory(input: unknown): BackupStatusResponse | null {
  if (!record(input) || !Array.isArray(input.files) ||
    !count(input.totalBackups) || !count(input.totalSizeBytes) ||
    !amount(input.totalSizeMb) || !count(input.retentionDays) ||
    typeof input.r2Configured !== 'boolean' || typeof input.r2Bucket !== 'string' ||
    !(input.lastBackupAt === null || date(input.lastBackupAt)) ||
    input.totalBackups !== input.files.length) return null;
  const files = input.files;
  if (!files.every((item: unknown) => record(item) &&
    typeof item.fileName === 'string' && item.fileName.length > 0 &&
    !/[\\/]/.test(item.fileName) && count(item.sizeBytes) && amount(item.sizeMb) &&
    date(item.createdAt) && (item.status === 'VERIFIED' || item.status === 'PENDING'))) return null;
  if (files.reduce((total: number, item: { sizeBytes: number }) => total + item.sizeBytes, 0) !== input.totalSizeBytes) return null;
  return {
    backupDir: '', // Host filesystem paths must not be exposed through the browser gateway.
    r2Configured: input.r2Configured,
    r2Bucket: input.r2Bucket,
    retentionDays: input.retentionDays,
    totalBackups: input.totalBackups,
    totalSizeBytes: input.totalSizeBytes,
    totalSizeMb: input.totalSizeMb,
    files: files.map((item: { fileName: string; sizeBytes: number; sizeMb: number; createdAt: string }) => ({
      ...item, status: 'PENDING' as const, // A local file cannot prove successful restore.
    })),
    lastBackupAt: input.lastBackupAt,
  };
}
