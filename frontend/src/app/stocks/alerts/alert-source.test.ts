import { describe, expect, it } from 'vitest';
import { parseStockAlertPage } from './alert-source';

const STOCK_ID = 'e9a7e18b-6b14-4d69-927b-c72dc0e3813d';
const ALERT_ID = 'cab98b4c-33f2-4f3d-bbb1-11118d2d57f4';
const EVENT_ID = '7f8c908a-3cb9-455f-9497-3c89b08f555a';

const stock = { id: STOCK_ID, symbol: 'WLDX', name: 'Woldeok X' };
const rule = {
  alert_id: ALERT_ID, stock_id: STOCK_ID, symbol: 'WLDX', name: 'Woldeok X',
  condition_kind: 'price_at_or_above', threshold_amount: '1234567890123456789', threshold_bps: null,
  cooldown_seconds: 3600, current_price: '999', current_day_change_bps: -123,
  condition_met: false, last_triggered_at: null,
};
const event = {
  event_id: EVENT_ID, symbol: 'WLDX', name: 'Woldeok X',
  condition_kind: 'day_change_at_or_below', threshold_amount: null, threshold_bps: -500,
  trigger_price: '1000', trigger_day_change_bps: -600, triggered_at: '2026-10-31T14:30:00.000Z',
};
const valid = () => [{ stocks: [stock] }, { alerts: [rule] }, { events: [event] }] as const;

describe('parseStockAlertPage: verified owner alert evidence', () => {
  it('accepts verified empty lists without fabricating alerts', () => {
    expect(parseStockAlertPage({ stocks: [] }, { alerts: [] }, { events: [] }))
      .toEqual({ stocks: [], alerts: [], events: [] });
  });
  it('accepts exact WLD integers, negative bps and server ISO timestamps', () => {
    const [market, rules, history] = valid();
    expect(parseStockAlertPage(market, rules, history))
      .toEqual({ stocks: [stock], alerts: [rule], events: [event] });
  });
  it('rejects missing or wrong-shaped successful responses', () => {
    const [market, rules, history] = valid();
    expect(parseStockAlertPage({ stocks: null }, rules, history)).toBeNull();
    expect(parseStockAlertPage(market, { alerts: {} }, history)).toBeNull();
    expect(parseStockAlertPage(market, rules, { events: 'none' })).toBeNull();
    expect(parseStockAlertPage(null, rules, history)).toBeNull();
  });
  it('rejects duplicate stock symbols, alert ids and event ids', () => {
    const [market, rules, history] = valid();
    expect(parseStockAlertPage({ stocks: [stock, { ...stock, id: ALERT_ID }] }, rules, history)).toBeNull();
    expect(parseStockAlertPage(market, { alerts: [rule, rule] }, history)).toBeNull();
    expect(parseStockAlertPage(market, rules, { events: [event, event] })).toBeNull();
  });
  it('rejects invalid UUIDs and malicious or empty display names', () => {
    const [market, rules, history] = valid();
    expect(parseStockAlertPage({ stocks: [{ ...stock, id: 'bad' }] }, rules, history)).toBeNull();
    expect(parseStockAlertPage(market, { alerts: [{ ...rule, name: '' }] }, history)).toBeNull();
    expect(parseStockAlertPage(market, rules, { events: [{ ...event, symbol: '\n' }] })).toBeNull();
  });
  it('rejects fractional, exponential, negative and unsafe WLD values', () => {
    const [market, rules, history] = valid();
    for (const amount of ['1.5', '1e6', '-1', '9223372036854775808', 1000, '01']) {
      expect(parseStockAlertPage(market, { alerts: [{ ...rule, threshold_amount: amount }] }, history)).toBeNull();
    }
    expect(parseStockAlertPage(market, rules, { events: [{ ...event, trigger_price: 'NaN' }] })).toBeNull();
  });
  it('requires condition-compatible threshold fields and genuine booleans', () => {
    const [market, rules, history] = valid();
    expect(parseStockAlertPage(market, { alerts: [{ ...rule, threshold_bps: 0 }] }, history)).toBeNull();
    expect(parseStockAlertPage(market, { alerts: [{ ...rule, condition_kind: 'day_change_at_or_below' }] }, history)).toBeNull();
    expect(parseStockAlertPage(market, { alerts: [{ ...rule, condition_met: 'false' }] }, history)).toBeNull();
    expect(parseStockAlertPage(market, rules, { events: [{ ...event, threshold_bps: 100001 }] })).toBeNull();
  });
  it('rejects invalid timestamps, cooldowns and unsafe basis points', () => {
    const [market, rules, history] = valid();
    expect(parseStockAlertPage(market, { alerts: [{ ...rule, cooldown_seconds: 0 }] }, history)).toBeNull();
    expect(parseStockAlertPage(market, { alerts: [{ ...rule, current_day_change_bps: Infinity }] }, history)).toBeNull();
    expect(parseStockAlertPage(market, rules, { events: [{ ...event, triggered_at: '2026-02-30T14:30:00Z' }] })).toBeNull();
  });
});
