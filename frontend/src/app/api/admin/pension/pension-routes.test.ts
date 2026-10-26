import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GET as getOverview } from './overview/route';
import { GET as getPayouts } from './recent-payouts/route';
import { api } from '@/lib/api';

vi.mock('@/lib/api', () => ({ api: vi.fn() }));

describe('authenticated NPS read proxy contracts', () => {
  beforeEach(() => vi.mocked(api).mockReset());

  it('forwards live overview and prevents admin data caching', async () => {
    vi.mocked(api).mockResolvedValue({ totalAumWld: '9007199254740993' });
    const response = await getOverview();
    expect(response.status).toBe(200);
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(await response.json()).toEqual({ totalAumWld: '9007199254740993' });
    expect(api).toHaveBeenCalledWith('/api/v1/admin/pension/overview');
  });
  it('fetches the real backend payout log and never invents an empty list on error', async () => {
    vi.mocked(api).mockResolvedValueOnce([{ id: 'one' }]).mockRejectedValueOnce(new Error('DB unavailable'));
    const success = await getPayouts();
    expect(success.status).toBe(200);
    expect(success.headers.get('Cache-Control')).toBe('no-store');
    expect(await success.json()).toEqual([{ id: 'one' }]);
    expect(api).toHaveBeenCalledWith('/api/v1/admin/pension/recent-payouts?limit=30');
    const failure = await getPayouts();
    expect(failure.status).toBe(503);
    expect(await failure.json()).toEqual({ error: '연금 지급 기록을 확인할 수 없습니다.' });
  });
});
