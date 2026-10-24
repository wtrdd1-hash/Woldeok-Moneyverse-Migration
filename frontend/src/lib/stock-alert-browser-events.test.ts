import { describe, expect, it } from 'vitest';
import { parseVerifiedStockAlertSnapshot, parseVerifiedBrowserStockAlertSnapshot, selectNewVerifiedStockAlertEvents } from './stock-alert-browser-events';

const event = {
  event_id: 'e1159a2d-5d54-4dc9-96a7-b96d963b5079',
  symbol: 'WLDX',
  name: 'Woldeok X',
  condition_kind: 'price_at_or_above',
  trigger_price: '1250',
  triggered_at: '2026-10-25T00:10:00.000Z',
};

describe('verified browser stock alerts', () => {
  it('accepts only bounded server rule and event snapshots', () => {
    const snapshot = parseVerifiedStockAlertSnapshot({ alerts: [{ alert_id: 'a' }], events: [event] });
    expect(snapshot).toEqual({ activeAlertCount: 1, events: [{
      eventId: event.event_id, symbol: 'WLDX', name: 'Woldeok X',
      conditionKind: 'price_at_or_above', triggerPrice: '1250', triggeredAt: event.triggered_at,
    }] });
  });

  it('fails closed for invalid event identity, timestamps and forged counts', () => {
    expect(parseVerifiedStockAlertSnapshot({ alerts: [], events: [{ ...event, event_id: 'fake' }] })).toBeNull();
    expect(parseVerifiedStockAlertSnapshot({ alerts: [], events: [{ ...event, triggered_at: 'not a date' }] })).toBeNull();
    expect(parseVerifiedStockAlertSnapshot({ alerts: 'unknown', events: [] })).toBeNull();
    expect(parseVerifiedStockAlertSnapshot({ alerts: [], events: Array(11).fill(event) })).toBeNull();
    expect(parseVerifiedStockAlertSnapshot({ alerts: [], events: [{ ...event, symbol: '<img>' }] })).toBeNull();
  });

  it('does not replay existing or historical alerts when permission is granted', () => {
    const snapshot = parseVerifiedStockAlertSnapshot({ alerts: [], events: [event] })!;
    expect(selectNewVerifiedStockAlertEvents(snapshot.events, null, Date.parse('2026-10-25T00:12:00Z'))).toEqual([]);
    expect(selectNewVerifiedStockAlertEvents(snapshot.events, Date.parse('2026-10-25T00:11:00Z'), Date.parse('2026-10-25T00:12:00Z'))).toEqual([]);
    expect(selectNewVerifiedStockAlertEvents(snapshot.events, Date.parse('2026-10-25T00:09:00Z'), Date.parse('2026-10-25T00:12:00Z'))).toHaveLength(1);
  });

  it('accepts only validated minimal gateway receipts on the browser', () => {
    const minimal = { activeAlertCount: 1, events: [{ eventId: event.event_id, symbol: event.symbol, name: event.name, conditionKind: event.condition_kind, triggerPrice: event.trigger_price, triggeredAt: event.triggered_at }] };
    expect(parseVerifiedBrowserStockAlertSnapshot(minimal)).toEqual(minimal);
    expect(parseVerifiedBrowserStockAlertSnapshot({ ...minimal, events: [{ ...minimal.events[0], eventId: 'fake' }] })).toBeNull();
    expect(parseVerifiedBrowserStockAlertSnapshot({ ...minimal, activeAlertCount: -1 })).toBeNull();
  });

  it('rejects future events and limits notifications per poll', () => {
    const events = Array.from({ length: 5 }, (_, i) => ({
      symbol: event.symbol, name: event.name, conditionKind: event.condition_kind, triggerPrice: event.trigger_price,
      eventId: `e1159a2d-5d54-4dc9-96a7-b96d963b507${i}`,
      triggeredAt: '2026-10-25T00:10:00.000Z',
    }));
    expect(selectNewVerifiedStockAlertEvents(events, Date.parse('2026-10-25T00:09:00Z'), Date.parse('2026-10-25T00:12:00Z'))).toHaveLength(3);
    expect(selectNewVerifiedStockAlertEvents([{ ...events[0]!, triggeredAt: '2026-10-25T01:00:00Z' }], Date.parse('2026-10-25T00:09:00Z'), Date.parse('2026-10-25T00:12:00Z'))).toEqual([]);
  });
});
