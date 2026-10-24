import { describe, expect, it, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import { AuctionLiveTickerStrip } from './auction-live-toast-stream';

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

