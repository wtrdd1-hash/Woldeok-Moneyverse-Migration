import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import PublicEnterprisesPage, { metadata } from './page';
const api = vi.hoisted(() => vi.fn());
vi.mock('@/lib/api', () => ({ publicApi: api }));

const overview = {
  holding_name: 'Verified WSHC', holding_code: 'WSHC_SOE_HOLDING', total_soe_assets_wld: '0',
  hourly_soe_revenue_wld: '0', hourly_soe_profit_wld: '0', hourly_soe_dividends_wld: '0', governance_model: 'verified',
};
const disclosure = { overview, soes: [], disclosed_at: '2026-11-01T20:00:00.000Z', standards: 'reference' };

describe('public enterprise page', () => {
  beforeEach(() => api.mockReset());
  it('keeps unverified disclosure out of search snippets', () => {
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });
  it('fails closed on backend outage with accessible retry, never invented WLD', async () => {
    api.mockResolvedValue(null);
    const html = renderToStaticMarkup(await PublicEnterprisesPage());
    expect(html).toContain('role="alert"');
    expect(html).toContain('href="/enterprises"');
    expect(html).not.toContain('365,000,000');
    expect(html).not.toContain('강전력');
    expect(html).not.toContain('실시간 공시');
  });
  it('renders authoritative zero/empty without invented rows or settlement claims', async () => {
    api.mockResolvedValue(disclosure);
    const html = renderToStaticMarkup(await PublicEnterprisesPage());
    expect(html).toContain('Verified WSHC');
    expect(html).toContain('조회 결과에 공기업이 없습니다');
    expect(html).not.toContain('강전력');
    expect(html).not.toContain('국고 귀속 배당금 (30%)');
    expect(html).toContain('예상 배당');
  });
  it('fails closed when upstream reports malformed money', async () => {
    api.mockResolvedValue({ ...disclosure, overview: { ...overview, total_soe_assets_wld: 'NaN' } });
    const html = renderToStaticMarkup(await PublicEnterprisesPage());
    expect(html).toContain('role="alert"');
  });
});
