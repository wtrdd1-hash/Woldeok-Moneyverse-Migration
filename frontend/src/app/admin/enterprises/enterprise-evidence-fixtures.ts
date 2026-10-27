const uuid1 = '11111111-1111-4111-8111-111111111111';
const uuid2 = '22222222-2222-4222-8222-222222222222';
const uuid3 = '33333333-3333-4333-8333-333333333333';

export const validOverview = {
  holding_name: 'WSHC',
  holding_code: 'WSHC_SOE_HOLDING',
  total_soe_assets_wld: '9007199254740993',
  hourly_soe_revenue_wld: '500',
  hourly_soe_profit_wld: '100',
  hourly_soe_dividends_wld: '30',
  total_private_enterprises: 1,
  total_private_valuation_wld: '1000',
  hourly_corporate_tax_wld: '15',
  governance_model: 'public',
};
export const validSoe = {
  id: uuid1,
  code: 'SOE_POWER',
  name: 'Power',
  category: 'Energy',
  ceo_name: 'Operator',
  total_assets_wld: '9007199254740993',
  operating_revenue_hourly_wld: '500',
  operating_cost_hourly_wld: '400',
  net_profit_hourly_wld: '100',
  dividend_rate_bps: 3000,
  eval_grade: 'A',
  eval_score: 90,
  status: 'ACTIVE',
  description: 'Power',
};
export const validPrivate = {
  id: uuid2,
  symbol: 'ABC',
  name: 'ABC',
  sector: 'Technology',
  stage: 'SEED',
  valuation_wld: '1000',
  revenue_hourly_wld: '10',
  corporate_tax_rate_bps: 1500,
  tax_paid_total_wld: '5',
  dividends_paid_total_wld: '3',
  active: true,
};
export const validLog = {
  id: uuid3,
  enterprise_id: uuid1,
  enterprise_code: 'SOE_POWER',
  enterprise_name: 'Power',
  dividend_amount_wld: '30',
  revenue_wld: '500',
  net_profit_wld: '100',
  eval_grade: 'A',
  created_at: '2026-10-27 05:00:00+00',
};
