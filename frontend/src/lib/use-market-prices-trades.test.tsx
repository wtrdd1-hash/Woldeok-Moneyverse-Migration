import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useStockTrades } from './use-market-prices';

const socket = vi.hoisted(() => ({
  handlers: new Map<string, (data: unknown) => void>(),
  stop: vi.fn(),
  subscribe: vi.fn(),
}));

vi.mock('@/lib/site-socket', () => ({
  acquireSiteSocket: vi.fn(),
  releaseSiteSocket: vi.fn(),
  subscribeSocketRoom: (...args: unknown[]) => {
    socket.subscribe(...args);
    const [room, , , , , onData] = args as [string, unknown, unknown, unknown, unknown, (data: unknown) => void];
    socket.handlers.set(room, onData);
    return () => {
      socket.handlers.delete(room);
      socket.stop(room);
    };
  },
}));

describe('stock trade room subscription', () => {
  it('shows only confirmed events from the requested stock, deduplicates replays, and cleans up', () => {
    const stockId = 'trade-hook-stock-995';
    const { result, unmount } = renderHook(() => useStockTrades(stockId));
    expect(result.current).toHaveLength(0);
    expect(socket.subscribe).toHaveBeenCalledWith(
      `stock:${stockId}`, 'stock:subscribe', 'stock:unsubscribe', 'stock:trade', stockId, expect.any(Function),
    );
    const send = socket.handlers.get(`stock:${stockId}`)!;
    const trade = {
      id: 'trade-995',
      stockId,
      price: '1234',
      quantity: 4,
      side: 'SELL',
      timestamp: '2026-10-23T20:00:00.000Z',
    };
    act(() => {
      send({ ...trade, stockId: 'different-stock' });
      send({ ...trade, quantity: 0 });
    });
    expect(result.current).toHaveLength(0);
    act(() => {
      send(trade);
      send(trade);
    });
    expect(result.current).toHaveLength(1);
    expect(result.current[0]).toMatchObject({ id: 'trade-995', side: 'SELL', quantity: 4 });
    unmount();
    expect(socket.stop).toHaveBeenCalledWith(`stock:${stockId}`);
  });

  it('shares one room subscription between multiple consumers', () => {
    const stockId = 'trade-hook-shared-995';
    const first = renderHook(() => useStockTrades(stockId));
    const second = renderHook(() => useStockTrades(stockId));
    expect(socket.subscribe.mock.calls.filter(([room]) => room === `stock:${stockId}`)).toHaveLength(1);
    first.unmount();
    expect(socket.handlers.has(`stock:${stockId}`)).toBe(true);
    second.unmount();
    expect(socket.handlers.has(`stock:${stockId}`)).toBe(false);
  });
});
