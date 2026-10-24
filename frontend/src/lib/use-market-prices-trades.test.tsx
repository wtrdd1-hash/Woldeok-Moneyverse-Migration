import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MarketPricesProvider, useStockTrades } from './use-market-prices';

const fake = vi.hoisted(() => {
  const listeners = new Map<string, Set<(value?: unknown) => void>>();
  const emitted: Array<[string, unknown?]> = [];
  return {
    connected: true,
    listeners,
    emitted,
    on(event: string, listener: (value?: unknown) => void) {
      if (!listeners.has(event)) listeners.set(event, new Set());
      listeners.get(event)!.add(listener);
    },
    off(event: string, listener: (value?: unknown) => void) { listeners.get(event)?.delete(listener); },
    emit(event: string, payload?: unknown) { emitted.push([event, payload]); },
    dispatch(event: string, payload?: unknown) {
      for (const listener of listeners.get(event) ?? []) listener(payload);
    },
  };
});

vi.mock('@/lib/site-socket', () => ({
  acquireSiteSocket: () => fake,
  releaseSiteSocket: () => undefined,
}));
vi.mock('@/components/live-refresh', () => ({ LiveRefresh: () => null }));

function Feed({ stockId }: { stockId: string }) {
  const trades = useStockTrades(stockId);
  return <output data-testid={stockId}>{trades.map((t) => `${t.id}:${t.price}:${t.quantity}`).join(',') || 'empty'}</output>;
}

const trade = {
  id: 'confirmed-1', stockId: 'stock-a', price: '15000',
  quantity: 5, side: 'BUY', timestamp: '2026-10-24T12:30:00.000Z',
};

describe('real stock execution socket contract', () => {
  beforeEach(() => { fake.emitted.length = 0; fake.listeners.clear(); });
  afterEach(() => { fake.listeners.clear(); });

  it('keeps the empty snapshot stable and never fabricates trades', () => {
    render(<MarketPricesProvider><Feed stockId="stock-a" /></MarketPricesProvider>);
    expect(screen.getByTestId('stock-a').textContent).toBe('empty');
    expect(fake.emitted).toContainEqual(['stock:subscribe', 'stock-a']);
  });

  it('ignores invalid executions, filters by stock, and deduplicates server receipt IDs', () => {
    render(<MarketPricesProvider><Feed stockId="stock-a" /><Feed stockId="stock-b" /></MarketPricesProvider>);
    act(() => {
      fake.dispatch('stock:trade', { ...trade, quantity: 0 });
      fake.dispatch('stock:trade', { ...trade, price: 'fake' });
      fake.dispatch('stock:trade', { ...trade, side: 'NEITHER' });
      fake.dispatch('stock:trade', { ...trade, timestamp: 'bad-time' });
    });
    expect(screen.getByTestId('stock-a').textContent).toBe('empty');
    act(() => { fake.dispatch('stock:trade', trade); fake.dispatch('stock:trade', trade); });
    expect(screen.getByTestId('stock-a').textContent).toBe('confirmed-1:15000:5');
    expect(screen.getByTestId('stock-b').textContent).toBe('empty');
  });

  it('resubscribes after socket reconnection and keeps a room while another consumer remains', () => {
    const view = render(<MarketPricesProvider><Feed stockId="stock-c" /><Feed stockId="stock-c" /></MarketPricesProvider>);
    fake.emitted.length = 0;
    act(() => fake.dispatch('connect'));
    expect(fake.emitted.some(([event, id]) => event === 'stock:subscribe' && id === 'stock-c')).toBe(true);
    view.unmount();
    expect(fake.emitted).toContainEqual(['stock:unsubscribe', 'stock-c']);
  });
});
