import { beforeEach, describe, expect, it, vi } from 'vitest';
const { api } = vi.hoisted(() => ({ api: vi.fn() }));
vi.mock('@/lib/api', () => ({ api, ApiError: class ApiError extends Error { status = 503 } }));
import { GET } from './route';

describe('v1501 central-bank read-only snapshot BFF', () => {
  beforeEach(() => api.mockReset());
  it('reports only backend-sourced transient values and never invents a mint request', async () => {
    api
      .mockResolvedValueOnce([{ id: 'received', batchNumber: 'MINT-REAL', status: 'ACCEPTED_BY_CENTRAL_BANK', amountWld: '100' }])
      .mockResolvedValueOnce({ m0BaseMoneyWld: '100', m1NarrowMoneyWld: '180', m2BroadMoneyWld: '432', moneyMultiplier: '4.32' })
      .mockResolvedValueOnce({ ratePercent: '3.75' })
      .mockResolvedValueOnce({ ratioPercent: '8.00' });
    const response = await GET();
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.source).toBe('non_persistent_backend_preview');
    expect(data.pendingBatches).toEqual([]);
    expect(data.policy.ratePercent).toBe('3.75');
    expect(api).toHaveBeenCalledTimes(4);
    expect(api.mock.calls.map((args) => args[0])).toEqual([
      '/api/v1/mint/batches',
      '/api/v1/central-bank/monetary-aggregates',
      '/api/v1/central-bank/base-rate',
      '/api/v1/central-bank/reserve-requirement',
    ]);
  });
});
