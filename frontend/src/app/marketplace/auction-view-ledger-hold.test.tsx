import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AuctionView } from './auction-view';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('verified marketplace auction browser', () => {
  it('never renders invented starter listings while loading or when server reports empty', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('[]', {
      status: 200,
      headers: { 'content-type': 'application/json' },
    })));
    render(<AuctionView userBalanceWld="0" />);
    expect(screen.queryByText(/First Capital 기념 골드 메달/)).toBeNull();
    await screen.findByText(/확인된 경매 매물이 없습니다/);
    expect(screen.queryByRole('button', { name: /입찰 확정|호가 입찰 참여하기/ })).toBeNull();
    expect(screen.getByText(/경매 입찰.*중단/)).toBeDefined();
  });

  it('shows an error instead of inventing an auction or escrow receipt on backend failure', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ status: 503 }), {
      status: 503,
      headers: { 'content-type': 'application/json' },
    })));
    render(<AuctionView userBalanceWld="1000000" />);
    await screen.findByRole('alert');
    expect(screen.queryByText(/First Capital 기념 골드 메달/)).toBeNull();
    expect(screen.queryByText(/에스크로에 (잠금|보관)되었습니다/)).toBeNull();
  });

  it('shows only verified server listings and never permits financial bids', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify([{
      id: '22222222-2222-4222-8222-222222222222',
      itemName: '서버 확인 물품',
      itemCode: 'VERIFIED_ITEM',
      category: 'display',
      rarity: 'RARE',
      sellerId: '11111111-1111-4111-8111-111111111111',
      sellerName: '출품자',
      startPriceWld: '90071992547409930000.0000',
      currentBidWld: '90071992547409930000.0000',
      highestBidderId: null,
      highestBidderName: null,
      bidCount: 0,
      endsAt: '2026-12-31T00:00:00Z',
      description: '',
    }]), { status: 200, headers: { 'content-type': 'application/json' } })));
    render(<AuctionView userBalanceWld="90071992547409930001" />);
    await screen.findByText('서버 확인 물품');
    expect(screen.getByText(/90,071,992,547,409,930,000/)).toBeDefined();
    expect(screen.queryByRole('button', { name: /입찰 확정|호가 입찰 참여하기/ })).toBeNull();
  });

  it('rejects malformed successful responses rather than treating them as an empty verified market', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify([{ id: 'auc_01', currentBidWld: 'NaN' }]), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    })));
    render(<AuctionView userBalanceWld="1000" />);
    await waitFor(() => expect(screen.getByRole('alert')).toBeDefined());
    expect(screen.queryByText(/확인된 경매 매물이 없습니다/)).toBeNull();
  });
});
