import { describe, expect, it } from 'vitest';
import { calculateWealthQuintiles, calculateStockCapitalization, parseAnalyticsUsers, parseAnalyticsStocks } from './analytics-precision';
import type { AdminUser, AdminStock } from '../types';

const user = (id: string, total_net_worth: string): AdminUser => ({
  user_id: id, display_name: id, status: 'active', created_at: '2026-11-01T00:00:00Z',
  restricted_at: null, restriction_reason: null, total_net_worth,
});
const stock = (id: string, current_price: string, shares_outstanding: string): AdminStock => ({
  id, symbol: id, name: id, current_price, shares_outstanding, shares_available: '0',
  holders: 0, trades: 0, active: true,
});

describe('admin analytics exact financial read model', () => {
  it('orders 64-bit wealth without Number rounding and retains exact integer averages', () => {
    const rows = calculateWealthQuintiles([
      user('lower', '9007199254740992'), user('upper', '9007199254740993'),
      user('middle', '9007199254740991'), user('small', '1'), user('zero', '0'),
    ]);
    expect(rows).not.toBeNull();
    expect(rows?.map((r) => r.totalWealth)).toEqual([
      9007199254740993n, 9007199254740992n, 9007199254740991n, 1n, 0n,
    ]);
    expect(rows?.[0]?.avgWealth).toBe(9007199254740993n);
    expect(rows?.[0]?.ratio).toMatch(/^\d+\.\d$/);
  });

  it('never rounds or invents wealth for malformed, duplicate or missing owner records', () => {
    expect(calculateWealthQuintiles([user('a', '1'), user('a', '2')])).toBeNull();
    expect(calculateWealthQuintiles([user('a', '1e9')])).toBeNull();
    expect(calculateWealthQuintiles([user('a', '-1')])).toBeNull();
    expect(calculateWealthQuintiles([user('a', '01')])).toBeNull();
    expect(calculateWealthQuintiles([user('a', '1'), { ...user('b', '2'), total_net_worth: undefined }])).toBeNull();
    expect(calculateWealthQuintiles([])).toEqual([]);
  });

  it('ranks market capitalization using exact price times outstanding shares', () => {
    const rows = calculateStockCapitalization([
      stock('AAA', '9007199254740992', '2'), stock('BBB', '9007199254740993', '2'),
    ]);
    expect(rows?.map((r) => r.id)).toEqual(['BBB', 'AAA']);
    expect(rows?.[0]?.cap).toBe(18014398509481986n);
    expect(rows?.[0]?.price).toBe(9007199254740993n);
  });

  it('fails closed on malformed and duplicate market read models', () => {
    expect(calculateStockCapitalization([stock('AAA', 'NaN', '2')])).toBeNull();
    expect(calculateStockCapitalization([stock('AAA', '1', '-1')])).toBeNull();
    expect(calculateStockCapitalization([stock('AAA', '1', '2'), stock('AAA', '3', '4')])).toBeNull();
    expect(calculateStockCapitalization([{ ...stock('AAA', '1', '2'), trades: Number.NaN }])).toBeNull();
    expect(calculateStockCapitalization([])).toEqual([]);
  });
  it('rejects malformed or duplicated admin user list envelopes before cohort rendering', () => {
    expect(parseAnalyticsUsers({ users: [null] })).toBeNull();
    expect(parseAnalyticsUsers({ users: [user('a', '1'), user('a', '2')] })).toBeNull();
    expect(parseAnalyticsUsers({ users: [{ ...user('a', '1'), created_at: 'not-a-date' }] })).toBeNull();
    expect(parseAnalyticsUsers({ users: [user('a', '1')] })?.length).toBe(1);
    expect(parseAnalyticsUsers({ users: [] })).toEqual([]);
  });

  it('rejects malformed stock API envelopes rather than marking them as verified empty', () => {
    expect(parseAnalyticsStocks({ stocks: [null] })).toBeNull();
    expect(parseAnalyticsStocks({ stocks: [stock('A', 'bad', '1')] })).toBeNull();
    expect(parseAnalyticsStocks({ stocks: [stock('A', '1', '2')] })?.length).toBe(1);
    expect(parseAnalyticsStocks({ stocks: [] })).toEqual([]);
  });

});
