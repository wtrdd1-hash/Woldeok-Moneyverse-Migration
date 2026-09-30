import { describe, expect, it, vi } from 'vitest';
import { MARKET_PRICES_EVENT, MarketBroadcast } from './market-broadcast';

const price = (id: string, current: string, open: string) => ({
  id,
  current_price: current,
  day_open_price: open,
});

describe('MarketBroadcast', () => {
  it('publishes nothing before a socket server is attached', () => {
    const broadcast = new MarketBroadcast();

    expect(broadcast.shouldPublish).toBe(false);
    // The ticker reads shouldPublish before querying, so this is what keeps a
    // deployment with no socket server from paying for the read.
    expect(() => broadcast.publish([price('a', '10', '10')])).not.toThrow();
  });

  it('stays quiet while nobody is connected', () => {
    const broadcast = new MarketBroadcast();
    const emit = vi.fn();
    broadcast.attach(emit, () => false);

    expect(broadcast.shouldPublish).toBe(false);
  });

  it('sends the two numbers that change, under the ids the page already has', () => {
    const broadcast = new MarketBroadcast();
    const emit = vi.fn();
    broadcast.attach(emit, () => true);

    expect(broadcast.shouldPublish).toBe(true);
    broadcast.publish([price('s-1', '141711', '143000'), price('s-2', '900', '880')]);

    expect(emit).toHaveBeenCalledTimes(1);
    expect(emit).toHaveBeenCalledWith(MARKET_PRICES_EVENT, {
      sequence: 1,
      prices: [
        { id: 's-1', price: '141711', open: '143000' },
        { id: 's-2', price: '900', open: '880' },
      ],
    });
  });

  it('increments sequence monotonically on each broadcast', () => {
    const broadcast = new MarketBroadcast();
    const emit = vi.fn();
    broadcast.attach(emit, () => true);

    broadcast.publish([price('s-1', '100', '100')]);
    broadcast.publish([price('s-1', '105', '100')]);
    broadcast.publish([price('s-1', '110', '100')]);

    expect(broadcast.sequence).toBe(3);
    const firstCall = emit.mock.calls[0]?.[1] as { sequence: number };
    const secondCall = emit.mock.calls[1]?.[1] as { sequence: number };
    const thirdCall = emit.mock.calls[2]?.[1] as { sequence: number };

    expect(firstCall.sequence).toBe(1);
    expect(secondCall.sequence).toBe(2);
    expect(thirdCall.sequence).toBe(3);
  });

  it('keeps prices as strings', () => {
    const broadcast = new MarketBroadcast();
    const emit = vi.fn();
    broadcast.attach(emit, () => true);

    // A price is a bigint in the database. Rounding it into a double on the
    // way out of the process would be a silent loss no test downstream could
    // recover from.
    broadcast.publish([price('s-1', '9007199254740993', '9007199254740993')]);

    const [, payload] = emit.mock.calls[0] as [string, { prices: { price: unknown }[] }];
    expect(payload.prices[0]?.price).toBe('9007199254740993');
  });

  it('does not send an empty market', () => {
    const broadcast = new MarketBroadcast();
    const emit = vi.fn();
    broadcast.attach(emit, () => true);

    broadcast.publish([]);

    expect(emit).not.toHaveBeenCalled();
  });

  it('publishes trades immediately to stock specific room', () => {
    const broadcast = new MarketBroadcast();
    const roomEmit = vi.fn();
    broadcast.attach(vi.fn(), () => true, roomEmit, () => true);

    broadcast.publishTrade({
      id: 'trade-1',
      stockId: 'stk-100',
      price: '150000',
      quantity: 10,
      side: 'BUY',
      timestamp: '2026-09-30T14:00:00.000Z',
    });

    expect(roomEmit).toHaveBeenCalledTimes(1);
    expect(roomEmit).toHaveBeenCalledWith('stock:stk-100', 'stock:trade', {
      sequence: 1,
      id: 'trade-1',
      stockId: 'stk-100',
      price: '150000',
      quantity: 10,
      side: 'BUY',
      timestamp: '2026-09-30T14:00:00.000Z',
    });
  });

  it('publishes user wallet balance and push notifications to user room', () => {
    const broadcast = new MarketBroadcast();
    const roomEmit = vi.fn();
    broadcast.attach(vi.fn(), () => true, roomEmit, () => true);

    broadcast.publishUserWallet({
      userId: 'usr-42',
      wldBalance: 50000,
      availableWld: 40000,
      lockedInStocksWld: 10000,
      totalNetWorthWld: 60000,
      lastUpdated: '2026-09-30T14:00:00.000Z',
    });

    broadcast.publishUserNotification('usr-42', {
      id: 'notif-1',
      title: '송금 완료',
      message: '10,000 WLD가 입금되었습니다.',
      type: 'success',
    });

    expect(roomEmit).toHaveBeenCalledTimes(2);
    expect(roomEmit.mock.calls[0]?.[0]).toBe('user:usr-42');
    expect(roomEmit.mock.calls[0]?.[1]).toBe('wallet:balance');
    expect(roomEmit.mock.calls[1]?.[0]).toBe('user:usr-42');
    expect(roomEmit.mock.calls[1]?.[1]).toBe('notification:push');
  });

  it('coalesces orderbook updates within 150ms batch window', async () => {
    vi.useFakeTimers();
    const broadcast = new MarketBroadcast();
    const roomEmit = vi.fn();
    broadcast.attach(vi.fn(), () => true, roomEmit, (room) => room === 'orderbook:stk-100');

    // 3 rapid orderbook updates in the same window
    broadcast.publishOrderbook({
      stockId: 'stk-100',
      bids: [{ price: '100', quantity: 1, total: '100' }],
      asks: [{ price: '101', quantity: 1, total: '101' }],
      spreadBps: 100,
      buyRatio: 0.5,
      sellRatio: 0.5,
    });
    broadcast.publishOrderbook({
      stockId: 'stk-100',
      bids: [{ price: '100', quantity: 2, total: '200' }],
      asks: [{ price: '101', quantity: 1, total: '101' }],
      spreadBps: 100,
      buyRatio: 0.66,
      sellRatio: 0.34,
    });
    broadcast.publishOrderbook({
      stockId: 'stk-100',
      bids: [{ price: '100', quantity: 5, total: '500' }],
      asks: [{ price: '101', quantity: 2, total: '202' }],
      spreadBps: 100,
      buyRatio: 0.71,
      sellRatio: 0.29,
    });

    // Before timer fires: 0 emits
    expect(roomEmit).not.toHaveBeenCalled();

    // Advance 150ms
    vi.advanceTimersByTime(150);

    // Only the latest state is emitted once
    expect(roomEmit).toHaveBeenCalledTimes(1);
    expect(roomEmit).toHaveBeenCalledWith('orderbook:stk-100', 'stock:orderbook', expect.objectContaining({
      stockId: 'stk-100',
      buyRatio: 0.71,
    }));

    vi.useRealTimers();
  });
});
