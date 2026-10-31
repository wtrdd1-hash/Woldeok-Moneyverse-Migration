import { describe, expect, it, vi } from 'vitest';
import { loadPensionMemberEvidence, parsePensionOverview } from './pension-source';

const owner = '11111111-1111-4111-8111-111111111111';
const accountId = '22222222-2222-4222-8222-222222222222';
const receiptId = '33333333-3333-4333-8333-333333333333';
const account = {
  id: accountId, user_id: owner, tier: 'TIER_1_YOUTH', status: 'ACCUMULATING',
  accumulated_contribution_wld: '9007199254740993', total_contributions_count: 1,
  hourly_payout_rate_bps: 8, total_payout_received_wld: '0',
  created_at: '2026-10-01T00:00:00.000Z', updated_at: '2026-10-01T00:00:00.000Z',
};
const contribution = {
  id: receiptId, account_id: accountId, user_id: owner,
  amount_wld: '9007199254740993', note: 'Owner deposit',
  created_at: '2026-10-29T00:00:00.000Z',
};
const payout = {
  id: '44444444-4444-4444-8444-444444444444', account_id: accountId, user_id: owner,
  payout_amount_wld: '45', snapshot_accumulated_wld: '9007199254740993',
  created_at: '2026-10-30T00:00:00.000Z',
};
const wallet = (amount: unknown, userId = owner) => ({
  userId, balances: { currency: 'WLD', cash: { availableAmount: amount, updatedAt: '2026-10-30T00:00:00.000Z' }, bank: { availableAmount: '0', updatedAt: '2026-10-30T00:00:00.000Z' }, totalAvailableAmount: amount }, recentTransactions: [],
});
const paths = ['/api/v1/pension/my-account', '/api/v1/pension/my-contributions', '/api/v1/pension/my-payouts', '/api/v1/wallet?recent=1'];

describe('P1 pension member source evidence', () => {
  it('preserves owner receipts when the account and wallet endpoints fail', async () => {
    const read = vi.fn(async (path: string): Promise<unknown> => {
      if (path === paths[0] || path === paths[3]) throw new Error('503');
      if (path === paths[1]) return [contribution];
      if (path === paths[2]) return [payout];
      throw new Error('unexpected path');
    });
    const result = await loadPensionMemberEvidence(read);
    expect(read.mock.calls.map(([path]) => path)).toEqual(paths);
    expect(result.sourceEvidence).toEqual({ account: false, contributions: true, payouts: true, wallet: false });
    expect(result.account).toBeNull();
    expect(result.cashBalance).toBeNull();
    expect(result.isLoggedIn).toBe(true);
    expect(result.contributions).toEqual([{ id: receiptId, amount_wld: '9007199254740993', note: 'Owner deposit', created_at: contribution.created_at }]);
    expect(result.payouts).toEqual([{ id: payout.id, payout_amount_wld: '45', snapshot_accumulated_wld: '9007199254740993', created_at: payout.created_at }]);
  });

  it('distinguishes a verified empty receipt list from a failed receipt query', async () => {
    const result = await loadPensionMemberEvidence(async (path) => {
      if (path === paths[0]) return account;
      if (path === paths[1]) return [];
      if (path === paths[2]) throw new Error('502');
      return wallet('0');
    });
    expect(result.sourceEvidence).toEqual({ account: true, contributions: true, payouts: false, wallet: true });
    expect(result.contributions).toEqual([]);
    expect(result.payouts).toEqual([]);
    expect(result.cashBalance).toBe('0');
  });

  it.each([
    [[contribution, contribution], 'duplicate receipt'],
    [[{ ...contribution, amount_wld: '1.5' }], 'fractional WLD'],
    [[{ ...contribution, user_id: '55555555-5555-4555-8555-555555555555' }], 'cross-owner receipt'],
    [[{ ...contribution, created_at: '2026-02-30T00:00:00Z' }], 'nonexistent timestamp'],
  ])('refuses %s without erasing an independently valid payout list (%s)', async (bad) => {
    const result = await loadPensionMemberEvidence(async (path) => {
      if (path === paths[0]) return account;
      if (path === paths[1]) return bad;
      if (path === paths[2]) return [payout];
      return wallet('9007199254740993');
    });
    expect(result.sourceEvidence.contributions).toBe(false);
    expect(result.contributions).toEqual([]);
    expect(result.sourceEvidence.payouts).toBe(true);
    expect(result.cashBalance).toBe('9007199254740993');
  });

  it('rejects mismatched owners across independent receipt lists when account evidence is unavailable', async () => {
    const result = await loadPensionMemberEvidence(async (path) => {
      if (path === paths[0] || path === paths[3]) throw new Error('503');
      if (path === paths[1]) return [contribution];
      if (path === paths[2]) return [{ ...payout, user_id: '55555555-5555-4555-8555-555555555555' }];
      throw new Error('unexpected');
    });
    expect(result.sourceEvidence.contributions).toBe(false);
    expect(result.sourceEvidence.payouts).toBe(false);
  });

  it('rejects malformed account and wallet amounts instead of displaying zero', async () => {
    const result = await loadPensionMemberEvidence(async (path) => {
      if (path === paths[0]) return { ...account, accumulated_contribution_wld: '9e20' };
      if (path === paths[1] || path === paths[2]) return [];
      return wallet(Number('9007199254740993'));
    });
    expect(result.sourceEvidence.account).toBe(false);
    expect(result.sourceEvidence.wallet).toBe(false);
    expect(result.cashBalance).toBeNull();
  });

  it('rejects a wallet with a different authenticated owner even when its amount is valid', async () => {
    const result = await loadPensionMemberEvidence(async (path) => {
      if (path === paths[0]) return account;
      if (path === paths[1]) return [contribution];
      if (path === paths[2]) return [payout];
      return wallet('45', '55555555-5555-4555-8555-555555555555');
    });
    expect(result.sourceEvidence.account).toBe(false);
    expect(result.sourceEvidence.contributions).toBe(false);
    expect(result.sourceEvidence.payouts).toBe(false);
  });

  it('does not authenticate a caller when all member endpoints reject', async () => {
    const result = await loadPensionMemberEvidence(async () => { throw new Error('401'); });
    expect(result.isLoggedIn).toBe(false);
    expect(Object.values(result.sourceEvidence)).toEqual([false, false, false, false]);
  });

  it('refuses an invalid public overview instead of rendering invented totals', () => {
    expect(parsePensionOverview({ totalAumWld: '1.2', totalSubscribersCount: 1 })).toBeNull();
    expect(parsePensionOverview({
      totalAumWld: '0', totalSubscribersCount: 0, totalRetiredReceiversCount: 0,
      totalPensionPaidWld: '0', vaultMainBalanceWld: '0',
      benchmarkAnnualPayoutRate: null, annualPayoutRateCertified: false,
    })).toMatchObject({ totalAumWld: '0', totalSubscribersCount: 0 });
  });
});
