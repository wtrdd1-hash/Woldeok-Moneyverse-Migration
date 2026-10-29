import { describe, expect, it } from 'vitest';
import type { ShopHoldingRow } from './shop.repository';
import { filterShopHoldings, parseShopHoldingsStatus } from './shop-holdings-filter';

function row(overrides: Partial<ShopHoldingRow> = {}): ShopHoldingRow {
  return {
    catalog_id: '00000000-0000-4000-8000-000000000001',
    code: 'sample',
    name: 'sample',
    description: '',
    category: 'vehicle',
    quantity: 1,
    acquired_at: new Date('2026-10-01T00:00:00Z'),
    expires_at: null,
    effect_kind: 'durable',
    rarity: 'common',
    animation_css: null,
    preview_data: {},
    is_equipped: false,
    equipped_slot: null,
    serial_number: null,
    durable: true,
    weekly_cost: '100',
    unpaid_weeks: 0,
    arrears_due: '0',
    suspended: false,
    ...overrides,
  };
}

describe('member shop holdings attention filter', () => {
  it('accepts only the backwards-compatible all and attention query values', () => {
    expect(parseShopHoldingsStatus(undefined)).toBe('all');
    expect(parseShopHoldingsStatus('all')).toBe('all');
    expect(parseShopHoldingsStatus('attention')).toBe('attention');
    expect(() => parseShopHoldingsStatus('suspended,all')).toThrow();
    expect(() => parseShopHoldingsStatus('ATTENTION')).toThrow();
  });

  it('selects arrears, unpaid weeks and suspended holdings without rounding bigint strings', () => {
    const rows = [
      row(),
      row({ code: 'arrears', arrears_due: '9007199254740993' }),
      row({ code: 'weeks', unpaid_weeks: 2 }),
      row({ code: 'paused', suspended: true }),
    ];
    const filtered = filterShopHoldings(rows, 'attention');
    expect(filtered.map((item) => item.code)).toEqual(['arrears', 'weeks', 'paused']);
    expect(filtered[0]?.arrears_due).toBe('9007199254740993');
    expect(filterShopHoldings(rows, 'all')).toEqual(rows);
  });

  it('does not manufacture overdue items from an empty owner-scoped read', () => {
    expect(filterShopHoldings([], 'attention')).toEqual([]);
  });
});
