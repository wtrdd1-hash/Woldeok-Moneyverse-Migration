import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ mutate: vi.fn(), api: vi.fn() }));
vi.mock('@/lib/mutate', () => ({ mutate: mocks.mutate }));
vi.mock('@/lib/api', () => ({ api: mocks.api, ApiError: class ApiError extends Error { status = 503; } }));
import { PUT } from './route';

const config = {
  id: 'current', is_enabled: false, safe_reserve_wld: '9007199254740993',
  max_single_investment_wld: '3000000', reinvestment_ratio_pct: 15,
  max_investment_ratio_pct: 20, equity_ratio_pct: 60, bond_ratio_pct: 30,
  dividend_ratio_pct: 10,
};
function req(origin: string | null) {
  return new Request('https://easy-scraping.com/api/admin/treasury/swf', {
    method: 'PUT',
    headers: { 'content-type': 'application/json', ...(origin ? { origin } : {}) },
    body: JSON.stringify(config),
  });
}
beforeEach(() => vi.clearAllMocks());
afterEach(() => vi.unstubAllEnvs());
describe('SWF configuration gateway actor/CSRF fencing', () => {
  it('denies missing-origin and cross-origin submissions without any mutation', async () => {
    expect((await PUT(req(null))).status).toBe(403);
    expect((await PUT(req('https://attacker.invalid'))).status).toBe(403);
    expect(mocks.mutate).not.toHaveBeenCalled();
  });
  it('accepts canonical HTTPS origin when the internal reverse proxy request URL is HTTP', async () => {
    vi.stubEnv('APP_BASE_URL', 'https://test.easy-scraping.com');
    mocks.mutate.mockResolvedValueOnce(config);
    const behindProxy = new Request('http://127.0.0.1:3935/api/admin/treasury/swf', {
      method: 'PUT',
      headers: {
        'content-type': 'application/json',
        origin: 'https://test.easy-scraping.com',
        host: 'test.easy-scraping.com',
        'x-forwarded-proto': 'https',
      },
      body: JSON.stringify(config),
    });
    expect((await PUT(behindProxy)).status).toBe(200);
    expect(mocks.mutate).toHaveBeenCalledTimes(1);
  });
  it('uses server-only one-use CSRF mutation and validates returned evidence', async () => {
    mocks.mutate.mockResolvedValueOnce(config);
    const res = await PUT(req('https://easy-scraping.com'));
    expect(res.status).toBe(200);
    expect(res.headers.get('Cache-Control')).toContain('no-store');
    expect(await res.json()).toEqual(config);
    expect(mocks.mutate).toHaveBeenCalledWith('/api/v1/admin/treasury/swf/config',
      expect.objectContaining({ method: 'PUT' }));
  });
  it('rejects malformed successful upstream data instead of displaying saved policy', async () => {
    mocks.mutate.mockResolvedValueOnce({ ...config, safe_reserve_wld: 9007199254740992 });
    const res = await PUT(req('https://easy-scraping.com'));
    expect(res.status).toBe(503);
    expect(res.headers.get('Cache-Control')).toContain('no-store');
  });
});
