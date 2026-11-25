import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

/**
 * QA 2026-11-25: /marketplace/auction showed invented lots ("황금 호가창 네온
 * 테마 (1기 한정)") and a stream of invented bids. It now lists the
 * black_market_auctions rows the API returns, read-only.
 */
const apiOrNull = vi.fn();
vi.mock('@/lib/api', () => ({ apiOrNull: (...a: unknown[]) => apiOrNull(...a) }));
const { default: AuctionPage } = await import('./page');

const LOT = {
  id: 'be1af0dc-718a-4949-9d01-8aefeca992d6', itemTitle: '불멸의 골드 드래곤 아우라', itemDescription: '신화급 치장',
  remainingSeconds: 3600, startingBid: 5000000, currentBid: 5200000, bidCount: 3, status: 'active',
};

describe('auction page', () => {
  it('lists the API lots with their real bids', async () => {
    apiOrNull.mockResolvedValue({ success: true, data: { auctions: [LOT] } });
    const html = renderToStaticMarkup(await AuctionPage());
    expect(html).toContain('불멸의 골드 드래곤 아우라');
    expect(html).toContain('5,200,000');
    expect(html).not.toContain('황금 호가창 네온 테마');
  });
  it('marks a lot whose time is up as closed', async () => {
    apiOrNull.mockResolvedValue({ success: true, data: { auctions: [{ ...LOT, remainingSeconds: 0 }] } });
    expect(renderToStaticMarkup(await AuctionPage())).toContain('마감');
  });
  it('shows an unavailable state, not invented lots, when the API does not answer', async () => {
    apiOrNull.mockResolvedValue(null);
    const html = renderToStaticMarkup(await AuctionPage());
    expect(html).toContain('불러올 수 없');
  });
});
