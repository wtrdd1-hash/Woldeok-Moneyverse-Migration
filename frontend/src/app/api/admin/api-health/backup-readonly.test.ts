import { beforeEach, describe, expect, it, vi } from 'vitest';
const { read, gate } = vi.hoisted(() => ({ read: vi.fn(), gate: vi.fn() }));
vi.mock('@/lib/api', () => ({ api: read }));
vi.mock('@/lib/session', () => ({ requireAdminConsole: gate }));
import { GET } from './backup-inventory/route';

beforeEach(() => { vi.resetAllMocks(); });
describe('authenticated read-only backup inventory gateway', () => {
  it('rejects callers without an open admin console before backend read', async () => {
    gate.mockRejectedValue(new Error('no admin session'));
    const response = await GET();
    expect(response.status).toBe(401);
    expect(read).not.toHaveBeenCalled();
  });
  it('downgrades a legacy file-presence VERIFIED label and redacts host paths', async () => {
    gate.mockResolvedValue(undefined);
    read.mockResolvedValue({ backupDir: '/srv/secret/backups', r2Configured: false, r2Bucket: '',
      retentionDays: 30, totalBackups: 1, totalSizeBytes: 1024, totalSizeMb: 0.01,
      files: [{ fileName: 'snapshot.sql.gz', sizeBytes: 1024, sizeMb: 0.01,
        createdAt: '2026-10-29T00:00:00Z', status: 'VERIFIED' }], lastBackupAt: '2026-10-29T00:00:00Z' });
    const response = await GET();
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.backupDir).toBe('');
    expect(json.files[0].status).toBe('PENDING');
    expect(response.headers.get('cache-control')).toContain('no-store');
  });
  it('rejects contradictory file counts even when the backend returned 200', async () => {
    gate.mockResolvedValue(undefined);
    read.mockResolvedValue({ files: [], totalBackups: 3 });
    const response = await GET();
    expect(response.status).toBe(502);
  });
  it('does not turn an upstream failure into an empty verified backup list', async () => {
    gate.mockResolvedValue(undefined);
    read.mockRejectedValue(new Error('backend unavailable'));
    const response = await GET();
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toContain('no-store');
  });
});
