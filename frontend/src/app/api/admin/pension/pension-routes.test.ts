import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '@/lib/api';
import { GET as overviewGET } from './overview/route';
import { GET as payoutsGET } from './recent-payouts/route';
import { POST as distributePOST } from './distribute/route';

vi.mock('@/lib/api', () => ({ api: vi.fn() }));
const mockApi = vi.mocked(api);
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
    expect(JSON.stringify(await response.json())).not.toContain('25000000');
  });
  it('returns only verified payout receipts', async () => {
    mockApi.mockResolvedValueOnce([payout]);
    const response = await payoutsGET();
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect((await response.json())[0].payout_amount_wld).toBe(payout.payout_amount_wld);
    expect(mockApi).toHaveBeenCalledWith('/api/v1/admin/pension/recent-payouts?limit=30');
  });
  it('rejects malformed payout records rather than returning unverified rows', async () => {
    mockApi.mockResolvedValueOnce([{ ...payout, payout_amount_wld: 'NaN' }]);
    expect((await payoutsGET()).status).toBe(503);
  });
  it('retains authenticated backend refusal statuses without exposing data', async () => {
    mockApi.mockRejectedValueOnce({ status: 401 });
    const response = await overviewGET();
    expect(response.status).toBe(401);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
  });
  it('never fabricates an empty payout list on backend failure', async () => {
    mockApi.mockRejectedValueOnce(new Error('DB unavailable'));
    const response = await payoutsGET();
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: '연금 지급 기록을 확인할 수 없습니다.' });
  });
  it('never forwards payout writes while the backend ledger hold remains', async () => {
    const response = await distributePOST();
    expect(response.status).toBe(503);
    expect((await response.json()).error).toBe('pension_ledger_settlement_uncertified');
    expect(mockApi).not.toHaveBeenCalled();
  });
});
