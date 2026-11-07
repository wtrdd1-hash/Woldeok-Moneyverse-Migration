import { describe, expect, it } from 'vitest';
import { parsePortfolioResponse } from './portfolio-source';

const row = {
  stock_id: '11111111-1111-4111-8111-111111111111',
  symbol: 'WDG',
  name: 'Virtual WDG',
  quantity: '10',
  average_cost: '100',
  current_price: '120',
  market_value: '1200',
  halt_status: 'ACTIVE',
};

describe('owner portfolio source evidence', () => {
  it('accepts a verified empty owner portfolio and valid bigint strings', () => {
    expect(parsePortfolioResponse({ holdings: [] })).toEqual([]);
    expect(parsePortfolioResponse({ holdings: [row] })).toEqual([{ stock_id: row.stock_id, symbol: row.symbol, name: row.name, quantity: row.quantity, average_cost: row.average_cost, current_price: row.current_price, market_value: row.market_value, halt_status: 'ACTIVE' }]);
    expect(parsePortfolioResponse({ holdings: [{ ...row, quantity: '9007199254740993', current_price: '1', market_value: '9007199254740993' }] })?.[0]?.quantity).toBe('9007199254740993');
  });

  it('does not turn missing, malformed, or oversized data into a verified empty portfolio', () => {
    for (const payload of [null, {}, { holdings: null }, { holdings: {} }, { holdings: [null] }, { holdings: Array(101).fill(row) }]) {
      expect(parsePortfolioResponse(payload)).toBeNull();
    }
  });

  it('rejects duplicate identifiers and duplicate symbols before totals or trades', () => {
    expect(parsePortfolioResponse({ holdings: [row, row] })).toBeNull();
    expect(parsePortfolioResponse({ holdings: [row, { ...row, stock_id: '22222222-2222-4222-8222-222222222222' }] })).toBeNull();
  });

  it('rejects fabricated valuation, invalid identifiers and zero or non-integer quantity', () => {
    for (const change of [
      { stock_id: 'not-uuid' }, { symbol: '../bad' }, { name: '' },
      { quantity: '0' }, { quantity: '1.5' }, { quantity: 1 },
      { current_price: '-1' }, { market_value: '1199' }, { halt_status: 'UNKNOWN' },
      { average_cost: '9223372036854775808' },
    ]) {
      expect(parsePortfolioResponse({ holdings: [{ ...row, ...change }] })).toBeNull();
    }
  });
});

describe('stock halt settlement receipt evidence', () => {
  const receipt = {
    id: '33333333-3333-4333-8333-333333333333',
    halt_event_id: '44444444-4444-4444-8444-444444444444',
    stock_id: row.stock_id,
    stock_symbol: row.symbol,
    stock_name: row.name,
    quantity: '10',
    basis_method: 'average_cost',
    basis_unit_amount: '100',
    refund_amount: '1000',
    status: 'settled',
    created_at: '2026-10-01T00:00:00.000Z',
  };
  it('preserves verified empty, settled and quarantined records', async () => {
    const { parseStockHaltReceipts } = await import('./portfolio-source');
    expect(parseStockHaltReceipts({ receipts: [] })).toEqual([]);
    expect(parseStockHaltReceipts({ receipts: [receipt] })).toEqual([receipt]);
    expect(parseStockHaltReceipts({ receipts: [{ ...receipt, status: 'quarantined', refund_amount: '0' }] })?.[0]?.status).toBe('quarantined');
  });
  it('fails closed on missing, duplicate or invented refund receipts', async () => {
    const { parseStockHaltReceipts } = await import('./portfolio-source');
    for (const payload of [null, {}, { receipts: [receipt, receipt] }, { receipts: [{ ...receipt, refund_amount: '1001' }] }, { receipts: [{ ...receipt, quantity: '0', basis_unit_amount: '0', refund_amount: '0' }] }, { receipts: [{ ...receipt, status: 'quarantined' }] }]) {
      expect(parseStockHaltReceipts(payload)).toBeNull();
    }
  });
});
