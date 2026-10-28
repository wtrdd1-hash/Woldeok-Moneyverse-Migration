import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '@/lib/api';
import { GET } from './route';

vi.mock('@/lib/api', () => ({ api: vi.fn() }));

const overview = {
  totalBondsActive: 0,
  totalFundedWld: '0',
  totalHoldersCount: 0,
  totalCouponsPaidWld: '42',
  benchmark1YYield: '—',
  benchmark3YYield: '—',
  benchmark5YYield: '—',
};

describe('admin bond overview Next gateway contract', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns verified backend absence sentinel and interest-only aggregate without caching', async () => {
    vi.mocked(api).mockImplementation(async (path) => {
      if (path === '/api/v1/admin/bonds/overview') return overview as never;
      if (path === '/api/v1/admin/bonds/list') return [] as never;
      if (path === '/api/v1/admin/bonds/coupon-logs?limit=30') return [] as never;
      throw new Error('unexpected route');
    });
    const response = await GET();
    expect(response.status).toBe(200);
    expect(response.headers.get('Cache-Control')).toBe('private, no-store');
    expect(await response.json()).toEqual({ overview, bonds: [], couponLogs: [] });
    expect(api).toHaveBeenCalledTimes(3);
  });

  it('fails closed on an invalid backend coupon aggregate', async () => {
    vi.mocked(api).mockImplementation(async (path) => {
      if (path === '/api/v1/admin/bonds/overview') return { ...overview, totalCouponsPaidWld: 'NaN' } as never;
      return [] as never;
    });
    const response = await GET();
    expect(response.status).toBe(503);
    expect((await response.json()).error).toBeTruthy();
  });
});
