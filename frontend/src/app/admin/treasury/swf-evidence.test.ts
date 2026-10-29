import { describe, expect, it } from 'vitest';
import { parseSwfEvidence, swfPortfolioTotals } from './swf-evidence';

const id = '11111111-1111-4111-8111-111111111111';
const config = { id: 'current', is_enabled: false, safe_reserve_wld: '25000000',
  max_single_investment_wld: '10000000', reinvestment_ratio_pct: 15, max_investment_ratio_pct: 20,
  equity_ratio_pct: 60, bond_ratio_pct: 30, dividend_ratio_pct: 10 };
const portfolio = { id, asset_type: 'STOCK', asset_symbol: 'WDX', asset_name: 'Example',
  quantity: '1', total_invested_wld: '9007199254740994', average_price_wld: '100',
  current_valuation_wld: '9007199254740993', unrealized_pnl_wld: '-1' };
const event = { id: '22222222-2222-4222-8222-222222222222', event_type: 'REBALANCE',
  amount_wld: '10', summary: 'Rebalanced', created_at: '2026-10-27T12:00:00.000Z' };

describe('admin sovereign wealth fund evidence', () => {
  it('preserves exact 64-bit+ WLD and negative PnL when summing the full returned portfolio', () => {
    const evidence = parseSwfEvidence({ config, portfolios: [portfolio, { ...portfolio, id: '33333333-3333-4333-8333-333333333333', current_valuation_wld: '7', unrealized_pnl_wld: '3' }], events: [event] });
    expect(evidence).not.toBeNull();
    expect(swfPortfolioTotals(evidence!.portfolios)).toEqual({ aumWld: '9007199254741000', pnlWld: '2' });
  });
  it('rejects missing, malformed, duplicate or imprecise financial evidence', () => {
    for (const raw of [null, {}, { config: null, portfolios: [], events: [] },
      { config: { ...config, is_enabled: 'true' }, portfolios: [], events: [] },
      { config, portfolios: [{ ...portfolio, current_valuation_wld: 9007199254740992 }], events: [] },
      { config, portfolios: [portfolio, portfolio], events: [] },
      { config, portfolios: [{ ...portfolio, unrealized_pnl_wld: 'NaN' }], events: [] },
      { config, portfolios: [], events: [{ ...event, created_at: 'invalid' }] },
      { config: { ...config, safe_reserve_wld: '0.5' }, portfolios: [], events: [] },
    ]) expect(parseSwfEvidence(raw)).toBeNull();
  });
  it('accepts a verified empty portfolio without inventing a 25M reserve', () => {
    expect(parseSwfEvidence({ config: { ...config, safe_reserve_wld: '0' }, portfolios: [], events: [] })?.config.safe_reserve_wld).toBe('0');
  });
});
