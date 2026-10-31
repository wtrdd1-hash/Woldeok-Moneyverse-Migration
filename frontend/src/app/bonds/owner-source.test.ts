import { describe, expect, it } from 'vitest';
import { verifyOwnerBondHoldings, verifyOwnerRepoLoans } from './owner-source';

const holding = {
  id: 'b00a4a7c-8b0b-4e23-88c7-8cf1e9cce003',
  user_id: '8a4d70f2-25f0-4e8d-a8f9-77d44d56c5e1',
  bond_id: 'c69c4696-2f6c-43f8-ae1e-58bbcd77a1d8',
  bond_symbol: 'KTB-01Y', bond_name: 'Virtual bond',
  units: '2', par_value_wld: '10000', purchase_price_total_wld: '20000',
  accrued_interest_wld: '15', hourly_coupon_rate_bps: 5, annual_coupon_rate_bps: 450,
  purchased_at: '2026-10-30T00:00:00.000Z', maturity_at: '2026-11-02T00:00:00.000Z',
  status: 'HOLDING', auto_rollover: false, collateral_locked: false, hours_left: 48,
};
const repo = {
  id: 'a9df34a7-7c7e-4a2e-9559-3ec3bcd7f011', holding_id: holding.id,
  user_id: holding.user_id, bond_name: holding.bond_name, bond_symbol: holding.bond_symbol,
  principal_wld: '16000', annual_interest_rate_bps: 250, accrued_interest_wld: '4',
  ltv_percent: 80, status: 'ACTIVE', created_at: '2026-10-30T00:00:00.000Z',
};

describe('owner virtual-bond read evidence', () => {
  it('accepts an authenticated verified empty list without fabricating positions', () => {
    expect(verifyOwnerBondHoldings([])).toEqual([]);
    expect(verifyOwnerRepoLoans([])).toEqual([]);
  });
  it('accepts complete backend owner records and canonical bigint WLD strings', () => {
    expect(verifyOwnerBondHoldings([holding])).toEqual([holding]);
    expect(verifyOwnerRepoLoans([repo])).toEqual([repo]);
  });
  it('rejects malformed, duplicate and unbounded owner holdings', () => {
    expect(verifyOwnerBondHoldings(null)).toBeNull();
    expect(verifyOwnerBondHoldings([holding, holding])).toBeNull();
    expect(verifyOwnerBondHoldings([{ ...holding, units: 'NaN' }])).toBeNull();
    expect(verifyOwnerBondHoldings([{ ...holding, accrued_interest_wld: '-1' }])).toBeNull();
    expect(verifyOwnerBondHoldings([{ ...holding, annual_coupon_rate_bps: Infinity }])).toBeNull();
    expect(verifyOwnerBondHoldings([{ ...holding, maturity_at: 'not a date' }])).toBeNull();
    expect(verifyOwnerBondHoldings([{ ...holding, user_id: 'wrong owner' }])).toBeNull();
    expect(verifyOwnerBondHoldings(Array(501).fill(holding))).toBeNull();
  });
  it('rejects malformed, duplicate and implausible repo loans', () => {
    expect(verifyOwnerRepoLoans(undefined)).toBeNull();
    expect(verifyOwnerRepoLoans([repo, repo])).toBeNull();
    expect(verifyOwnerRepoLoans([{ ...repo, principal_wld: '1e20' }])).toBeNull();
    expect(verifyOwnerRepoLoans([{ ...repo, ltv_percent: 180 }])).toBeNull();
    expect(verifyOwnerRepoLoans([{ ...repo, status: 'PAID' }])).toBeNull();
    expect(verifyOwnerRepoLoans([{ ...repo, created_at: 'invalid' }])).toBeNull();
  });
});
