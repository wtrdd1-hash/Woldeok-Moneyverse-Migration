import { describe, expect, it } from 'vitest';
import { parseMarketStocks, parseMarketDynamics, parseMarketEvents } from './market-evidence';

const ID = '11111111-1111-4111-8111-111111111111';
const OTHER = '22222222-2222-4222-8222-222222222222';
const TIME = '2026-10-27T07:00:00.000Z';
const stock = { id: ID, symbol: 'WLD', name: 'Verified Stock', current_price: '9007199254740993', shares_outstanding: '100', shares_available: '40', holders: 3, trades: 2, active: true, halt_status: 'ACTIVE', halted_at: null };
const dynamic = { stock_id: ID, symbol: 'WLD', name: 'Verified Stock', current_price: '9007199254740993', fair_value: '9007199254740994', trend_bps: '-12.5', vol_bps: '25.5', market_trend_bps: '0.5', live_events: 1 };
const event = { id: OTHER, stock_id: ID, symbol: 'WLD', name: 'Verified Stock', direction: 'up', strength: 2, headline: 'Verified event', body: '', source: 'operator', starts_at: TIME, ends_at: '2026-10-28T07:00:00.000Z', cancelled_at: null, live: true };

describe('admin market console read evidence', () => {
  it('separates unavailable API data from genuinely empty lists', () => {
    expect(parseMarketStocks({ stocks: [] })).toEqual([]);
    expect(parseMarketDynamics({ stocks: [] })).toEqual([]);
    expect(parseMarketEvents({ events: [] })).toEqual([]);
    for (const value of [null, {}, { stocks: null }, { stocks: [null] }]) {
      expect(parseMarketStocks(value)).toBeNull();
      expect(parseMarketDynamics(value)).toBeNull();
    }
    expect(parseMarketEvents({ events: [null] })).toBeNull();
  });
  it('preserves exact WLD and share integer strings', () => {
    expect(parseMarketStocks({ stocks: [stock] })?.[0]?.current_price).toBe('9007199254740993');
    expect(parseMarketDynamics({ stocks: [dynamic] })?.[0]?.fair_value).toBe('9007199254740994');
  });
  it('rejects invalid stock identity, amount, boolean, float and status', () => {
    for (const patch of [{ id: 'not-uuid' }, { current_price: 'NaN' }, { current_price: 9 }, { shares_outstanding: '-1' }, { shares_available: '101' }, { holders: -1 }, { trades: 0.5 }, { active: 'yes' }, { halt_status: 'UNKNOWN' }]) {
      expect(parseMarketStocks({ stocks: [{ ...stock, ...patch }] })).toBeNull();
    }
  });
  it('rejects duplicate stock IDs and symbols', () => {
    expect(parseMarketStocks({ stocks: [stock, { ...stock, symbol: 'OTHER' }] })).toBeNull();
    expect(parseMarketStocks({ stocks: [stock, { ...stock, id: OTHER, symbol: 'wld' }] })).toBeNull();
  });
  it('rejects untrusted market dynamics and duplicates', () => {
    for (const patch of [{ stock_id: 'bad' }, { fair_value: '0' }, { trend_bps: 'Infinity' }, { vol_bps: '-1' }, { market_trend_bps: 0 }, { live_events: -1 }]) {
      expect(parseMarketDynamics({ stocks: [{ ...dynamic, ...patch }] })).toBeNull();
    }
    expect(parseMarketDynamics({ stocks: [dynamic, dynamic] })).toBeNull();
    expect(parseMarketDynamics({ stocks: [
      dynamic, { ...dynamic, stock_id: OTHER, symbol: 'OTHER', market_trend_bps: '1.0' },
    ] })).toBeNull();
    expect(parseMarketDynamics({ stocks: [{ ...dynamic, vol_bps: '999999999999999999' }] })).toBeNull();
    expect(parseMarketDynamics({ stocks: [
      dynamic, { ...dynamic, stock_id: OTHER, symbol: 'OTHER', market_trend_bps: '0.50' },
    ] })).toHaveLength(2);
  });
  it('accepts genuine market events with verified timestamps and scopes', () => {
    expect(parseMarketEvents({ events: [event] })?.[0]?.headline).toBe('Verified event');
    expect(parseMarketEvents({ events: [{ ...event, stock_id: null, symbol: null, name: null }] })?.[0]?.stock_id).toBeNull();
  });
  it('rejects contradictory, forged and duplicated event records', () => {
    for (const patch of [{ id: 'bad' }, { strength: 4 }, { direction: 'sideways' }, { starts_at: 'bad' }, { ends_at: TIME }, { live: 'yes' }, { stock_id: null, symbol: 'WLD' }, { cancelled_at: TIME, live: true }]) {
      expect(parseMarketEvents({ events: [{ ...event, ...patch }] })).toBeNull();
    }
    expect(parseMarketEvents({ events: [event, event] })).toBeNull();
  });
});
