import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { AuctionView } from './auction-view';

const respond = (ok: boolean, body: unknown) => ({ ok, json: async () => body });

describe('owner auction source and bid truth', () => {
  afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

  it('does not render fictional bids or escrow success when the backend fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(respond(false, { status: 503 })));
    render(<AuctionView userBalanceWld="1000" />);
    await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('조회할 수 없습니다'));
    expect(screen.queryByText('초대총독_알렉스')).toBeNull();
    expect(screen.queryByText(/안전 에스크로에 잠금되었습니다/)).toBeNull();
    expect(screen.getByRole('button', { name: /다시 조회/ })).toBeTruthy();
  });

  it('distinguishes verified empty auctions from unavailable auctions', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(respond(true, [])));
    render(<AuctionView userBalanceWld="1000" />);
    await waitFor(() => expect(screen.getByRole('status').textContent).toContain('진행 중인 경매가 없습니다'));
  });

  it('rejects malformed auction responses rather than showing false empty', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(respond(true, [{ id: 'auc_fake', currentBidWld: '100' }])));
    render(<AuctionView userBalanceWld="1000" />);
    await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('조회할 수 없습니다'));
  });
  it('shows only validated source auctions and disables unledgered bids', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(respond(true, [{
      id: '11111111-1111-4111-8111-111111111111', itemName: 'Verified item',
      sellerName: 'Verified seller', rarity: 'EPIC', currentBidWld: '1000',
      startPriceWld: '500', bidCount: 2, endsAt: '2026-11-01T10:00:00Z',
      description: 'Authoritative auction',
    }])));
    render(<AuctionView userBalanceWld="1000" />);
    await waitFor(() => expect(screen.getByText('Verified item')).toBeTruthy());
    expect(screen.getByRole('button', { name: /Verified item 입찰 이용 불가/ }).hasAttribute('disabled')).toBe(true);
    expect(screen.queryByText('초대총독_알렉스')).toBeNull();
  });
});
