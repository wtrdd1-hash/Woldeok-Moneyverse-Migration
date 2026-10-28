import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ gate: vi.fn(), api: vi.fn() }));
vi.mock('@/lib/session', () => ({ requireAdminConsole: mocks.gate }));
vi.mock('@/lib/api', () => ({ api: mocks.api }));
import { GET } from './backups/route';

const inventory = { backupDir: '/private', r2Configured: false, r2Bucket: 'bucket', retentionDays: 30,
  totalBackups: 0, totalSizeBytes: 0, totalSizeMb: 0, files: [], lastBackupAt: null };
describe('admin backup gateway', () => {
  beforeEach(() => { vi.resetAllMocks(); });
  it('enforces admin access before backend read', async () => {
    mocks.gate.mockRejectedValue(new Error('denied'));
    const res = await GET();
    expect(res.status).toBe(401);
    expect(mocks.api).not.toHaveBeenCalled();
  });
  it('validates backend inventory and never caches private evidence', async () => {
    mocks.api.mockResolvedValue(inventory);
    const res = await GET();
    expect(res.status).toBe(200);
    expect(res.headers.get('Cache-Control')).toBe('private, no-store');
    expect(JSON.stringify(await res.json())).not.toContain('/private');
    expect(mocks.api).toHaveBeenCalledWith('/api/v1/admin/backups');
  });
  it('fails closed on malformed backup evidence', async () => {
    mocks.api.mockResolvedValue({ ...inventory, totalBackups: -1 });
    expect((await GET()).status).toBe(503);
  });
});
