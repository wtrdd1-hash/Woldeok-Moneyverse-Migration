import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AuctionMarketplacePage from './page';

describe('AuctionMarketplacePage Component', () => {
  it('renders auction page header, stats, and initial auction items', () => {
    render(<AuctionMarketplacePage />);

    expect(screen.getByText('Steam형 P2P 아티팩트 경매장')).toBeInTheDocument();
    expect(screen.getByText('총 소각된 거래 수수료')).toBeInTheDocument();
    expect(screen.getByText('황금 호가창 네온 테마 (1기 한정)')).toBeInTheDocument();
  });

  it('filters auction items when category button is clicked', () => {
    render(<AuctionMarketplacePage />);

    // Click '칭호/엠블럼' filter
    const titleFilter = screen.getByRole('button', { name: /📜 칭호\/엠블럼/i });
    fireEvent.click(titleFilter);

    // Should display the title item and not the theme item
    expect(screen.getByText('[전설] 시장을 뒤흔드는 자 칭호')).toBeInTheDocument();
    expect(screen.queryByText('황금 호가창 네온 테마 (1기 한정)')).not.toBeInTheDocument();
  });

  it('opens bid modal, places a bid, updates highest bidder and fee burn', () => {
    render(<AuctionMarketplacePage />);

    // Click first item bid button
    const bidButtons = screen.getAllByRole('button', { name: '입찰하기 (Bid)' });
    fireEvent.click(bidButtons[0]);

    expect(screen.getByText('아티팩트 경매 입찰하기')).toBeInTheDocument();
    expect(screen.getByText('5% 거래 수수료 소각')).toBeInTheDocument();

    // Confirm bid
    const confirmBidBtn = screen.getByRole('button', { name: '입찰 확정' });
    fireEvent.click(confirmBidBtn);

    // Notification appears
    expect(screen.getByText(/입찰 성공!/i)).toBeInTheDocument();
  });
});
