import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MarketPricesProvider } from './use-market-prices';
import { StockMarketToast } from '@/app/stocks/[symbol]/stock-market-toast';

const socket = vi.hoisted(() => {
  const listeners = new Map<string, Set<(value: unknown) => void>>();
  return {
    connected: true,
    emit: vi.fn(),
    on(event: string, fn: (value: unknown) => void) {
      if (!listeners.has(event)) listeners.set(event, new Set());
      listeners.get(event)!.add(fn);
    },
    off(event: string, fn: (value: unknown) => void) {
      listeners.get(event)?.delete(fn);
    },
    deliver(event: string, value: unknown) {
      for (const fn of listeners.get(event) ?? []) fn(value);
    },
    reset() { listeners.clear(); this.emit.mockClear(); },
  };
});

vi.mock('@/lib/site-socket', () => ({
  acquireSiteSocket: () => socket,
  releaseSiteSocket: vi.fn(),
}));
vi.mock('@/components/live-refresh', () => ({ LiveRefresh: () => null }));
vi.mock('@/lib/audio-effects', () => ({ playStockTickSound: vi.fn() }));

describe('socket-backed verified execution notification', () => {
  afterEach(() => socket.reset());

  it('subscribes to stock trades and displays only the server event once', () => {
    render(
      <MarketPricesProvider>
        <StockMarketToast stockId="stock-socket-1036" symbol="WDG" currentPrice="15000" />
      </MarketPricesProvider>,
    );
    expect(socket.emit).toHaveBeenCalledWith('stock:subscribe', 'stock-socket-1036');
    expect(screen.queryByText(/서버 확인 체결/)).toBeNull();
    const event = {
      id: 'real-execution-1036', stockId: 'stock-socket-1036',
      price: '16001', quantity: 11, side: 'SELL', timestamp: '2026-10-25T03:47:00.000Z',
    };
    act(() => socket.deliver('stock:trade', event));
    expect(screen.getByText(/16,001/)).toBeDefined();
    expect(screen.getByText(/11주/)).toBeDefined();
    act(() => socket.deliver('stock:trade', event));
    expect(screen.getAllByText(/11주/)).toHaveLength(1);
    act(() => socket.deliver('stock:trade', { ...event, id: 'invalid', price: 'NaN' }));
    expect(screen.getAllByText(/11주/)).toHaveLength(1);
  });
});
