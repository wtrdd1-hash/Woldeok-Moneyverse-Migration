import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
const { read, gate } = vi.hoisted(() => ({ read: vi.fn(), gate: vi.fn() }));
vi.mock('@/lib/api', () => ({ apiOrNull: read }));
vi.mock('@/lib/session', () => ({ requireMember: gate }));
vi.mock('@/lib/locale-server', () => ({ getServerLocale: vi.fn(async () => 'ko') }));
vi.mock('../watchlist-toggle', () => ({ WatchlistToggle: () => null }));
import Page from './page';

const row = (price: string, open: string) => ({
  stock_id: '00000000-0000-4000-8000-000000000012', symbol: 'WLD', name: '테스트',
  current_price: price, day_open_price: open, created_at: '2026-10-30T00:00:00Z',
});

beforeEach(() => { vi.clearAllMocks(); read.mockResolvedValue({ stocks: [row('11', '10')] }); });

async function render(trend?: string | string[]) {
  return renderToStaticMarkup(await Page({ searchParams: Promise.resolve(trend === undefined ? {} : { trend }) }));
}

describe('owner watchlist trend page', () => {
  it('exposes a labeled rising/falling/flat filter and calls the owner API with selected trend', async () => {
    const html = await render('up');
    expect(read).toHaveBeenCalledWith('/api/v1/stocks/watchlist?trend=up');
    expect(html).toContain('name="trend"');
    expect(html).toContain('관심 종목 당일 등락 필터');
    expect(html).toContain('상승');
    expect(html).toContain('WLD');
  });
  it('rejects ambiguous trend and does not make a backend call', async () => {
    const html = await render(['up', 'down']);
    expect(read).not.toHaveBeenCalled();
    expect(html).toContain('등락 필터가 올바르지 않습니다');
  });
  it('distinguishes a selected-trend empty result from an empty saved watchlist', async () => {
    read.mockResolvedValue({ stocks: [] });
    const html = await render('up');
    expect(html).toContain('선택한 등락 조건에 맞는 관심 종목이 없습니다');
    expect(html).toContain('href="/stocks/watchlist"');
    expect(html).not.toContain('아직 관심 종목이 없습니다');
  });
  it('does not display mismatched stale backend stock evidence as success', async () => {
    read.mockResolvedValue({ stocks: [row('9', '10')] });
    const html = await render('up');
    expect(html).toContain('관심 종목을 불러오지 못했어요');
    expect(html).not.toContain('테스트</');
  });
});
