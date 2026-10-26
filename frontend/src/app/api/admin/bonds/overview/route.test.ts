import { beforeEach, describe, expect, it, vi } from 'vitest';
import { validTelemetry } from '@/app/admin/bonds/bond-telemetry.fixture';

const mockApi = vi.hoisted(() => vi.fn());
vi.mock('@/lib/api', () => ({ api: mockApi }));
import { GET } from './route';

describe('admin bond BFF GET contract', () => {
  beforeEach(() => mockApi.mockReset());
  it('returns no-store verified PostgreSQL-backed API data', async () => {
    mockApi
      .mockResolvedValueOnce(validTelemetry.overview)
      .mockResolvedValueOnce(validTelemetry.bonds)
      .mockResolvedValueOnce(validTelemetry.couponLogs);
    const response = await GET();
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect((await response.json()).overview.totalFundedWld).toBe('9007199254740993');
    expect(mockApi).toHaveBeenCalledWith('/api/v1/admin/bonds/coupon-logs?limit=30');
  });
  it('rejects malformed upstream response rather than returning a fake success', async () => {
    mockApi
      .mockResolvedValueOnce({ totalBondsActive: 3 })
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);
    const response = await GET();
    expect(response.status).toBe(503);
    expect((await response.json()).error).toMatch(/검증 실패/);
  });
  it('does not turn a failed upstream request into empty records', async () => {
    mockApi.mockRejectedValueOnce(new Error('unavailable'));
    const response = await GET();
    expect(response.status).toBeGreaterThanOrEqual(500);
  });
});
