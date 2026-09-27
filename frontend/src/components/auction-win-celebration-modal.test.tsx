import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import React from 'react';
import { AuctionWinCelebrationModal } from './auction-win-celebration-modal';

describe('AuctionWinCelebrationModal', () => {
  it('should not render when isOpen is false', () => {
    const { container } = render(
      <AuctionWinCelebrationModal
        isOpen={false}
        onClose={() => {}}
        itemTitle="전설의 황금 오리 조각상"
        finalBidWld={150000}
        burnFeeWld={3750}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('should render victory details, final bid, burn fee, and trigger sound when isOpen is true', () => {
    const handleClose = vi.fn();

    render(
      <AuctionWinCelebrationModal
        isOpen={true}
        onClose={handleClose}
        itemTitle="전설의 황금 오리 조각상"
        itemRarity="Mythic"
        finalBidWld={200000}
        burnFeeWld={5000}
        vipSavedWld={5000}
        isPlusUser={true}
      />,
    );

    expect(screen.getByTestId('auction-win-modal')).toBeDefined();
    expect(screen.getByText('경매 낙찰 성공!')).toBeDefined();
    expect(screen.getByText('전설의 황금 오리 조각상')).toBeDefined();
    expect(screen.getByText('200,000 WLD')).toBeDefined();
    expect(screen.getByText('5,000 WLD')).toBeDefined();
    expect(screen.getByText(/Moneyverse Plus VIP 혜택으로/)).toBeDefined();

    const closeBtn = screen.getByText('닫기');
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
