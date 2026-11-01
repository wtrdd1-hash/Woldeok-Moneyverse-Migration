import { describe, expect, it } from 'vitest';
import { dashboardAlerts, dashboardHistory, dashboardPortfolio, dashboardWallet, dashboardWatchlist } from './dashboard-source';

const uuid = '11111111-1111-4111-8111-111111111111';
const uuid2 = '22222222-2222-4222-8222-222222222222';
const stock = { stock_id: uuid, symbol: 'AA', name: 'Alpha', current_price: '9007199254740993', day_open_price: '9007199254740991' };
const holding = { ...stock, quantity: '3', market_value: '27021597764222979' };
const trade = { trade_id: uuid, symbol: 'AA', side: 'buy', quantity: '3', gross_amount: '30', created_at: '2026-11-01T00:00:00.000Z' };
const alert = { event_id: uuid, symbol: 'AA', name: 'Alpha', trigger_price: '12', trigger_day_change_bps: 100, triggered_at: '2026-11-01T00:00:00.000Z' };
const wallet = {
  userId: uuid,
  balances: { currency: 'WLD', cash: { availableAmount: '10', updatedAt: '2026-11-01T00:00:00.000Z' }, bank: { availableAmount: '20', updatedAt: '2026-11-01T00:00:00.000Z' }, totalAvailableAmount: '30' },
  recentTransactions: [],
};

describe('dashboard owner source verification', () => {
  it('distinguishes verified empty sources from absent or malformed envelopes', () => {
    expect(dashboardWatchlist({ stocks: [] })).toEqual([]);
    expect(dashboardPortfolio({ holdings: [] })).toEqual([]);
    expect(dashboardHistory({ trades: [] })).toEqual([]);
    expect(dashboardAlerts({ events: [] })).toEqual([]);
    for (const parse of [dashboardWatchlist, dashboardPortfolio, dashboardHistory, dashboardAlerts]) {
      expect(parse(null)).toBeNull();
      expect(parse({})).toBeNull();
    }
    expect(dashboardWatchlist({ stocks: '[]' })).toBeNull();
  });

  it('preserves exact WLD integer strings and rejects malformed watchlist rows', () => {
    expect(dashboardWatchlist({ stocks: [stock] })).toEqual([stock]);
    for (const current_price of [null, undefined, 20, '1.2', '-5', '00', '9223372036854775808']) {
      expect(dashboardWatchlist({ stocks: [{ ...stock, current_price }] })).toBeNull();
    }
    expect(dashboardWatchlist({ stocks: [stock, { ...stock, stock_id: uuid2 }] })).toBeNull();
  });

  it('rejects invalid portfolio quantities and duplicate owner rows', () => {
    expect(dashboardPortfolio({ holdings: [holding] })).toEqual([holding]);
    expect(dashboardPortfolio({ holdings: [{ ...holding, quantity: 'oops' }] })).toBeNull();
    expect(dashboardPortfolio({ holdings: [holding, holding] })).toBeNull();
  });

  it('rejects malformed trade and alert records before formatting', () => {
    expect(dashboardHistory({ trades: [trade] })).toEqual([trade]);
    expect(dashboardHistory({ trades: [{ ...trade, created_at: 'yesterday' }] })).toBeNull();
    expect(dashboardHistory({ trades: [{ ...trade, side: 'mint' }] })).toBeNull();
    expect(dashboardAlerts({ events: [alert] })).toEqual([alert]);
    expect(dashboardAlerts({ events: [{ ...alert, trigger_day_change_bps: Number.NaN }] })).toBeNull();
    expect(dashboardAlerts({ events: [{ ...alert, trigger_price: 'Infinity' }] })).toBeNull();
  });

  it('rejects success-shaped malformed wallet data and contradictory balance totals', () => {
    expect(dashboardWallet(wallet)).toEqual(wallet);
    expect(dashboardWallet(null)).toBeNull();
    expect(dashboardWallet({ ...wallet, balances: { ...wallet.balances, totalAvailableAmount: '31' } })).toBeNull();
    expect(dashboardWallet({ ...wallet, recentTransactions: null })).toBeNull();
    expect(dashboardWallet({ ...wallet, recentTransactions: [{ transactionId: uuid, label: 'bad', netAmount: '1.1', occurredAt: '2026-11-01T00:00:00.000Z' }] })).toBeNull();
  });

  it('rejects unbounded lists instead of rendering an unverified summary count', () => {
    expect(dashboardWatchlist({ stocks: Array(501).fill(stock) })).toBeNull();
    expect(dashboardAlerts({ events: Array(6).fill(alert) })).toBeNull();
  });
});
