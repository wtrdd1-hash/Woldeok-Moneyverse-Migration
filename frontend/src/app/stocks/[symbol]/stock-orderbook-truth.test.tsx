import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { computeOrderbook, StockOrderbook } from './stock-orderbook';

describe('verified stock price reference', () => {
  it('does not invent order quantities, market pressure or executable depth', () => {
    const reference = computeOrderbook('15000', 10);
    expect(reference.asks).toHaveLength(10);
    expect(reference.bids).toHaveLength(10);
    expect(reference.asks.every((row) => row.volume === 0)).toBe(true);
    expect(reference.bids.every((row) => row.volume === 0)).toBe(true);
    expect(reference.totalAskVolume).toBe(0);
    expect(reference.totalBidVolume).toBe(0);
  });

  it('labels derived price steps as non-executable references and keeps keyboard-accessible manual selection', () => {
    const onSelectPrice = vi.fn();
    render(<StockOrderbook stockId="WDG" currentPrice="15,000" onSelectPrice={onSelectPrice} />);
    expect(screen.getByText(/가격 참조표/)).toBeTruthy();
    expect(screen.getByRole('status').textContent).toContain('실제 매수·매도 주문 잔량이 아닙니다');
    expect(screen.queryByText(/체결강도/)).toBeNull();
    expect(screen.queryByText(/스프레드/)).toBeNull();
    expect(screen.queryByText(/매도 \d+%/)).toBeNull();
    const priceButton = screen.getAllByRole('button', { name: /참조 가격.*매수 단가 입력/ })[0];
    expect(priceButton).toBeTruthy();
    fireEvent.click(priceButton!);
    expect(onSelectPrice).toHaveBeenCalledWith(expect.stringMatching(/^\d+$/), 'buy');
  });
});
