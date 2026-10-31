import { describe, expect, it } from 'vitest';
import { verifiedEnterpriseDisclosure } from './enterprise-disclosure';

const source = {
  source: 'DATABASE_SNAPSHOT', settlementStatus: 'NOT_VERIFIED',
  disclosed_at: '2026-11-01T00:00:00.000Z',
  overview: { holding_name: 'Holding', holding_code: 'WSHC', governance_model: 'virtual',
    total_soe_assets_wld: '9007199254740993', hourly_soe_revenue_wld: '200',
    hourly_soe_profit_wld: '100', hourly_soe_dividends_wld: '30' },
  soes: [{ code: 'SOE_A', name: 'A', category: 'ENERGY', ceo_name: 'Director',
    total_assets_wld: '9007199254740993', net_profit_hourly_wld: '100',
    dividend_rate_bps: 3000, eval_grade: 'A', description: 'virtual' }],
};

describe('public enterprise source evidence parser', () => {
  it('accepts exact integer WLD strings without numeric coercion', () => {
    expect(verifiedEnterpriseDisclosure(source)?.overview.total_soe_assets_wld).toBe('9007199254740993');
  });
  it('rejects missing, malformed, fabricated or duplicate evidence', () => {
    expect(verifiedEnterpriseDisclosure(null)).toBeNull();
    expect(verifiedEnterpriseDisclosure({ ...source, source: 'UNKNOWN' })).toBeNull();
    expect(verifiedEnterpriseDisclosure({ ...source, settlementStatus: 'PAID' })).toBeNull();
    expect(verifiedEnterpriseDisclosure({ ...source, disclosed_at: 'nonsense' })).toBeNull();
    expect(verifiedEnterpriseDisclosure({ ...source, disclosed_at: '2026-02-31T00:00:00.000Z' })).toBeNull();
    expect(verifiedEnterpriseDisclosure({ ...source, overview: { ...source.overview, total_soe_assets_wld: 9007199254740993 } })).toBeNull();
    expect(verifiedEnterpriseDisclosure({ ...source, soes: [source.soes[0], source.soes[0]] })).toBeNull();
    expect(verifiedEnterpriseDisclosure({ ...source, soes: [{ ...source.soes[0], dividend_rate_bps: 11000 }] })).toBeNull();
    expect(verifiedEnterpriseDisclosure({ ...source, soes: [{ ...source.soes[0], total_assets_wld: '-1' }] })).toBeNull();
  });
  it('permits negative operating profit projections without asserting payment', () => {
    const result = verifiedEnterpriseDisclosure({ ...source, overview: { ...source.overview, hourly_soe_profit_wld: '-20' }, soes: [{ ...source.soes[0], net_profit_hourly_wld: '-20' }] });
    expect(result?.soes[0]?.net_profit_hourly_wld).toBe('-20');
  });
  it('allows verified empty enterprise list but not missing list', () => {
    expect(verifiedEnterpriseDisclosure({ ...source, soes: [] })?.soes).toEqual([]);
    expect(verifiedEnterpriseDisclosure({ ...source, soes: null })).toBeNull();
  });
});
