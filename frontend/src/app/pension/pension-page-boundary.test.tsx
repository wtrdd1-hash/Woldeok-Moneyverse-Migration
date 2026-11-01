import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ api: vi.fn(), publicApi: vi.fn() }));
vi.mock('@/lib/api', () => ({
  api: mocks.api,
  publicApi: mocks.publicApi,
  ApiError: class ApiError extends Error {
    constructor(public readonly status: number) { super('API error'); }
  },
}));

import PublicPensionPage from './page';
import { ApiError } from '@/lib/api';

const uuid = '123e4567-e89b-42d3-a456-426614174000';
const user = '123e4567-e89b-42d3-a456-426614174001';
const account = {
  id: uuid, user_id: user, tier: 'TIER_1_YOUTH', status: 'ACCUMULATING',
  accumulated_contribution_wld: '500', total_contributions_count: 1,
  hourly_payout_rate_bps: 8, total_payout_received_wld: '0',
  created_at: '2026-10-01T00:00:00Z', updated_at: '2026-10-01T00:00:00Z',
};
function propsOf(element: Awaited<ReturnType<typeof PublicPensionPage>>) {
  return (element.props as { children: { props: Record<string, unknown> } }).children.props;
}
beforeEach(() => { mocks.api.mockReset(); mocks.publicApi.mockReset(); mocks.publicApi.mockResolvedValue(null); });

describe('P1 Next pension owner source integration', () => {
  it('distinguishes a 503 account outage from a logged-out visitor', async () => {
    mocks.api.mockRejectedValue(new ApiError(503));
    const props = propsOf(await PublicPensionPage());
    expect(props.memberStatus).toBe('unavailable');
    expect(props.myAccount).toBeNull();
    expect(props.contributions).toBeNull();
    expect(props.payouts).toBeNull();
    expect(props.walletVerified).toBe(false);
  });
  it('treats an authenticated 401 as guest rather than fabricated account data', async () => {
    mocks.api.mockRejectedValue(new ApiError(401));
    expect(propsOf(await PublicPensionPage()).memberStatus).toBe('guest');
  });
  it('retains verified empty receipts and exact WLD from the real API contract', async () => {
    mocks.api.mockImplementation(async (path: string) => {
      if (path.endsWith('/my-account')) return account;
      if (path.endsWith('/my-contributions') || path.endsWith('/my-payouts')) return [];
      if (path.endsWith('/wallet')) return { balances: { currency: 'WLD', totalAvailableAmount: '9007199254740993' } };
      throw Error('unexpected route');
    });
    const props = propsOf(await PublicPensionPage());
    expect(props.memberStatus).toBe('verified');
    expect(props.contributions).toEqual([]);
    expect(props.payouts).toEqual([]);
    expect(props.userCashBalance).toBe('9007199254740993');
    expect(props.walletVerified).toBe(true);
  });
  it('rejects another owner receipt and a malformed wallet without fabricating empty or zero', async () => {
    mocks.api.mockImplementation(async (path: string) => {
      if (path.endsWith('/my-account')) return account;
      if (path.endsWith('/my-contributions')) return [{
        id: uuid, user_id: '123e4567-e89b-42d3-a456-426614174099', account_id: uuid,
        amount_wld: '10', note: 'wrong owner', created_at: '2026-10-01T00:00:00Z',
      }];
      if (path.endsWith('/my-payouts')) throw new ApiError(503);
      if (path.endsWith('/wallet')) return { balances: { currency: 'USD', totalAvailableAmount: '100' } };
      throw Error('unexpected route');
    });
    const props = propsOf(await PublicPensionPage());
    expect(props.memberStatus).toBe('verified');
    expect(props.contributions).toBeNull();
    expect(props.payouts).toBeNull();
    expect(props.walletVerified).toBe(false);
  });
});
