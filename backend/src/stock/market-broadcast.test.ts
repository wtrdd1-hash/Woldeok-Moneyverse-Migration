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
      prices: [
        { id: 's-1', price: '141711', open: '143000' },
        { id: 's-2', price: '900', open: '880' },
      ],
    });
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
});
