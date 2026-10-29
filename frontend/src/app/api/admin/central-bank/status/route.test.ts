import { beforeEach, describe, expect, it, vi } from 'vitest';
const { api } = vi.hoisted(() => ({ api: vi.fn() }));
vi.mock('@/lib/api', () => ({ api, ApiError: class ApiError extends Error { status = 503 } }));
import { GET } from './route';

describe('v1503 central-bank ledger/policy truth', () => {
  beforeEach(() => api.mockReset());
  it('reads genuine ledger-backed telemetry and persisted policy, never mint demo batches', async () => {
    api.mockResolvedValueOnce({
      m_total: '100', m_circulating: '40', m_treasury: '60', m_bank_liquidity: null,
      m_locked: null, verified_invariant: false, active_policy_orders_count: 3,
      total_mint_certificates_count: 0, is_issuance_frozen: false,
    }).mockResolvedValueOnce({ source: 'persistent_monetary_policy', ratePercent: '3.75' })
      .mockResolvedValueOnce({ source: 'persistent_monetary_policy', ratioPercent: '7.00' });
    const result = await GET();
    const data = await result.json();
    expect(result.status).toBe(200);
    expect(data.source).toBe('ledger_partial_and_persistent_policy');
    expect(data.monetary.total_mint_certificates_count).toBe(0);
    expect(api.mock.calls.map((args) => args[0])).toEqual([
      '/api/v1/admin/economy/monetary/telemetry',
      '/api/v1/central-bank/base-rate',
      '/api/v1/central-bank/reserve-requirement',
    ]);
  });
  it('fails closed for unknown policy provenance', async () => {
    api.mockResolvedValueOnce({ verified_invariant: false })
      .mockResolvedValueOnce({ ratePercent: '3.25' })
      .mockResolvedValueOnce({ source: 'persistent_monetary_policy', ratioPercent: '7' });
    expect((await GET()).status).toBe(503);
  });
});
