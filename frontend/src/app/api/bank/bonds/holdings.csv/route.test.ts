import { beforeEach, describe, expect, it, vi } from 'vitest';

const { viewerOrUnknown, api } = vi.hoisted(() => ({ viewerOrUnknown: vi.fn(), api: vi.fn() }));
vi.mock('@/lib/viewer', () => ({ viewerOrUnknown }));
vi.mock('@/lib/api', () => ({ api }));
import { GET } from './route';

const BOND = {
  id: '22222222-2222-4222-8222-222222222222', bond_code: 'BOND_30D',
  bond_name: '30-day virtual bond', principal_amount: '999999999999999999999999999999',
  maturity_amount: '1000000000000000000000000000000', yield_bps: 100,
  purchased_at: '2026-10-01T00:00:00Z', maturity_at: '2026-10-31T00:00:00Z',
  is_matured: false, status: 'holding',
};

describe('private current virtual bond holdings CSV endpoint', () => {
  beforeEach(() => { vi.resetAllMocks(); });

  it('refuses guests without calling the private API', async () => {
    viewerOrUnknown.mockResolvedValue({ signedIn: false });
    const response = await GET();
    expect(response.status).toBe(401);
    expect(api).not.toHaveBeenCalled();
  });

  it('fails closed when session verification or database is unavailable', async () => {
    viewerOrUnknown.mockResolvedValue(null);
    expect((await GET()).status).toBe(503);
    viewerOrUnknown.mockResolvedValue({ signedIn: true });
    api.mockRejectedValue(new Error('backend unavailable'));
    expect((await GET()).status).toBe(503);
  });

  it('downloads verified owner-only current holdings without caching or indexability', async () => {
    viewerOrUnknown.mockResolvedValue({ signedIn: true });
    api.mockResolvedValue({ bonds: [BOND], scope: 'current_holdings_only' });
    const response = await GET();
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(response.headers.get('x-robots-tag')).toContain('noindex');
    expect(response.headers.get('content-disposition')).toContain('attachment');
    expect(await response.text()).toContain(BOND.principal_amount);
    expect(api).toHaveBeenCalledWith('/api/v1/banking/bonds/holdings');
  });

  it('never emits a success CSV for malformed holdings', async () => {
    viewerOrUnknown.mockResolvedValue({ signedIn: true });
    api.mockResolvedValue({ bonds: [{ ...BOND, principal_amount: 1 }], scope: 'current_holdings_only' });
    expect((await GET()).status).toBe(503);
  });
});
