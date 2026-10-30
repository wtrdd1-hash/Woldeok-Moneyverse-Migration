import { beforeEach, describe, expect, it, vi } from 'vitest';
const { api, requireAdminConsole } = vi.hoisted(() => ({ api: vi.fn(), requireAdminConsole: vi.fn() }));
vi.mock('@/lib/api', () => ({ api }));
vi.mock('@/lib/session', () => ({ requireAdminConsole }));
import { GET } from './route';

const good = { status: 'VERIFIED', sourceKind: 'HOST_SIGNED', freshness: 'FRESH', observedAt: new Date().toISOString(), mounts: [
  { mountAlias: 'ROOT', totalBytes: '10000000000', usedBytes: '8000000000', availableBytes: '1000000000', usedPercent: 89, inodeAvailable: '100', severity: 'EMERGENCY' },
  { mountAlias: 'DATA', totalBytes: '10000000000', usedBytes: '8000000000', availableBytes: '1000000000', usedPercent: 89, inodeAvailable: '100', severity: 'EMERGENCY' },
] };

describe('private storage evidence gateway', () => {
  beforeEach(() => { api.mockReset(); requireAdminConsole.mockReset(); });
  it('requires admin console and does not call backend for denied sessions', async () => {
    requireAdminConsole.mockRejectedValue(new Error('unauthorized'));
    const result = await GET();
    expect(result.status).toBe(401);
    expect(result.headers.get('cache-control')).toContain('no-store');
    expect(api).not.toHaveBeenCalled();
  });
  it('returns only validated host evidence, never a forged green response', async () => {
    api.mockResolvedValueOnce(good).mockResolvedValueOnce({ ...good, mounts: [] });
    const ok = await GET();
    expect(ok.status).toBe(200);
    expect(ok.headers.get('x-robots-tag')).toContain('noindex');
    expect((await ok.json()).status).toBe('VERIFIED');
    const blocked = await GET();
    expect(blocked.status).toBe(503);
    expect((await blocked.json()).status).toBe('UNKNOWN');
  });
});
