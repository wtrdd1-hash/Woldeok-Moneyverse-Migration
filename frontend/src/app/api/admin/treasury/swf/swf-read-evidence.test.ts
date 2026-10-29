import { beforeEach, describe, expect, it, vi } from 'vitest';
const { read } = vi.hoisted(() => ({ read: vi.fn() }));
vi.mock('@/lib/api', () => ({ api: read, ApiError: class ApiError extends Error { status = 503; } }));
import { GET } from './route';
const config = { id: 'current', is_enabled: false, safe_reserve_wld: '0', max_single_investment_wld: '100',
  reinvestment_ratio_pct: 15, max_investment_ratio_pct: 20, equity_ratio_pct: 60,
  bond_ratio_pct: 30, dividend_ratio_pct: 10 };
beforeEach(() => read.mockReset());
describe('authenticated SWF read BFF', () => {
  it('returns validated financial evidence with a private no-store response', async () => {
    read.mockResolvedValueOnce({ config, portfolios: [], events: [] });
    const res = await GET();
    expect(res.status).toBe(200);
    expect(res.headers.get('Cache-Control')).toContain('no-store');
    expect(await res.json()).toEqual({ config, portfolios: [], events: [] });
    expect(read).toHaveBeenCalledWith('/api/v1/admin/treasury/swf');
  });
  it('rejects a successful backend response containing unverified financial data', async () => {
    read.mockResolvedValueOnce({ config: { ...config, safe_reserve_wld: 'NaN' }, portfolios: [], events: [] });
    const res = await GET();
    expect(res.status).toBe(503);
    expect(res.headers.get('Cache-Control')).toContain('no-store');
    expect(await res.json()).toMatchObject({ code: 'SWF_EVIDENCE_UNVERIFIED' });
  });
  it('does not cache backend errors', async () => {
    read.mockRejectedValueOnce(new Error('down'));
    const res = await GET();
    expect(res.status).toBeGreaterThanOrEqual(500);
    expect(res.headers.get('Cache-Control')).toContain('no-store');
  });
});
