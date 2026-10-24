import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StockOrderbook } from './stock-orderbook';
import { StockMarketToast } from './stock-market-toast';

const feed = vi.hoisted(() => ({ trades: [] as Array<{
  id: string; stockId: string; price: string; quantity: number;
  side: 'BUY' | 'SELL'; timestamp: string;
}> }));

vi.mock('@/lib/use-market-prices', () => ({
  useQuote: (_stockId: string, fallback: unknown) => fallback,
  useStockTrades: () => feed.trades,
}));
vi.mock('@/lib/audio-effects', () => ({ playStockTickSound: vi.fn() }));

const trade = {
  id: 'server-receipt-123', stockId: 'stock-1', price: '15555',
  quantity: 7, side: 'BUY' as const, timestamp: '2026-10-24T12:20:00.000Z',
};

describe('server-authoritative stock execution feed', () => {
  beforeEach(() => { feed.trades = []; });
  afterEach(() => { vi.useRealTimers(); });

  it('does not invent initial executions when the backend has sent none', () => {
    render(<StockOrderbook stockId="stock-1" currentPrice="15,000" />);
    expect(screen.getByText('확인된 체결이 아직 없습니다.')).toBeTruthy();
    expect(screen.queryByText('최근 체결 틱')).toBeNull();
  });

  it('renders only the actual server receipt, quantity, and side', () => {
    feed.trades = [trade];
    render(<StockOrderbook stockId="stock-1" currentPrice="15,000" />);
    expect(screen.getByText('최근 확인된 체결')).toBeTruthy();
    expect(screen.getByText('15,555 WLD')).toBeTruthy();
    expect(screen.getByText('7주')).toBeTruthy();
    expect(screen.getByText('매수')).toBeTruthy();
    expect(screen.queryByText('t-init-0')).toBeNull();
  });

  it('does not manufacture a live trade toast on a timer', () => {
    vi.useFakeTimers();
    render(<StockMarketToast stockId="stock-1" symbol="WDG" />);
    act(() => vi.advanceTimersByTime(20_000));
    expect(screen.queryByText('WDG 확인된 체결')).toBeNull();
  });

  it('shows a toast only when a new verified execution arrives and can dismiss it', () => {
    const view = render(<StockMarketToast stockId="stock-1" symbol="WDG" />);
    feed.trades = [trade];
    view.rerender(<StockMarketToast stockId="stock-1" symbol="WDG" />);
    expect(screen.getByText('WDG 확인된 체결')).toBeTruthy();
    expect(screen.getByText('15,555 WLD')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: '알림 닫기' }));
    expect(screen.queryByText('WDG 확인된 체결')).toBeNull();
  });
});
