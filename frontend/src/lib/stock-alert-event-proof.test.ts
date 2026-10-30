import { describe, expect, it } from 'vitest';
import { parseStockAlertEvents } from './stock-alert-event-proof';

const price = {
  event_id: '00000000-0000-4000-8000-000000000001',
  symbol: 'WLD', name: 'Woldeok', condition_kind: 'price_at_or_above',
  threshold_amount: '9007199254740993123', threshold_bps: null,
  trigger_price: '9007199254740993124', trigger_day_change_bps: 150,
  triggered_at: '2026-10-31T00:00:00.000Z',
};
const change = {
  ...price, event_id: '00000000-0000-4000-8000-000000000002',
  condition_kind: 'day_change_at_or_below', threshold_amount: null, threshold_bps: -150,
};

describe('verified bounded owner stock-alert trigger categories', () => {
  it('preserves WLD integer strings and checks requested categories', () => {
    expect(parseStockAlertEvents({ events: [price] }, 'price', 30)?.events[0]?.trigger_price).toBe('9007199254740993124');
    expect(parseStockAlertEvents({ events: [change] }, 'change', 30)).not.toBeNull();
    expect(parseStockAlertEvents({ events: [price, change] }, 'all', 30)).not.toBeNull();
    expect(parseStockAlertEvents({ events: [change] }, 'price', 30)).toBeNull();
    expect(parseStockAlertEvents({ events: [price] }, 'change', 30)).toBeNull();
  });
  it('rejects malformed success payloads, unsafe money, invalid timestamps and excessive rows', () => {
    expect(parseStockAlertEvents({ events: [] }, 'price', 30)).not.toBeNull();
    expect(parseStockAlertEvents({ events: Array(31).fill(price) }, 'price', 30)).toBeNull();
    expect(parseStockAlertEvents({ events: [{ ...price, trigger_price: 1 }] }, 'price', 30)).toBeNull();
    expect(parseStockAlertEvents({ events: [{ ...price, trigger_price: '9223372036854775808' }] }, 'price', 30)).toBeNull();
    expect(parseStockAlertEvents({ events: [{ ...price, triggered_at: 'yesterday' }] }, 'price', 30)).toBeNull();
    expect(parseStockAlertEvents({ events: [{ ...price, condition_kind: 'invented' }] }, 'all', 30)).toBeNull();
    expect(parseStockAlertEvents({ events: [{ ...price, event_id: 'not-uuid' }] }, 'all', 30)).toBeNull();
    expect(parseStockAlertEvents({ events: null }, 'all', 30)).toBeNull();
  });
});
