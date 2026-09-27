import { describe, expect, it, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import { AuctionLiveToastStream, AuctionLiveTickerStrip, type LiveBidEvent } from './auction-live-toast-stream';

describe('AuctionLiveTickerStrip', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('renders live bidding ticker strip with status indicator', () => {
    render(<AuctionLiveTickerStrip />);

    expect(screen.getByText('LIVE 입찰 티커:')).toBeTruthy();
    expect(screen.getByText('소켓 연결됨 (60fps)')).toBeTruthy();
    expect(screen.getByText('황금 호가창 네온 테마')).toBeTruthy();
  });
});

describe('AuctionLiveToastStream', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('renders live toast stream on bid event dispatch', () => {
    render(<AuctionLiveToastStream />);

    act(() => {
      const bidEvent: LiveBidEvent = {
        id: 'test-bid-1',
        auctionId: 'auc-1',
        itemTitle: '테스트 네온 테마',
        itemRarity: 'mythic',
        bidAmount: 99000,
        bidderName: '테스터',
        isPlusUser: true,
        timestamp: '방금 전',
      };
      window.dispatchEvent(new CustomEvent('auction:bid-placed', { detail: bidEvent }));
    });

    expect(screen.getByText('⚡ 실시간 신규 입찰')).toBeTruthy();
    expect(screen.getByText('테스트 네온 테마')).toBeTruthy();
    expect(screen.getByText('99,000 WLD')).toBeTruthy();
    expect(screen.getByText('PLUS VIP')).toBeTruthy();
  });
});
