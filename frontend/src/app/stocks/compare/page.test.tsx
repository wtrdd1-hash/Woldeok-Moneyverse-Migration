import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { marketRead, memberGate } = vi.hoisted(() => ({ marketRead: vi.fn(), memberGate: vi.fn() }));
vi.mock('@/lib/api', () => ({ apiOrNull: marketRead }));
vi.mock('@/lib/session', () => ({ requireMember: memberGate }));
vi.mock('@/lib/locale-server', () => ({ getServerLocale: async () => 'ko' }));
vi.mock('../stock-comparison', () => ({ StockComparison: ({ stocks }: { stocks: unknown[] }) => <div data-testid="verified-comparison">{stocks.length} verified stocks</div> }));
import StockComparePage, { metadata } from './page';

const first = { id: '11111111-1111-4111-8111-111111111111', symbol: 'AAA', name: 'Alpha', current_price: '200', day_open_price: '100', day_high_price: '210', day_low_price: '90', shares_available: '10' };
const second = { ...first, id: '22222222-2222-4222-8222-222222222222', symbol: 'BBB', name: 'Beta' };
const params = { searchParams: Promise.resolve({ symbols: 'AAA,BBB' }) };

beforeEach(() => { vi.clearAllMocks(); memberGate.mockResolvedValue(undefined); });

describe('stock comparison verified backend integration', () => {
  it('gates the member session and renders only verified market records', async () => {
    marketRead.mockResolvedValue({ stocks: [first, second] });
    const html = renderToStaticMarkup(await StockComparePage(params));
    expect(memberGate).toHaveBeenCalledOnce();
    expect(marketRead).toHaveBeenCalledWith('/api/v1/stocks');
    expect(html).toContain('2 verified stocks');
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });

  it('fails closed with accessible retry on invalid backend prices or list shape', async () => {
    for (const payload of [{ stocks: [{ ...first, current_price: 'bad' }, second] }, { stocks: {} }, null]) {
      marketRead.mockResolvedValueOnce(payload);
      const html = renderToStaticMarkup(await StockComparePage(params));
      expect(html).toContain('role="alert"');
      expect(html).toContain('href="/stocks/compare"');
      expect(html).not.toContain('data-testid="verified-comparison"');
    }
  });

  it('does not mislabel a verified empty market as an API failure', async () => {
    marketRead.mockResolvedValue({ stocks: [] });
    const html = renderToStaticMarkup(await StockComparePage(params));
    expect(html).toContain('비교하려면 거래 가능한 종목이 2개 이상 필요합니다.');
    expect(html).not.toContain('role="alert"');
  });
});
