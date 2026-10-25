import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StockMarketToast } from './stock-market-toast';
import { StockOrderbook } from './stock-orderbook';

const feed = vi.hoisted(() => ({
  trades: [] as Array<{
    id: string;
    stockId: string;
    price: string;
    quantity: number;
    side: 'BUY' | 'SELL';
    timestamp: string;
  }>,
}));

vi.mock('@/lib/use-market-prices', () => ({
  useStockTrades: () => feed.trades,
  useQuote: (_id: string, fallback: unknown) => fallback,
}));

vi.mock('@/lib/audio-effects', () => ({ playStockTickSound: vi.fn() }));

const trade = {
  id: 'db-trade-1',
  stockId: 'stock-1',
  price: '15123',
  quantity: 7,
  side: 'BUY' as const,
  timestamp: '2026-10-25T03:47:00.000Z',
};

describe('verified stock execution feed', () => {
  beforeEach(() => {
    feed.trades = [];
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('never fabricates a live trade toast when the server sends no execution', () => {
    vi.useFakeTimers();
    const { container } = render(
      <StockMarketToast stockId="stock-1" symbol="WDG" currentPrice="15000" />,
    );
    act(() => vi.advanceTimersByTime(45_000));
    expect(container.querySelector('[role="status"]')).toBeNull();
  });

  it('shows only a newly received server trade, never a derived quote or invented quantity', () => {
    const { rerender } = render(
      <StockMarketToast stockId="stock-1" symbol="WDG" currentPrice="15000" />,
    );
    expect(screen.queryByText(/Live Trade|체결 틱/)).toBeNull();
    feed.trades = [trade];
    rerender(<StockMarketToast stockId="stock-1" symbol="WDG" currentPrice="15000" />);
    expect(screen.getByText(/15,123/)).toBeDefined();
    expect(screen.getByText(/7주/)).toBeDefined();
    expect(screen.queryByText(/10주/)).toBeNull();
    expect(screen.getByRole('button', { name: '알림 닫기' }).className).toContain('min-h-11');
  });

  it('does not show invented recent fills in the orderbook without real server events', () => {
    render(<StockOrderbook stockId="stock-1" symbol="WDG" currentPrice="15000" />);
    expect(screen.getByText(/최근 체결 틱/)).toBeDefined();
    expect(screen.getByText(/체결 내역이 없습니다/)).toBeDefined();
    expect(screen.queryByText(/t-init-/)).toBeNull();
  });

  it('renders the real server fill in the recent execution list', () => {
    feed.trades = [trade];
    render(<StockOrderbook stockId="stock-1" symbol="WDG" currentPrice="15000" />);
    expect(screen.getByText(/15,123/)).toBeDefined();
    expect(screen.getByText(/7주/)).toBeDefined();
  });
});
