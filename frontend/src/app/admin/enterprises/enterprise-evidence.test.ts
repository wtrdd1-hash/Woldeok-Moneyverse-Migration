import { describe, expect, it } from 'vitest';
import { parseEnterpriseEvidence } from './enterprise-evidence';

const id = '11111111-1111-4111-8111-111111111111';
const overview = {
  holding_name: 'WSHC',
  holding_code: 'WSHC_SOE_HOLDING',
  total_soe_assets_wld: '120000000',
  hourly_soe_revenue_wld: '180000',
  hourly_soe_profit_wld: '120000',
  hourly_soe_dividends_wld: '36000',
  total_private_enterprises: 1,
  total_private_valuation_wld: '25000000',
  hourly_corporate_tax_wld: '6750',
  governance_model: 'Model',
};
const soe = {
  id,
  code: 'SOE_POWER',
  name: 'Power',
  category: 'ENERGY',
  ceo_name: 'CEO',
  total_assets_wld: '120000000',
  operating_revenue_hourly_wld: '180000',
  operating_cost_hourly_wld: '60000',
  net_profit_hourly_wld: '120000',
  dividend_rate_bps: 3000,
  eval_grade: 'A',
  eval_score: 90,
  status: 'ACTIVE',
  description: 'Energy',
};
const enterprise = {
  id: '22222222-2222-4222-8222-222222222222',
  symbol: 'VENTURE-AI',
  name: 'Venture',
  sector: 'TECH',
  stage: 'IPO_LISTED',
  valuation_wld: '25000000',
  revenue_hourly_wld: '45000',
  corporate_tax_rate_bps: 1500,
  tax_paid_total_wld: '0',
  dividends_paid_total_wld: '0',
  active: true,
};
const log = {
  id: '33333333-3333-4333-8333-333333333333',
  enterprise_id: id,
  enterprise_code: 'SOE_POWER',
  enterprise_name: 'Power',
  dividend_amount_wld: '36000',
  revenue_wld: '180000',
  net_profit_wld: '120000',
  eval_grade: 'A',
  created_at: '2026-10-28T02:00:00.000Z',
};
const valid = { overview, soes: [soe], privateEnterprises: [enterprise], dividendLogs: [log] };

describe('administrator enterprise evidence', () => {
  it('accepts actual backend-shaped evidence and preserves WLD integer strings', () => {
    expect(parseEnterpriseEvidence(valid)?.soes[0]?.total_assets_wld).toBe('120000000');
    expect(
      parseEnterpriseEvidence({
        ...valid,
        overview: { ...overview, total_soe_assets_wld: '99999999999999999999' },
      })?.overview.total_soe_assets_wld,
    ).toBe('99999999999999999999');
  });
  it('does not turn failed or partial backend responses into empty portfolios', () => {
    for (const key of ['overview', 'soes', 'privateEnterprises', 'dividendLogs'] as const) {
      expect(parseEnterpriseEvidence({ ...valid, [key]: null })).toBeNull();
    }
  });
  it('rejects malformed money, unsafe counts and out-of-range bps', () => {
    expect(
      parseEnterpriseEvidence({ ...valid, soes: [{ ...soe, net_profit_hourly_wld: 'NaN' }] }),
    ).toBeNull();
    expect(
      parseEnterpriseEvidence({
        ...valid,
        overview: { ...overview, total_private_enterprises: -1 },
      }),
    ).toBeNull();
    expect(
      parseEnterpriseEvidence({ ...valid, soes: [{ ...soe, dividend_rate_bps: 12000 }] }),
    ).toBeNull();
    expect(
      parseEnterpriseEvidence({
        ...valid,
        privateEnterprises: [{ ...enterprise, valuation_wld: 25000000 }],
      }),
    ).toBeNull();
  });
  it('rejects duplicate enterprise identities and unsupported statuses', () => {
    expect(
      parseEnterpriseEvidence({ ...valid, soes: [soe, { ...soe, code: 'SOE_NET' }] }),
    ).toBeNull();
    expect(parseEnterpriseEvidence({ ...valid, soes: [{ ...soe, status: 'UNKNOWN' }] })).toBeNull();
    expect(
      parseEnterpriseEvidence({ ...valid, privateEnterprises: [enterprise, enterprise] }),
    ).toBeNull();
  });
  it('rejects malformed historical dividend timestamps and duplicate receipts', () => {
    expect(
      parseEnterpriseEvidence({ ...valid, dividendLogs: [{ ...log, created_at: 'invalid' }] }),
    ).toBeNull();
    expect(parseEnterpriseEvidence({ ...valid, dividendLogs: [log, log] })).toBeNull();
  });
});
