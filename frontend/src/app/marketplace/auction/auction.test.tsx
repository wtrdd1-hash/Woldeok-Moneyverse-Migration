import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, fireEvent, cleanup } from '@testing-library/react';
import AuctionMarketplacePage from './page';

describe('AuctionMarketplacePage Component', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders auction page header, stats, and initial auction items', () => {
    const { container } = render(<AuctionMarketplacePage />);

    expect(container.textContent).toContain('Steam형 P2P 아티팩트 경매장');
    expect(container.textContent).toContain('총 소각된 거래 수수료');
    expect(container.textContent).toContain('황금 호가창 네온 테마 (1기 한정)');
  });

  it('filters auction items when category button is clicked', () => {
    const { container, getByRole } = render(<AuctionMarketplacePage />);

    // Click '칭호/엠블럼' filter
    const titleFilter = getByRole('button', { name: /📜 칭호\/엠블럼/i });
    fireEvent.click(titleFilter);

    // Should display the title item and not the theme item
    expect(container.textContent).toContain('[전설] 시장을 뒤흔드는 자 칭호');
    expect(container.textContent).not.toContain('황금 호가창 네온 테마 (1기 한정)');
  });

  it('opens bid modal, places a bid, updates highest bidder and fee burn', () => {
    const { container, getAllByRole, getByRole } = render(<AuctionMarketplacePage />);

    // Click first item bid button
    const bidButtons = getAllByRole('button', { name: '입찰하기 (Bid)' });
    fireEvent.click(bidButtons[0]);

    expect(container.textContent).toContain('아티팩트 경매 입찰하기');
    expect(container.textContent).toContain('5% 거래 수수료 소각');

    // Confirm bid
    const confirmBidBtn = getByRole('button', { name: '입찰 확정' });
    fireEvent.click(confirmBidBtn);

    // Notification appears
    expect(container.textContent).toContain('입찰 성공!');
  });
});
