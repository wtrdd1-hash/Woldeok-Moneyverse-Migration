import { describe, expect, it } from 'vitest';
import { parseBondEvidence } from './bond-evidence';

const overview = {
  totalBondsActive: 1,
  totalFundedWld: '9007199254740993',
  totalHoldersCount: 2,
  totalCouponsPaidWld: '100',
  totalRepoLoansWld: '0',
  benchmark1YYield: '4.50%',
  benchmark3YYield: '5.20%',
  benchmark5YYield: '6.50%',
};
const bond = {
  id: 'b1111111-1111-4111-8111-111111111111',
  symbol: 'KTB-01Y',
  name: 'Test bond',
  maturity_hours: 8760,
  annual_coupon_rate_bps: 450,
  hourly_coupon_rate_bps: 1,
  par_value_wld: '9007199254740993',
  total_issued_units: '100',
  available_units: '50',
  total_funded_wld: '9007199254740993',
  status: 'OPEN_SUBSCRIPTION',
  description: 'Test',
};
const log = {
  id: 'c1111111-1111-4111-8111-111111111111',
  holding_id: null,
  user_id: 'd1111111-1111-4111-8111-111111111111',
  bond_symbol: 'KTB-01Y',
  bond_name: 'Test bond',
  event_type: 'COUPON_INTEREST',
  amount_wld: '1',
  created_at: '2026-10-27T07:00:00.000Z',
};

describe('bond admin verified read evidence', () => {
  it('preserves exact large WLD integer strings', () => {
    expect(parseBondEvidence({ overview, bonds: [bond], couponLogs: [log] }).overview.totalFundedWld).toBe('9007199254740993');
  });
  it('accepts genuine empty inventory without inventing three offerings', () => {
    expect(parseBondEvidence({ overview: { ...overview, totalBondsActive: 0 }, bonds: [], couponLogs: [] }).bonds).toEqual([]);
  });
  it.each([
    ['missing overview', { overview: null, bonds: [], couponLogs: [] }],
    ['missing list', { overview, couponLogs: [] }],
    ['negative money', { overview: { ...overview, totalFundedWld: '-1' }, bonds: [bond], couponLogs: [] }],
    ['rounded unsafe number', { overview: { ...overview, totalFundedWld: 9007199254740993 }, bonds: [bond], couponLogs: [] }],
    ['invalid count', { overview: { ...overview, totalHoldersCount: NaN }, bonds: [bond], couponLogs: [] }],
    ['duplicate bonds', { overview, bonds: [bond, bond], couponLogs: [] }],
    ['available exceeds issued', { overview, bonds: [{ ...bond, available_units: '101' }], couponLogs: [] }],
    ['duplicate logs', { overview, bonds: [bond], couponLogs: [log, log] }],
    ['invalid date', { overview, bonds: [bond], couponLogs: [{ ...log, created_at: 'invalid' }] }],
    ['unknown event', { overview, bonds: [bond], couponLogs: [{ ...log, event_type: 'PAYOUT_SUCCESS' }] }],
    ['unbounded log sample', { overview, bonds: [bond], couponLogs: Array.from({ length: 31 }, (_, i) => ({ ...log, id: 'c1111111-1111-4111-8111-' + String(i).padStart(12, '0') })) }],
  ])('rejects %s', (_label, payload) => {
    expect(() => parseBondEvidence(payload)).toThrow();
  });
});
