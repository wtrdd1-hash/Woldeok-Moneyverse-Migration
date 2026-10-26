import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StockMarketToast } from './stock-market-toast';
import { subscribeSocketRoom } from '@/lib/site-socket';

vi.mock('@/lib/site-socket', () => ({
  subscribeSocketRoom: vi.fn(() => vi.fn()),
}));
vi.mock('@/lib/audio-effects', () => ({ playStockTickSound: vi.fn() }));

const emit = (payload: unknown) => {
  const call = vi.mocked(subscribeSocketRoom).mock.lastCall;
  expect(call).toBeDefined();
  act(() => call?.[5](payload));
};

const trade = {
  id: 'trade-verified-1',
  stockId: 'stock-123',
  price: '9007199254740993',
  quantity: 12,
  side: 'BUY',
  timestamp: '2026-10-26T05:42:00.000Z',
};

describe('verified stock trade toast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-26T05:42:05.000Z'));
    vi.clearAllMocks();
  });
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('subscribes to the actual stock room and never invents a trade on a timer', () => {
    render(<StockMarketToast stockId="stock-123" symbol="WDG" isEn />);
    expect(subscribeSocketRoom).toHaveBeenCalledWith(
      'stock:stock-123', 'stock:subscribe', 'stock:unsubscribe',
      'stock:trade', 'stock-123', expect.any(Function),
    );
    act(() => vi.advanceTimersByTime(60_000));
    expect(screen.queryByText(/Live Trade/)).toBeNull();
  });

  it('shows only a valid backend execution event without converting WLD to Number', () => {
    render(<StockMarketToast stockId="stock-123" symbol="WDG" isEn />);
    emit(trade);
    expect(screen.getByText(/Live Trade/)).toBeDefined();
    expect(screen.getByText('9,007,199,254,740,993 WLD')).toBeDefined();
    expect(screen.getByText('12 shares (Buy)')).toBeDefined();
    expect(screen.getByRole('button', { name: 'Close toast' }).className).toContain('min-h-11');
  });

  it('rejects unrelated stock, invalid side, malformed price, quantity and timestamp', () => {
    render(<StockMarketToast stockId="stock-123" symbol="WDG" />);
    for (const invalid of [
      { ...trade, stockId: 'stock-999' },
      { ...trade, side: 'UNKNOWN' },
      { ...trade, price: '-1' },
      { ...trade, price: '1e12' },
      { ...trade, quantity: -3 },
      { ...trade, quantity: 1.5 },
      { ...trade, timestamp: 'not-a-date' },
      { ...trade, id: '' },
    ]) {
      emit(invalid);
      expect(screen.queryByText(/체결 틱/)).toBeNull();
    }
  });

  it('deduplicates replayed trade IDs and allows a later verified trade', () => {
    render(<StockMarketToast stockId="stock-123" symbol="WDG" />);
    emit(trade);
    fireEvent.click(screen.getByRole('button', { name: '알림 닫기' }));
    emit(trade);
    expect(screen.queryByText(/체결 틱/)).toBeNull();
    emit({ ...trade, id: 'trade-verified-2', price: '1510', side: 'SELL' });
    expect(screen.getByText('1,510 WLD')).toBeDefined();
    expect(screen.getByText('12주 (매도)')).toBeDefined();
  });

  it('hides a verified trade after five seconds and unsubscribes on unmount', () => {
    const unsubscribe = vi.fn();
    vi.mocked(subscribeSocketRoom).mockReturnValueOnce(unsubscribe);
    const { unmount } = render(<StockMarketToast stockId="stock-123" symbol="WDG" />);
    emit(trade);
    act(() => vi.advanceTimersByTime(5000));
    expect(screen.queryByText(/체결 틱/)).toBeNull();
    unmount();
    expect(unsubscribe).toHaveBeenCalledOnce();
  });

  it('does not carry a prior stock trade into another stock page', () => {
    const { rerender } = render(<StockMarketToast stockId="stock-123" symbol="WDG" />);
    emit(trade);
    rerender(<StockMarketToast stockId="stock-999" symbol="WLD" />);
    expect(screen.queryByText(/체결 틱/)).toBeNull();
    emit({ ...trade, stockId: 'stock-999', id: 'trade-verified-3' });
    expect(screen.getByText(/WLD 체결 틱/)).toBeDefined();
  });
});
