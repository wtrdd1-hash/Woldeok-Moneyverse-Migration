import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BlackMarketAuctionModal } from './black-market-auction-modal';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('secret auction ledger protection in member UI', () => {
  it('explains settlement hold and never offers a new bidding action', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ auctions: [] }) });
    vi.stubGlobal('fetch', fetchMock);
    render(<BlackMarketAuctionModal isOpen onClose={() => {}} />);
    expect(screen.getByRole('status').textContent).toContain('원장 정산 검증 중');
    expect(screen.queryByRole('button', { name: /WLD 입찰하기/ })).toBeNull();
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(fetchMock.mock.calls.every(([url, options]) =>
      String(url).startsWith('/api/market/secret-auction') && options?.method !== 'POST')).toBe(true);
  });

  it('renders operational ledger banner and enables bidding when operational flag is set', async () => {
    vi.stubEnv('NEXT_PUBLIC_MONEYVERSE_BLACK_MARKET_OPERATIONAL', 'true');
    const fetchMock = vi.fn().mockImplementation((url) => {
      if (String(url).endsWith('/bid')) {
        return Promise.resolve({ ok: true, json: async () => ({ logs: [] }) });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({
          auctions: [
            {
              id: 'auc-1',
              itemCode: 'ITEM_SPECIAL',
              itemTitle: '전설의 아이템',
              itemDescription: '설명',
              itemIcon: '👑',
              itemBuffType: 'BUFF',
              itemBuffValue: 10,
              startsAt: new Date().toISOString(),
              endsAt: new Date(Date.now() + 3600000).toISOString(),
              startingBid: 10000,
              currentBid: 15000,
              highestBidderId: 'user-1',
              highestBidderName: '테스터',
              bidCount: 2,
              status: 'active',
              remainingSeconds: 3600,
            },
          ],
        }),
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<BlackMarketAuctionModal isOpen onClose={() => {}} />);
    expect(screen.getByRole('status').textContent).toContain('원장 정산 검증 완료');
    await waitFor(() => expect(screen.getByRole('button', { name: /WLD 입찰하기/ })).toBeDefined());
  });
});
