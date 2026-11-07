import { describe, expect, it } from 'vitest';
import { parseBondOwnerHoldings, parseBondOwnerRepoLoans } from './owner-source';

const id = 'c69c4696-2f6c-43f8-ae1e-58bbcd77a1d8';
const bondId = '2f9b5f15-2d17-47c0-9123-1e6c7f26ab19';
const holding = {
  id, user_id: bondId, bond_id: bondId, bond_symbol: 'KTB-01Y', bond_name: 'Virtual bond',
  units: '9007199254740993', par_value_wld: '10000', purchase_price_total_wld: '90071992547409930000',
  accrued_interest_wld: '100', hourly_coupon_rate_bps: 1, annual_coupon_rate_bps: 450,
  purchased_at: '2026-11-01 09:00:00+00', maturity_at: '2027-11-01 09:00:00+00',
  status: 'HOLDING', auto_rollover: false, collateral_locked: false, hours_left: 100,
};
const repo = {
  id, holding_id: bondId, user_id: bondId, bond_name: 'Virtual bond', bond_symbol: 'KTB-01Y',
  principal_wld: '9007199254740993', annual_interest_rate_bps: 250,
  accrued_interest_wld: '100', ltv_percent: 80, status: 'ACTIVE', created_at: '2026-11-01 09:00:00+00',
};

describe('owner-scoped bond read source integrity', () => {
  it('preserves exact WLD integers and strips backend owner identifiers', () => {
    expect(parseBondOwnerHoldings([holding])).toMatchObject([{ units: '9007199254740993', purchase_price_total_wld: '90071992547409930000' }]);
    expect(parseBondOwnerRepoLoans([repo])).toMatchObject([{ principal_wld: '9007199254740993' }]);
    expect(parseBondOwnerHoldings([holding])?.[0]).not.toHaveProperty('user_id');
    expect(parseBondOwnerRepoLoans([repo])?.[0]).not.toHaveProperty('user_id');
  });
  it('distinguishes verified empty from unavailable and rejects invalid financial rows', () => {
    expect(parseBondOwnerHoldings([])).toEqual([]);
    expect(parseBondOwnerRepoLoans([])).toEqual([]);
    expect(parseBondOwnerHoldings(null)).toBeNull();
    expect(parseBondOwnerRepoLoans({ loans: [] })).toBeNull();
    expect(parseBondOwnerHoldings([{ ...holding, units: '1.2' }])).toBeNull();
    expect(parseBondOwnerHoldings([{ ...holding, accrued_interest_wld: '-1' }])).toBeNull();
    expect(parseBondOwnerHoldings([{ ...holding, annual_coupon_rate_bps: '450' }])).toBeNull();
    expect(parseBondOwnerHoldings([{ ...holding, maturity_at: 'not-a-date' }])).toBeNull();
    expect(parseBondOwnerHoldings([{ ...holding, status: 'UNKNOWN' }])).toBeNull();
    expect(parseBondOwnerRepoLoans([{ ...repo, principal_wld: 'Infinity' }])).toBeNull();
    expect(parseBondOwnerRepoLoans([{ ...repo, ltv_percent: 900 }])).toBeNull();
    expect(parseBondOwnerRepoLoans([{ ...repo, status: 'FORGED' }])).toBeNull();
  });
  it('rejects duplicate or unbounded arrays instead of truncating owner financial rows', () => {
    expect(parseBondOwnerHoldings([holding, holding])).toBeNull();
    expect(parseBondOwnerRepoLoans([repo, repo])).toBeNull();
    expect(parseBondOwnerHoldings(Array(1001).fill(holding))).toBeNull();
  });
});
