import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({
  admin: vi.fn(async () => undefined),
  api: vi.fn(async (): Promise<unknown> => null),
}));
vi.mock('@/lib/session', () => ({ requireAdminConsole: mocks.admin }));
vi.mock('@/lib/api', () => ({ api: mocks.api, ApiError: class extends Error { status = 503; detail = 'unavailable'; } }));
import { GET } from './route';

const payload = () => ({
  status: 'UNKNOWN', serverTime: new Date().toISOString(), uptimeSeconds: 42,
  dbLatencyMs: null, dbProbe: { status: 'UNKNOWN', measuredAt: null, source: 'NOT_MEASURED' },
  isLiveTelemetry: false, totalDomains: 1, totalEndpoints: 2,
  averageLatencyMs: null, globalSuccessRate: null,
  domains: [{ id: 'wallet', name: '지갑', nameEn: 'Wallet', endpointCount: 2,
    status: 'UNKNOWN', latencyMs: null, successRate: null, measuredAt: null,
    measurementSource: 'NOT_MEASURED', sampleEndpoints: ['/api/v1/wallet/balance'] }],
});

beforeEach(() => { mocks.api.mockReset(); mocks.admin.mockReset(); mocks.admin.mockResolvedValue(undefined); });

describe('admin API-health private source gateway', () => {
  it('serves verified unmeasured telemetry only with private no-store and noindex', async () => {
    mocks.api.mockResolvedValue(payload());
    const res = await GET();
    expect(res.status).toBe(200);
    expect(res.headers.get('cache-control')).toContain('no-store');
    expect(res.headers.get('x-robots-tag')).toBe('noindex');
    expect((await res.json()).globalSuccessRate).toBeNull();
  });
  it('returns 503 rather than publishing fabricated route success rates', async () => {
    mocks.api.mockResolvedValue({ ...payload(), globalSuccessRate: 100 });
    const res = await GET();
    expect(res.status).toBe(503);
    expect(res.headers.get('cache-control')).toContain('no-store');
    expect(res.headers.get('x-robots-tag')).toBe('noindex');
  });
  it('keeps unauthorized responses private', async () => {
    mocks.admin.mockRejectedValue(new Error('not admin'));
    const res = await GET();
    expect(res.status).toBe(401);
    expect(res.headers.get('cache-control')).toContain('no-store');
    expect(res.headers.get('x-robots-tag')).toBe('noindex');
    expect(mocks.api).not.toHaveBeenCalled();
  });
});
