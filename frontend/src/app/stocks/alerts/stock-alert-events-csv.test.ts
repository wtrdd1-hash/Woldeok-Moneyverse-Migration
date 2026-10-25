import { describe, expect, it } from 'vitest';
import { stockAlertEventsCsv } from './stock-alert-events-csv';

const ID = '11111111-1111-4111-8111-111111111111';
const row = {
  event_id: ID, alert_id: '22222222-2222-4222-8222-222222222222',
  stock_id: '33333333-3333-4333-8333-333333333333', symbol: 'TEST', name: 'Virtual test',
  condition_kind: 'price_at_or_above', threshold_amount: '9007199254740993', threshold_bps: null,
  trigger_price: '9007199254740995', trigger_day_change_bps: -123,
  triggered_at: '2026-10-25T21:00:00.000Z',
};
const snapshot = (events: unknown[]) => ({ scope: 'recent_100_max', events });

describe('stock alert event CSV: all-or-nothing private snapshot', () => {
  it('preserves integer-string WLD precision and marks this a recent event, not a trade receipt', () => {
    const csv = stockAlertEventsCsv(snapshot([row]));
    expect(csv).toContain('9007199254740993');
    expect(csv).toContain('9007199254740995');
    expect(csv).toContain('recent trigger only');
    expect(csv.startsWith('\uFEFF')).toBe(true);
    expect(csv).toContain('\r\n');
  });
  it('escapes spreadsheet formulas and strips control and bidi bytes', () => {
    const csv = stockAlertEventsCsv(snapshot([{ ...row, name: '=HYPERLINK(1,2)\r\n@SUM(1,2)\u202e' }]));
    expect(csv).toContain('"\'=HYPERLINK');
    expect(csv).not.toContain('\u202e');
    expect(csv).not.toContain('\r\n@SUM');
  });
  it('rejects unsupported scope, 101 rows, duplicated ids and noncanonical money', () => {
    expect(() => stockAlertEventsCsv({ scope: 'all_history', events: [row] })).toThrow();
    expect(() => stockAlertEventsCsv(snapshot(Array.from({ length: 101 }, () => row)))).toThrow();
    expect(() => stockAlertEventsCsv(snapshot([row, row]))).toThrow();
    expect(() => stockAlertEventsCsv(snapshot([{ ...row, trigger_price: Number('9007199254740995') }]))).toThrow();
    expect(() => stockAlertEventsCsv(snapshot([{ ...row, trigger_price: '01' }]))).toThrow();
  });
  it('rejects mismatched condition thresholds and invalid timestamps', () => {
    expect(() => stockAlertEventsCsv(snapshot([{ ...row, threshold_bps: 100 }]))).toThrow();
    expect(() => stockAlertEventsCsv(snapshot([{ ...row, triggered_at: '2026-02-30T00:00:00.000Z' }]))).toThrow();
    expect(() => stockAlertEventsCsv(snapshot([{ ...row, condition_kind: 'unknown' }]))).toThrow();
  });
  it('supports valid signed basis-point alert without WLD threshold', () => {
    const csv = stockAlertEventsCsv(snapshot([{ ...row, condition_kind: 'day_change_at_or_below', threshold_amount: null, threshold_bps: -1000 }]));
    expect(csv).toContain('-1000');
  });
});
