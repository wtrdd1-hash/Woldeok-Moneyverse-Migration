import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
const { read, gate } = vi.hoisted(() => ({ read: vi.fn(), gate: vi.fn() }));
vi.mock('@/lib/api', () => ({ apiOrNull: read }));
vi.mock('@/lib/session', () => ({ requireAdminConsole: gate }));
vi.mock('./swf-control-panel', () => ({ SwfControlPanel: () => <div data-testid="verified-swf-console" /> }));
vi.mock('./treasury-view', () => ({ TreasuryView: () => <div data-testid="treasury-view" /> }));
import Page, { metadata } from './page';

const config = { id: 'current', is_enabled: false, safe_reserve_wld: '0', max_single_investment_wld: '100',
  reinvestment_ratio_pct: 15, max_investment_ratio_pct: 20, equity_ratio_pct: 60,
  bond_ratio_pct: 30, dividend_ratio_pct: 10 };
function mockReads(swf: unknown) {
  read.mockResolvedValueOnce({ total_treasury_wld: '1' }).mockResolvedValueOnce(null)
    .mockResolvedValueOnce(null).mockResolvedValueOnce(null).mockResolvedValueOnce(swf);
}
beforeEach(() => vi.clearAllMocks());
describe('SWF server rendering and authorization', () => {
  it('does not show fabricated reserves or a writable SWF console when SWF API fails', async () => {
    mockReads(null);
    const html = renderToStaticMarkup(await Page());
    expect(gate).toHaveBeenCalledWith('/admin/treasury');
    expect(html).toContain('국부펀드 관측 정보를 검증할 수 없습니다');
    expect(html).not.toContain('verified-swf-console');
    expect(html).toContain('treasury-view');
  });
  it('rejects incomplete SWF payloads but accepts a verified empty portfolio', async () => {
    mockReads({ config, portfolios: [{ id: 'bad' }], events: [] });
    expect(renderToStaticMarkup(await Page())).not.toContain('verified-swf-console');
    vi.clearAllMocks();
    mockReads({ config, portfolios: [], events: [] });
    expect(renderToStaticMarkup(await Page())).toContain('verified-swf-console');
  });
  it('marks private treasury console as non-indexable', () => {
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });
});
