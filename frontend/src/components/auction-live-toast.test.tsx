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
    expect(screen.getByText(/PLUS VIP/i)).toBeTruthy();
  });

  it('renders anti-sniping extension toast on event dispatch', () => {
    render(<AuctionLiveToastStream />);

    act(() => {
      window.dispatchEvent(
        new CustomEvent('auction:anti-sniping-extended', {
          detail: {
            auctionId: 'auc-1',
            itemTitle: '황금 호가창 네온 테마',
            extendedMinutes: 2,
          },
        }),
      );
    });

    expect(screen.getByText('🛡️ 안티 스나이핑 2분 연장')).toBeTruthy();
    expect(screen.getByText(/마감 1분 전 최고가 입찰로 마감 시간이 2분 자동 연장되었습니다/i)).toBeTruthy();
  });
});

import { AuctionDepthChart } from './auction-depth-chart';
import { VipThemeSelector } from './vip-theme-selector';

describe('AuctionDepthChart & VipThemeSelector', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('renders AuctionDepthChart with ticks tab and order depth toggle', () => {
    render(
      <AuctionDepthChart
        currentBid={85000}
        startPrice={50000}
        itemName="테스트 아티팩트"
      />,
    );

    expect(screen.getByText(/테스트 아티팩트 실시간 호가\/입찰 틱/i)).toBeTruthy();
    expect(screen.getByText('85,000')).toBeTruthy();
    expect(screen.getByText('입찰 틱 차트')).toBeTruthy();
    expect(screen.getByText('호가 Depth')).toBeTruthy();

    // Toggle Depth Tab
    fireEvent.click(screen.getByText('호가 Depth'));
    expect(screen.getByText('호가 구간')).toBeTruthy();
    expect(screen.getByText('누적 매수 풀')).toBeTruthy();
  });

  it('renders VipThemeSelector with 5 neon theme choices and allows selection', () => {
    const handleSelect = vi.fn();
    render(
      <VipThemeSelector
        isPlusUser={true}
        selectedTheme="royal-gold"
        onSelectTheme={handleSelect}
      />,
    );

    expect(screen.getByText('Plus VIP 네온 테마')).toBeTruthy();
    expect(screen.getByText('로얄 골드')).toBeTruthy();
    expect(screen.getByText('사이버 핑크')).toBeTruthy();
    expect(screen.getByText('에메랄드 볼트')).toBeTruthy();
    expect(screen.getByText('사파이어 딥')).toBeTruthy();
    expect(screen.getByText('옵시디언 다크')).toBeTruthy();

    fireEvent.click(screen.getByText('사이버 핑크'));
    expect(handleSelect).toHaveBeenCalledWith('cyber-pink');
  });
});

