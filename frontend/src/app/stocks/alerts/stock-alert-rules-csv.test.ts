import { describe, expect, it } from 'vitest';
import { buildStockAlertRulesCsv } from './stock-alert-rules-csv';

const rule = {
  alert_id: '00000000-0000-4000-8000-000000000001', stock_id: '00000000-0000-4000-8000-000000000002',
  symbol: 'WLD', name: 'Woldeok', condition_kind: 'price_at_or_above',
  threshold_amount: '9007199254740993', threshold_bps: null, cooldown_seconds: 3600,
  current_price: '9007199254740995', day_open_price: '9007199254740991',
  current_day_change_bps: 5, condition_met: true,
  last_evaluated_at: null, last_triggered_at: null, created_at: '2026-10-26T00:00:00.000Z',
};

describe('private active stock alert rules CSV', () => {
  it('preserves 64-bit WLD integer strings and UTF-8 BOM', () => {
    const csv = buildStockAlertRulesCsv([rule]);
    expect(csv.startsWith('\ufeff')).toBe(true);
    expect(csv).toContain('9007199254740993');
    expect(csv).toContain('9007199254740995');
    expect(csv).toContain('price_at_or_above');
    expect(csv.trim().split('\r\n')).toHaveLength(2);
  });

  it('neutralizes spreadsheet formulas and control characters in labels', () => {
    const csv = buildStockAlertRulesCsv([{ ...rule, symbol: '=2+2', name: '  @SUM(A1)\r\nNew, "name"' }]);
    expect(csv).not.toContain('"=2+2"');
    expect(csv).toContain("'=2+2");
    expect(csv).not.toContain('\r\nNew');
    expect(csv).toContain('""name""');
  });

  it('rejects overflow, malformed precision, and unknown conditions instead of producing partial files', () => {
    expect(() => buildStockAlertRulesCsv(Array.from({ length: 101 }, () => rule))).toThrow();
    expect(() => buildStockAlertRulesCsv([{ ...rule, current_price: '9e20' }])).toThrow();
    expect(() => buildStockAlertRulesCsv([{ ...rule, condition_kind: 'arbitrary' }])).toThrow();
  });
});
