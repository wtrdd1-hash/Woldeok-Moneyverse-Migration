import { describe, expect, it } from 'vitest';
import {
  verifyPensionOverview,
  verifyPensionAccount,
  verifyPensionContributions,
  verifyPensionPayouts,
  verifyPensionWalletCash,
} from './pension-source';

const uuid = '123e4567-e89b-42d3-a456-426614174000';
const second = '123e4567-e89b-42d3-a456-426614174001';
const account = {
  id: uuid, user_id: second, tier: 'TIER_1_YOUTH', status: 'ACCUMULATING',
  accumulated_contribution_wld: '9007199254740993', total_contributions_count: 1,
  hourly_payout_rate_bps: 8, total_payout_received_wld: '0',
  created_at: '2026-10-01T00:00:00.000Z', updated_at: '2026-10-02T00:00:00.000Z',
};
const overview = {
  totalAumWld: '9007199254740993', totalSubscribersCount: 2,
  totalRetiredReceiversCount: 1, totalPensionPaidWld: '0',
  benchmarkAnnualPayoutRate: null, annualPayoutRateCertified: false,
  vaultMainBalanceWld: '500',
};
const contribution = { id: uuid, amount_wld: '999999999999999999999', note: '기여금', created_at: '2026-10-01T00:00:00Z' };
const payout = { id: uuid, payout_amount_wld: '45', snapshot_accumulated_wld: '500', created_at: '2026-10-01T00:00:00Z' };

describe('P1 pension evidence at the Next/Nest boundary', () => {
  it('uses only the authenticated cash pocket, not cash plus bank, for a pension contribution balance', () => {
    const wallet = {
      userId: second,
      balances: {
        currency: 'WLD',
        cash: { availableAmount: '9007199254740993', updatedAt: '2026-10-01T00:00:00Z' },
        bank: { availableAmount: '50', updatedAt: '2026-10-01T00:00:00Z' },
        totalAvailableAmount: '9007199254741043',
      },
    };
    expect(verifyPensionWalletCash(wallet, second)).toBe('9007199254740993');
    expect(verifyPensionWalletCash(wallet, uuid)).toBeNull();
    expect(verifyPensionWalletCash({ ...wallet, balances: { ...wallet.balances, totalAvailableAmount: '999' } }, second)).toBeNull();
    expect(verifyPensionWalletCash({ ...wallet, balances: { ...wallet.balances, currency: 'USD' } }, second)).toBeNull();
    expect(verifyPensionWalletCash({ ...wallet, balances: { ...wallet.balances, cash: { availableAmount: 9007199254740992, updatedAt: '2026-10-01T00:00:00Z' } } }, second)).toBeNull();
  });
  it('accepts canonical large integer amounts without Number precision loss', () => {
    expect(verifyPensionOverview(overview)?.totalAumWld).toBe('9007199254740993');
    expect(verifyPensionAccount(account)?.accumulated_contribution_wld).toBe('9007199254740993');
    expect(verifyPensionContributions([contribution])?.[0]?.amount_wld).toBe('999999999999999999999');
    expect(verifyPensionPayouts([payout])?.[0]?.payout_amount_wld).toBe('45');
  });
  it('rejects invalid public aggregates rather than rendering fabricated totals', () => {
    expect(verifyPensionOverview({ ...overview, totalAumWld: 9007199254740992 })).toBeNull();
    expect(verifyPensionOverview({ ...overview, totalSubscribersCount: 1, totalRetiredReceiversCount: 2 })).toBeNull();
    expect(verifyPensionOverview({ ...overview, totalPensionPaidWld: '-1' })).toBeNull();
    expect(verifyPensionOverview({ ...overview, annualPayoutRateCertified: true })).toBeNull();
    expect(verifyPensionOverview({ ...overview, vaultMainBalanceWld: null })).toBeNull();
  });
  it('rejects untrusted member accounts before any BigInt arithmetic', () => {
    expect(verifyPensionAccount({ ...account, accumulated_contribution_wld: 'invalid' })).toBeNull();
    expect(verifyPensionAccount({ ...account, id: 'not-a-uuid' })).toBeNull();
    expect(verifyPensionAccount({ ...account, hourly_payout_rate_bps: Infinity })).toBeNull();
    expect(verifyPensionAccount({ ...account, tier: 'FAKE_TIER' })).toBeNull();
    expect(verifyPensionAccount({ ...account, status: 'UNKNOWN' })).toBeNull();
    expect(verifyPensionAccount(null)).toBeNull();
  });
  it('distinguishes verified empty receipts from invalid/unavailable results', () => {
    expect(verifyPensionContributions([])).toEqual([]);
    expect(verifyPensionPayouts([])).toEqual([]);
    expect(verifyPensionContributions(null)).toBeNull();
    expect(verifyPensionPayouts({ items: [] })).toBeNull();
    expect(verifyPensionContributions([contribution, contribution])).toBeNull();
    expect(verifyPensionPayouts([payout, { ...payout, id: second, created_at: 'not-a-date' }])).toBeNull();
    expect(verifyPensionPayouts([{ ...payout, created_at: '2026-02-30T00:00:00Z' }])).toBeNull();
    expect(verifyPensionContributions([{ ...contribution, amount_wld: -10 }])).toBeNull();
    expect(verifyPensionPayouts([{ ...payout, snapshot_accumulated_wld: '-5' }])).toBeNull();
    expect(verifyPensionPayouts(Array.from({ length: 21 }, (_, i) => ({ ...payout, id: uuid + i })))).toBeNull();
  });
});
