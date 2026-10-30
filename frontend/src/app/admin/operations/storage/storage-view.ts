export type StorageSeverity = 'NORMAL' | 'WARN' | 'CRITICAL' | 'EMERGENCY';
export interface StorageMountView {
  readonly mountAlias: 'ROOT' | 'DATA';
  readonly totalBytes: string;
  readonly usedBytes: string;
  readonly availableBytes: string;
  readonly usedPercent: number;
  readonly inodeAvailable: string;
  readonly severity: StorageSeverity;
}
export interface StorageSnapshotView {
  readonly status: 'VERIFIED';
  readonly sourceKind: 'HOST_SIGNED';
  readonly freshness: 'FRESH';
  readonly observedAt: string;
  readonly mounts: readonly [StorageMountView, StorageMountView];
}

const canonical = (value: unknown): value is string =>
  typeof value === 'string' && /^(0|[1-9][0-9]{0,19})$/.test(value);

function mount(value: unknown, alias: 'ROOT' | 'DATA'): value is StorageMountView {
  if (!value || typeof value !== 'object') return false;
  const row = value as Partial<StorageMountView>;
  if (row.mountAlias !== alias || !canonical(row.totalBytes) || !canonical(row.usedBytes) ||
      !canonical(row.availableBytes) || !canonical(row.inodeAvailable) ||
      typeof row.usedPercent !== 'number' || !Number.isInteger(row.usedPercent) || row.usedPercent < 0 || row.usedPercent > 100) return false;
  const total = BigInt(row.totalBytes);
  const used = BigInt(row.usedBytes);
  const available = BigInt(row.availableBytes);
  if (total === 0n || used + available > total) return false;
  const denom = used + available;
  const expectedPercent = denom === 0n ? 100 : Number((used * 100n + denom - 1n) / denom);
  if (row.usedPercent !== expectedPercent) return false;
  const expectedSeverity: StorageSeverity = expectedPercent >= 95 || available < 5n * 1024n ** 3n || BigInt(row.inodeAvailable) === 0n
    ? 'EMERGENCY' : expectedPercent >= 90 ? 'CRITICAL' : expectedPercent >= 80 ? 'WARN' : 'NORMAL';
  return row.severity === expectedSeverity;
}

/** Reject malformed/old success responses rather than showing a fabricated green dashboard. */
export function validateStorageSnapshot(value: unknown, now = Date.now()): StorageSnapshotView | null {
  if (!value || typeof value !== 'object') return null;
  const data = value as Partial<StorageSnapshotView>;
  if (data.status !== 'VERIFIED' || data.sourceKind !== 'HOST_SIGNED' || data.freshness !== 'FRESH' ||
      typeof data.observedAt !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(data.observedAt) ||
      !Array.isArray(data.mounts) || data.mounts.length !== 2 ||
      !mount(data.mounts[0], 'ROOT') || !mount(data.mounts[1], 'DATA')) return null;
  const observed = Date.parse(data.observedAt);
  if (!Number.isFinite(observed) || observed > now + 5_000 || now - observed > 120_000) return null;
  return data as StorageSnapshotView;
}

export function formatStorageBytes(value: string): string {
  if (!canonical(value)) return '—';
  const tenths = (BigInt(value) * 10n + (1024n ** 3n / 2n)) / 1024n ** 3n;
  return `${tenths / 10n}.${tenths % 10n} GiB`;
}
