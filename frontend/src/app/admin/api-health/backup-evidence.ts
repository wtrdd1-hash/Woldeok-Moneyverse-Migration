import type { BackupStatusResponse } from './api-health-dashboard';

// A filesystem listing is not a verified backup, R2 copy or successful restore.
export interface BackupEvidence {
  readonly source: 'LOCAL_FILES_UNVERIFIED';
  readonly totalBackups: number;
  readonly totalSizeBytes: number;
  readonly files: readonly { fileName: string; sizeBytes: number; createdAt: string; status: 'PENDING' }[];
  readonly remoteBackupVerified: false;
  readonly restoreVerified: false;
}

const nonNegative = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
const validDate = (value: unknown): value is string =>
  typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value) &&
  Number.isFinite(Date.parse(value)) && Date.parse(value) <= Date.now() + 300_000;

export function parseBackupEvidence(input: unknown): BackupEvidence | null {
  if (!input || typeof input !== 'object') return null;
  const x = input as Record<string, unknown>;
  if (typeof x.backupDir !== 'string' || typeof x.r2Configured !== 'boolean' ||
      typeof x.r2Bucket !== 'string' || !nonNegative(x.retentionDays) ||
      !nonNegative(x.totalBackups) || !nonNegative(x.totalSizeBytes) ||
      !Array.isArray(x.files) || x.files.length > 1000 || x.totalBackups !== x.files.length ||
      (x.lastBackupAt !== null && !validDate(x.lastBackupAt))) return null;
  const seen = new Set<string>();
  const files: BackupEvidence['files'][number][] = [];
  let sum = 0;
  for (const item of x.files as unknown[]) {
    if (!item || typeof item !== 'object') return null;
    const f = item as Record<string, unknown>;
    if (typeof f.fileName !== 'string' || !/^[a-zA-Z0-9_.-]{1,255}\.sql(\.gz)?$/.test(f.fileName) ||
        seen.has(f.fileName) || !nonNegative(f.sizeBytes) || !validDate(f.createdAt) ||
        f.status !== 'PENDING') return null;
    seen.add(f.fileName);
    sum += f.sizeBytes;
    if (!Number.isSafeInteger(sum)) return null;
    files.push({ fileName: f.fileName, sizeBytes: f.sizeBytes, createdAt: f.createdAt, status: 'PENDING' });
  }
  if (sum !== x.totalSizeBytes || (files.length > 0 && x.lastBackupAt === null)) return null;
  return { source: 'LOCAL_FILES_UNVERIFIED', totalBackups: x.totalBackups,
    totalSizeBytes: x.totalSizeBytes, files, remoteBackupVerified: false, restoreVerified: false };
}

export function parseBackupInventory(input: unknown): BackupStatusResponse | null {
  const evidence = parseBackupEvidence(input);
  if (!evidence) return null;
  const x = input as Record<string, unknown>;
  return {
    backupDir: '', // Host filesystem paths must not be exposed through the browser gateway.
    r2Configured: Boolean(x.r2Configured),
    r2Bucket: String(x.r2Bucket ?? ''),
    retentionDays: Number(x.retentionDays ?? 30),
    totalBackups: evidence.totalBackups,
    totalSizeBytes: evidence.totalSizeBytes,
    totalSizeMb: Math.round(evidence.totalSizeBytes / (1024 * 1024)),
    files: evidence.files.map((item) => ({
      fileName: item.fileName,
      sizeBytes: item.sizeBytes,
      sizeMb: Math.round(item.sizeBytes / (1024 * 1024)),
      createdAt: item.createdAt,
      status: 'PENDING' as const,
    })),
    lastBackupAt: typeof x.lastBackupAt === 'string' ? x.lastBackupAt : null,
  };
}
