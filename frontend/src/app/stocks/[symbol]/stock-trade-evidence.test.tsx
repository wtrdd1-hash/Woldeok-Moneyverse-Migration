import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StockMarketToast } from './stock-market-toast';
import { StockOrderbook } from './stock-orderbook';

const feed = vi.hoisted(() => ({
  trades: [] as Array<{ id: string; stockId: string; price: string; quantity: number; side: 'BUY' | 'SELL'; timestamp: string }>,
}));

vi.mock('@/lib/use-market-prices', () => ({
  useQuote: (_stockId: string, fallback: unknown) => fallback,
  useStockTrades: () => feed.trades,
}));

beforeEach(() => { feed.trades = []; });
afterEach(() => { vi.useRealTimers(); });

describe('server-confirmed stock execution UI', () => {
  it('never fabricates a live trade after fourteen seconds without a server event', () => {
    vi.useFakeTimers();
    render(<StockMarketToast stockId="stock-1" symbol="WDX" isEn />);
    act(() => { vi.advanceTimersByTime(28_000); });
    expect(screen.queryByText(/Live Trade/)).toBeNull();
  });

  it('does not fabricate recent trades from the current price on initial render', () => {
    render(<StockOrderbook stockId="stock-1" currentPrice="15,000" isEn />);
    expect(screen.getByText(/No confirmed trades received/i)).toBeDefined();
    expect(screen.queryByText(/10sh|27sh|44sh/)).toBeNull();
  });

  it('shows only server-confirmed execution price, quantity and direction', () => {
    feed.trades = [{
      id: 'confirmed-uuid',
      stockId: 'stock-1',
      price: '17234',
      quantity: 7,
      side: 'BUY',
      timestamp: '2026-10-23T20:00:00.000Z',
    }];
    render(
      <>
        <StockMarketToast stockId="stock-1" symbol="WDX" isEn />
        <StockOrderbook stockId="stock-1" currentPrice="15,000" isEn />
      </>,
    );
    expect(screen.getByText(/Live Trade/)).toBeDefined();
    expect(screen.getAllByText(/17,234/).length).toBeGreaterThan(0);
    expect(screen.getByText(/7sh \(Buy\)/)).toBeDefined();
    expect(screen.getByText(/Recent Trades/)).toBeDefined();
  });

  it('does not render another stock’s execution', () => {
    feed.trades = [{
      id: 'different',
      stockId: 'stock-2',
      price: '99000',
      quantity: 99,
      side: 'SELL',
      timestamp: '2026-10-23T20:00:00.000Z',
    }];
    render(<StockMarketToast stockId="stock-1" symbol="WDX" isEn />);
    expect(screen.queryByText(/Live Trade/)).toBeNull();
  });
});
