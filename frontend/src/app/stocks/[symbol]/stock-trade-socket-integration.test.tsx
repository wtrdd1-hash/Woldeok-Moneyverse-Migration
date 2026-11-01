import { act, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MarketPricesProvider } from '@/lib/use-market-prices';
import { StockMarketToast } from './stock-market-toast';

const socket = vi.hoisted(() => {
  const listeners = new Map<string, Set<(value: unknown) => void>>();
  const emitted: Array<[string, unknown]> = [];
  return {
    connected: true,
    emitted,
    on(event: string, fn: (value: unknown) => void) {
      if (!listeners.has(event)) listeners.set(event, new Set());
      listeners.get(event)!.add(fn);
      return this;
    },
    off(event: string, fn: (value: unknown) => void) {
      listeners.get(event)?.delete(fn);
      return this;
    },
    emit(event: string, value?: unknown) { emitted.push([event, value]); return this; },
    dispatch(event: string, value?: unknown) {
      for (const fn of listeners.get(event) ?? []) fn(value);
    },
  };
});
vi.mock('@/lib/site-socket', () => ({ acquireSiteSocket: () => socket, releaseSiteSocket: vi.fn() }));
vi.mock('@/components/live-refresh', () => ({ LiveRefresh: () => null }));
vi.mock('@/lib/audio-effects', () => ({ playStockTickSound: vi.fn() }));

describe('end-to-end socket event to verified stock toast', () => {
  it('subscribes and renders only a matching validated backend execution, then resubscribes on reconnect', () => {
    const stockId = 'stock-integrated-1287';
    render(<MarketPricesProvider><StockMarketToast stockId={stockId} symbol="WDG" /></MarketPricesProvider>);
    expect(socket.emitted).toContainEqual(['stock:subscribe', stockId]);
    expect(screen.queryByRole('status')).toBeNull();
    act(() => socket.dispatch('stock:trade', { id: 'foreign', stockId: 'other', price: '120', quantity: 3, side: 'BUY', timestamp: new Date().toISOString() }));
    expect(screen.queryByRole('status')).toBeNull();
    act(() => socket.dispatch('stock:trade', { id: 'malformed', stockId, price: 'not-a-price', quantity: 3, side: 'BUY', timestamp: new Date().toISOString() }));
    expect(screen.queryByRole('status')).toBeNull();
    act(() => socket.dispatch('stock:trade', { id: 'receipt-integrated', stockId, price: '15200', quantity: 9, side: 'SELL', timestamp: new Date().toISOString() }));
    expect(screen.getByRole('status').textContent).toContain('15,200');
    expect(screen.getByRole('status').textContent).toContain('9주');
    const countBefore = socket.emitted.filter(([event, id]) => event === 'stock:subscribe' && id === stockId).length;
    act(() => socket.dispatch('connect'));
    expect(socket.emitted.filter(([event, id]) => event === 'stock:subscribe' && id === stockId).length).toBeGreaterThan(countBefore);
  });
});
