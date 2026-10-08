import { beforeEach, describe, expect, it, vi } from 'vitest';
import { publicApi } from '@/lib/api';
import { GET } from './route';

vi.mock('@/lib/api', () => ({ publicApi: vi.fn() }));

describe('KDIC same-origin BFF', () => {
  beforeEach(() => vi.resetAllMocks());

  it('returns 503 without invented balances when the backend is unavailable', async () => {
    vi.mocked(publicApi).mockResolvedValue(null);
    const response = await GET();
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(await response.json()).toEqual({ success: false, error: 'KDIC public data unavailable' });
  });

  it('relays exact string amounts from the public-only API', async () => {
    const amount = '900719925474099312345';
    vi.mocked(publicApi).mockResolvedValue({ success: true, data: { fund: { totalFundWld: amount }, institutions: [] } });
    const response = await GET();
    expect(response.status).toBe(200);
    expect((await response.json()).data.fund.totalFundWld).toBe(amount);
    expect(publicApi).toHaveBeenCalledWith('/api/v1/kdic/portal', 0);
  });
});
