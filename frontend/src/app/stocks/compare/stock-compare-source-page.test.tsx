import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
const { read, member } = vi.hoisted(() => ({ read: vi.fn(), member: vi.fn() }));
vi.mock('@/lib/api', () => ({ apiOrNull: read }));
vi.mock('@/lib/session', () => ({ requireMember: member }));
vi.mock('@/lib/locale-server', () => ({ getServerLocale: async () => 'ko' }));
vi.mock('../stock-comparison', () => ({ StockComparison: () => <div data-testid="comparison-ready">Verified comparison</div> }));
import StockComparePage from './page';

const row = { id: '00000000-0000-4000-8000-000000000001', symbol: 'AAA', name: 'Alpha', current_price: '100', day_open_price: '90', day_high_price: '110', day_low_price: '80', shares_available: '10' };
const second = { ...row, id: '00000000-0000-4000-8000-000000000002', symbol: 'BBB' };
async function pageHtml() { return renderToStaticMarkup(await StockComparePage({ searchParams: Promise.resolve({}) })); }

beforeEach(() => { read.mockReset(); member.mockReset(); });

describe('member stock comparison source boundary', () => {
  it('shows an accessible retry rather than claiming an empty market on malformed data', async () => {
    read.mockResolvedValue({ stocks: [{ ...row, current_price: 'oops' }, second] });
    const html = await pageHtml();
    expect(member).toHaveBeenCalledOnce();
    expect(read).toHaveBeenCalledWith('/api/v1/stocks');
    expect(html).toContain('role="alert"');
    expect(html).toContain('href="/stocks/compare"');
    expect(html).not.toContain('comparison-ready');
    expect(html).not.toContain('비교하려면 거래 가능한 종목이 2개 이상');
  });

  it('distinguishes verified insufficient listings from unavailable', async () => {
    read.mockResolvedValue({ stocks: [row] });
    const html = await pageHtml();
    expect(html).toContain('비교하려면 거래 가능한 종목이 2개 이상');
    expect(html).not.toContain('role="alert"');
  });

  it('only renders a verified comparison with two valid stocks', async () => {
    read.mockResolvedValue({ stocks: [row, second] });
    expect(await pageHtml()).toContain('comparison-ready');
  });
});
