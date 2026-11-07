import { describe, expect, it } from 'vitest';
import { parseNewspaperEvents, parseNewspaperStocks } from './newspaper-source';

const event = {
  id: '11111111-1111-4111-8111-111111111111',
  stock_id: null,
  symbol: null,
  name: null,
  direction: 'up',
  strength: 2,
  headline: 'Verified market event',
  body: 'Server-backed scenario',
  source: 'Market events service',
  starts_at: '2026-11-01T00:00:00Z',
  ends_at: '2026-11-02T00:00:00Z',
};
const stock = {
  id: '22222222-2222-4222-8222-222222222222',
  symbol: 'WDT',
  name: 'Woldeok Tech',
  current_price: '102',
  day_open_price: '100',
};

describe('newspaper market source boundary', () => {
  it('distinguishes verified empty results from an unavailable or malformed response', () => {
    expect(parseNewspaperEvents({ events: [] })).toEqual([]);
    expect(parseNewspaperStocks({ stocks: [] })).toEqual([]);
    expect(parseNewspaperEvents(null)).toBeNull();
    expect(parseNewspaperStocks(null)).toBeNull();
    expect(parseNewspaperEvents({})).toBeNull();
    expect(parseNewspaperStocks({ stocks: {} })).toBeNull();
  });

  it('accepts actual backend-shaped market events and stock quotes', () => {
    expect(parseNewspaperEvents({ events: [event] })).toEqual([event]);
    expect(parseNewspaperStocks({ stocks: [stock] })).toEqual([stock]);
  });

  it('rejects malformed prices before BigInt, including partial and duplicate stock lists', () => {
    for (const value of [undefined, null, 'NaN', '1.5', '-1', '0', '900000000000000000000000000']) {
      expect(parseNewspaperStocks({ stocks: [{ ...stock, current_price: value }] })).toBeNull();
    }
    expect(parseNewspaperStocks({ stocks: [stock, stock] })).toBeNull();
    expect(parseNewspaperStocks({ stocks: [stock, { ...stock, id: '33333333-3333-4333-8333-333333333333' }] })).toBeNull();
  });

  it('rejects fabricated or inconsistent market event evidence atomically', () => {
    expect(parseNewspaperEvents({ events: [event, { ...event, id: 'bad' }] })).toBeNull();
    expect(parseNewspaperEvents({ events: [{ ...event, direction: 'sideways' }] })).toBeNull();
    expect(parseNewspaperEvents({ events: [{ ...event, strength: 7 }] })).toBeNull();
    expect(parseNewspaperEvents({ events: [{ ...event, ends_at: '2026-10-31T00:00:00Z' }] })).toBeNull();
    expect(parseNewspaperEvents({ events: [event, event] })).toBeNull();
  });
});
