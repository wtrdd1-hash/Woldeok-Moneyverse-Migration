import { describe, expect, it } from 'vitest';
import { parsePublicEnterpriseDisclosure, formatEnterpriseWld } from './public-enterprise-evidence';

const valid = {
  disclosed_at: '2026-11-01T20:00:00.000Z',
  standards: 'public reference',
  overview: {
    holding_name: 'WSHC', holding_code: 'WSHC_SOE_HOLDING', total_soe_assets_wld: '0',
    hourly_soe_revenue_wld: '1200000000000000000000000000000', hourly_soe_profit_wld: '-100',
    hourly_soe_dividends_wld: '12.50', governance_model: 'public model',
  },
  soes: [{ code: 'SOE_POWER', name: 'Power', category: 'ENERGY', ceo_name: 'CEO',
    total_assets_wld: '0', operating_revenue_hourly_wld: '0', net_profit_hourly_wld: '-100',
    dividend_rate_bps: 3000, eval_grade: 'A', status: 'ACTIVE', description: 'public' }],
};

describe('public enterprise disclosure source integrity', () => {
  it('does not create fictitious totals or enterprises on absent response', () => {
    expect(parsePublicEnterpriseDisclosure(null)).toBeNull();
    expect(parsePublicEnterpriseDisclosure({})).toBeNull();
  });
  it('accepts verified empty/zero disclosure and preserves exact money', () => {
    expect(parsePublicEnterpriseDisclosure({ ...valid, soes: [] })?.soes).toEqual([]);
    expect(parsePublicEnterpriseDisclosure(valid)?.overview.hourly_soe_revenue_wld).toBe('1200000000000000000000000000000');
    expect(formatEnterpriseWld('1200000000000000000000000000000')).toBe('1,200,000,000,000,000,000,000,000,000,000');
    expect(formatEnterpriseWld('12.50')).toBe('12.50');
  });
  it.each([
    { ...valid, overview: null },
    { ...valid, soes: {} },
    { ...valid, soes: [{ ...valid.soes[0], total_assets_wld: 'NaN' }] },
    { ...valid, soes: [{ ...valid.soes[0], dividend_rate_bps: 10001 }] },
    { ...valid, soes: [{ ...valid.soes[0], status: 'FAKE' }] },
    { ...valid, soes: [valid.soes[0], valid.soes[0]] },
    { ...valid, overview: { ...valid.overview, total_soe_assets_wld: 365000000 } },
    { ...valid, overview: { ...valid.overview, hourly_soe_dividends_wld: 'Infinity' } },
    { ...valid, disclosed_at: 'not-a-date' },
    { ...valid, disclosed_at: '2099-01-01T00:00:00Z' },
    { ...valid, soes: [{ ...valid.soes[0], code: 'bad code' }] },
  ])('rejects malformed source rather than reporting certified financial data', (source) => {
    expect(parsePublicEnterpriseDisclosure(source)).toBeNull();
  });
});
