import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';

const mocks = vi.hoisted(() => ({ publicApi: vi.fn(), api: vi.fn() }));
vi.mock('@/lib/api', () => ({ publicApi: mocks.publicApi, api: mocks.api }));
vi.mock('./bonds-portal-client', () => ({ BondsPortalClient: ({ initialBonds, isLoggedIn, holdingsStatus, repoStatus }: { initialBonds: unknown[]; isLoggedIn: boolean; holdingsStatus: string; repoStatus: string }) =>
  createElement('div', { 'data-testid': 'verified-bonds', 'data-authenticated': isLoggedIn, 'data-holdings-status': holdingsStatus, 'data-repo-status': repoStatus }, `${initialBonds.length} verified bonds`) }));
vi.mock('@/components/treasury-donation-card', () => ({ TreasuryDonationCard: () => createElement('div') }));
import PublicBondsPage from './page';

const now = new Date().toISOString();
const bond = { id: 'c69c4696-2f6c-43f8-ae1e-58bbcd77a1d8', symbol: 'KTB-01Y',
  name: '가상 채권', maturity_hours: 8760, annual_coupon_rate_bps: 450,
  hourly_coupon_rate_bps: 5, par_value_wld: '10000', total_issued_units: '100',
  available_units: '90', total_funded_wld: '100000', status: 'OPEN_SUBSCRIPTION', description: '' };

describe('bond market SSR and real API integration', () => {
  beforeEach(() => { mocks.publicApi.mockReset(); mocks.api.mockReset(); });
  it('renders an accessible unavailable state with no fabricated yield or purchase controls on API outage', async () => {
    mocks.publicApi.mockResolvedValue(null);
    const markup = renderToStaticMarkup(await PublicBondsPage());
    expect(markup).toContain('role="alert"');
    expect(markup).toContain('국채 시장 정보를 확인할 수 없습니다');
    expect(markup).not.toContain('4.50%');
    expect(markup).not.toContain('verified-bonds');
    expect(mocks.api).not.toHaveBeenCalled();
  });
  it('passes only verified backend bond data to the real member UI', async () => {
    mocks.publicApi.mockResolvedValue({ disclosed_at: now, overview: {
      totalBondsActive: 1, totalFundedWld: '100000', totalHoldersCount: 1,
      totalCouponsPaidWld: '0', benchmark1YYield: '4.50%', benchmark3YYield: '5.20%', benchmark5YYield: '6.50%',
    }, bonds: [bond] });
    mocks.api.mockRejectedValue(new Error('guest'));
    const markup = renderToStaticMarkup(await PublicBondsPage());
    expect(markup).toContain('1 verified bonds');
    expect(markup).toContain('서버 조회');
    expect(mocks.publicApi).toHaveBeenCalledWith('/api/v1/bonds/markets', 30);
  });
});

const market = { disclosed_at: new Date().toISOString(), overview: {
  totalBondsActive: 1, totalFundedWld: '100000', totalHoldersCount: 1,
  totalCouponsPaidWld: '0', benchmark1YYield: '4.50%', benchmark3YYield: '5.20%', benchmark5YYield: '6.50%',
}, bonds: [bond] };

describe('bond owner SSR outage and guest differentiation', () => {
  beforeEach(() => { mocks.publicApi.mockReset().mockResolvedValue(market); mocks.api.mockReset(); });
  it('does not mistake authenticated owner holdings failure for a guest or verified empty holdings', async () => {
    mocks.api.mockImplementation(async (path: string) => {
      if (path === '/api/v1/auth/session') return { csrfToken: 'token' };
      if (path === '/api/v1/bonds/my-holdings') throw new Error('db offline');
      return [];
    });
    const html = renderToStaticMarkup(await PublicBondsPage());
    expect(html).toContain('data-authenticated="true"');
    expect(html).toContain('data-holdings-status="unavailable"');
    expect(html).toContain('data-repo-status="verified"');
  });
  it('distinguishes a verified empty owner portfolio from an outage', async () => {
    mocks.api.mockImplementation(async (path: string) => path === '/api/v1/auth/session' ? { csrfToken: 'token' } : []);
    const html = renderToStaticMarkup(await PublicBondsPage());
    expect(html).toContain('data-holdings-status="verified"');
    expect(html).toContain('data-repo-status="verified"');
  });
  it('labels a proven 401 session as guest, not a verified empty portfolio', async () => {
    mocks.api.mockRejectedValue(Object.assign(new Error('signed out'), { status: 401 }));
    const html = renderToStaticMarkup(await PublicBondsPage());
    expect(html).toContain('data-holdings-status="guest"');
    expect(html).toContain('data-repo-status="guest"');
  });
  it('rejects invalid owner rows independently of a verified repo read', async () => {
    mocks.api.mockImplementation(async (path: string) => {
      if (path === '/api/v1/auth/session') return { csrfToken: 'token' };
      if (path === '/api/v1/bonds/my-holdings') return [{ id: 'invalid' }];
      return [];
    });
    const html = renderToStaticMarkup(await PublicBondsPage());
    expect(html).toContain('data-holdings-status="unavailable"');
    expect(html).toContain('data-repo-status="verified"');
  });
  it('does not treat an auth-service failure as a logged-out member', async () => {
    mocks.api.mockRejectedValue(new Error('auth service offline'));
    const html = renderToStaticMarkup(await PublicBondsPage());
    expect(html).toContain('data-holdings-status="unavailable"');
    expect(html).toContain('data-repo-status="unavailable"');
  });
});
