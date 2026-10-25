import { beforeEach, describe, expect, it, vi } from 'vitest';
const { viewerOrUnknown, api } = vi.hoisted(() => ({ viewerOrUnknown: vi.fn(), api: vi.fn() }));
vi.mock('@/lib/viewer', () => ({ viewerOrUnknown }));
vi.mock('@/lib/api', () => ({ api }));
import { GET } from './route';
const HOLDING = {
  stock_id: '22222222-2222-4222-8222-222222222222', symbol: 'MVX', name: 'Virtual stock',
  quantity: '1', average_cost: '10', market_value: '100', current_price: '100', halt_status: 'ACTIVE',
};
describe('private stock portfolio export', () => {
  beforeEach(() => vi.resetAllMocks());
  it('denies guests and does not access the owner API', async () => {
    viewerOrUnknown.mockResolvedValue({ signedIn: false });
    expect((await GET()).status).toBe(401);
    expect(api).not.toHaveBeenCalled();
  });
  it('downloads verified current holdings only with privacy headers', async () => {
    viewerOrUnknown.mockResolvedValue({ signedIn: true });
    api.mockResolvedValue({ scope: 'current_holdings_only', holdings: [HOLDING] });
    const result = await GET();
    expect(result.status).toBe(200);
    expect(result.headers.get('cache-control')).toContain('no-store');
    expect(result.headers.get('x-robots-tag')).toContain('noindex');
    expect(result.headers.get('content-disposition')).toContain('attachment');
    expect(await result.text()).toContain('Current holdings only');
    expect(api).toHaveBeenCalledWith('/api/v1/stocks/portfolio/export');
  });
  it('does not claim a successful download for invalid data or upstream outage', async () => {
    viewerOrUnknown.mockResolvedValue({ signedIn: true });
    api.mockResolvedValue({ scope: 'current_holdings_only', holdings: [{ ...HOLDING, quantity: 1 }] });
    expect((await GET()).status).toBe(503);
    api.mockRejectedValue(new Error('database down'));
    expect((await GET()).status).toBe(503);
  });
});
