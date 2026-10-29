import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SwfControlPanel } from './swf-control-panel';

const config = { is_enabled: false, safe_reserve_wld: '9007199254740993',
  max_single_investment_wld: '10000000', reinvestment_ratio_pct: 15,
  max_investment_ratio_pct: 20, equity_ratio_pct: 60, bond_ratio_pct: 30, dividend_ratio_pct: 10 };
const portfolio = { id: '11111111-1111-4111-8111-111111111111', asset_type: 'STOCK',
  asset_symbol: 'WDX', asset_name: 'Example', quantity: '9007199254740993',
  total_invested_wld: '9007199254740994', average_price_wld: '1',
  current_valuation_wld: '9007199254740993', unrealized_pnl_wld: '-1' };

describe('SWF exact WLD rendering', () => {
  it('does not round 2^53+ portfolio, reserve or negative unrealized loss', () => {
    render(<SwfControlPanel initialConfig={config} initialPortfolios={[portfolio]} initialEvents={[]} />);
    expect(screen.getAllByText(/9,007,199,254,740,993/).length).toBeGreaterThan(1);
    expect(screen.getAllByText(/−1/).length).toBeGreaterThan(0);
    expect(screen.queryByText(/9,007,199,254,740,992/)).toBeNull();
  });
});
