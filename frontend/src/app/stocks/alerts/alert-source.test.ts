import { describe, expect, it } from 'vitest';
import { parseStockAlertPageSource } from './alert-source';
const stockId = '4b2c3f54-12c3-48b1-83a4-1ddc941ddc8d';
const alertId = '37c24a90-1294-41df-9223-7e8171e2b333';
const eventId = '77c24a90-1294-41df-9223-7e8171e2b333';
const market = { stocks: [{ id: stockId, symbol: 'WDG', name: 'Virtual Stock', current_price: '100' }] };
const alert = { alert_id: alertId, stock_id: stockId, symbol: 'WDG', name: 'Virtual Stock',
  condition_kind: 'price_at_or_above', threshold_amount: '100', threshold_bps: null,
  cooldown_seconds: 3600, current_price: '100', current_day_change_bps: 100,
  condition_met: true, last_triggered_at: '2026-11-02T01:00:00.000Z' };
const event = { event_id: eventId, symbol: 'WDG', name: 'Virtual Stock',
  condition_kind: 'price_at_or_above', threshold_amount: '100', threshold_bps: null,
  trigger_price: '100', trigger_day_change_bps: 100, triggered_at: '2026-11-02T01:00:00.000Z' };
const rules = { alerts: [alert] }; const events = { events: [event] };

describe('member conditional alert source integrity', () => {
  it('accepts validated owner market, rule and event responses', () => {
    const parsed = parseStockAlertPageSource(market, rules, events);
    expect(parsed?.stocks[0]?.symbol).toBe('WDG');
    expect(parsed?.alerts[0]?.threshold_amount).toBe('100');
    expect(parsed?.events[0]?.event_id).toBe(eventId);
  });
  it('distinguishes verified empty from missing and malformed responses', () => {
    expect(parseStockAlertPageSource({ stocks: [] }, { alerts: [] }, { events: [] }))
      .toEqual({ stocks: [], alerts: [], events: [] });
    expect(parseStockAlertPageSource(null, { alerts: [] }, { events: [] })).toBeNull();
    expect(parseStockAlertPageSource(market, { alerts: null }, events)).toBeNull();
  });
  it.each([
    [{ stocks: 'bad' }, rules, events],
    [{ stocks: [market.stocks[0], market.stocks[0]] }, rules, events],
    [market, { alerts: [alert, alert] }, events],
    [market, { alerts: [{ ...alert, current_price: 'not-a-number' }] }, events],
    [market, { alerts: [{ ...alert, current_price: '900719925474099300000000000' }] }, events],
    [market, { alerts: [{ ...alert, threshold_amount: null }] }, events],
    [market, { alerts: [{ ...alert, condition_kind: 'unknown' }] }, events],
    [market, { alerts: [{ ...alert, condition_met: 'true' }] }, events],
    [market, { alerts: [{ ...alert, cooldown_seconds: -1 }] }, events],
    [market, rules, { events: [{ ...event, triggered_at: 'yesterday' }] }],
    [market, rules, { events: [{ ...event, trigger_day_change_bps: NaN }] }],
    [market, rules, { events: [event, event] }],
  ] as const)('fails closed for unverified or inconsistent source data', (a, b, c) => {
    expect(parseStockAlertPageSource(a, b, c)).toBeNull();
  });
  it('accepts signed basis point rules and exact WLD threshold text', () => {
    const change = { ...alert, condition_kind: 'day_change_at_or_below', threshold_amount: null, threshold_bps: -175 };
    const parsed = parseStockAlertPageSource(market, { alerts: [change] }, { events: [] });
    expect(parsed?.alerts[0]?.threshold_bps).toBe(-175);
  });
});
