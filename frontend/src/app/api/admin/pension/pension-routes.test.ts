import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GET as overviewGET } from './overview/route';
import { GET as payoutsGET } from './recent-payouts/route';
import { POST as distributePOST } from './distribute/route';

const apiMock = vi.hoisted(() => vi.fn());

vi.mock('@/lib/api', () => {
  class ApiError extends Error {
    status: number;
    code?: string;
    constructor(status: number, message: string, code?: string) {
      super(message);
      this.name = 'ApiError';
      this.status = status;
      this.code = code;
    }
  }
  return {
    api: apiMock,
    ApiError,
  };
});
const mockApi = apiMock;

const overview = {
  totalAumWld: '900719925474099312345', totalSubscribersCount: 10,
  totalRetiredReceiversCount: 2, totalPensionPaidWld: '120',
  benchmarkAnnualPayoutRate: '8.0%', vaultMainBalanceWld: '25000000',
};
const payout = {
  id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  account_id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  user_id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
  payout_amount_wld: '900719925474099312345',
  snapshot_accumulated_wld: '900719925474099312345',
  created_at: '2026-10-27T00:00:00.000Z',
};

describe('NPS Next.js BFF boundary', () => {
  beforeEach(() => mockApi.mockReset());
  it('returns exact verified overview with private no-store', async () => {
    mockApi.mockResolvedValueOnce(overview);
    const response = await overviewGET();
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect((await response.json()).totalAumWld).toBe(overview.totalAumWld);
    expect(mockApi).toHaveBeenCalledWith('/api/v1/admin/pension/overview');
  });
  it('rejects malformed overview without returning synthetic metrics', async () => {
    mockApi.mockResolvedValueOnce({ ...overview, totalAumWld: 999 });
    const response = await overviewGET();
    expect(response.status).toBe(503);
    expect((await response.json()).code).toBe('PENSION_OVERVIEW_EVIDENCE_INVALID');
  });
  it('returns exact verified payouts with private no-store', async () => {
    mockApi.mockResolvedValueOnce([payout]);
    const response = await payoutsGET();
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect((await response.json())[0].payout_amount_wld).toBe(payout.payout_amount_wld);
    expect(mockApi).toHaveBeenCalledWith('/api/v1/admin/pension/recent-payouts?limit=30');
  });
  it('forwards distribute call to backend endpoint', async () => {
    mockApi.mockResolvedValueOnce({
      success: true,
      message: '지급 완료',
      total_payout_wld: '0',
      payouts_count: 0,
    });
    const response = await distributePOST();
    expect(response.status).toBe(200);
    expect(mockApi).toHaveBeenCalledWith('/api/v1/admin/pension/distribute-payouts', { method: 'POST' });
  });
});