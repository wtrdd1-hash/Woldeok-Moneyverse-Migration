import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useStockTrades } from '@/lib/use-market-prices';
import type { LiveTradeData } from '@/lib/use-market-prices';
import { StockMarketToast } from './stock-market-toast';

vi.mock('@/lib/use-market-prices', () => ({ useStockTrades: vi.fn() }));
vi.mock('@/lib/audio-effects', () => ({ playStockTickSound: vi.fn() }));

const useTrades = vi.mocked(useStockTrades);
const stockId = 'stock-1';

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-11-02T00:00:00.000Z'));
  useTrades.mockReturnValue([]);
});
afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

describe('verified stock trade notification', () => {
  it('never fabricates a trade from a displayed price or elapsed time', () => {
    render(<StockMarketToast stockId={stockId} symbol="WDG" currentPrice="15000" />);
    act(() => vi.advanceTimersByTime(42_000));
    expect(screen.queryByRole('status')).toBeNull();
    expect(useTrades).toHaveBeenCalledWith(stockId);
  });

  it('shows a real trade for five seconds and supports dismissing it', () => {
    const trade: LiveTradeData = {
      id: 'receipt-1', stockId, price: '15000', quantity: 7,
      side: 'BUY', timestamp: '2026-11-02T00:00:00.000Z',
    };
    const { rerender } = render(<StockMarketToast stockId={stockId} symbol="WDG" currentPrice="15000" />);
    useTrades.mockReturnValue([trade]);
    rerender(<StockMarketToast stockId={stockId} symbol="WDG" currentPrice="15000" />);
    expect(screen.getByRole('status').textContent).toContain('15,000');
    expect(screen.getByRole('status').textContent).toContain('7주');
    act(() => vi.advanceTimersByTime(5000));
    expect(screen.queryByRole('status')).toBeNull();
  });
});
