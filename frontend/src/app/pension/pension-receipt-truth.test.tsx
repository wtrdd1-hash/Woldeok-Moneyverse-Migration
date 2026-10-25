// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { PensionPortalClient } from './pension-portal-client';

afterEach(() => cleanup());
const overview = { totalAumWld: '0', totalSubscribersCount: 0, totalRetiredReceiversCount: 0, totalPensionPaidWld: '45', benchmarkAnnualPayoutRate: '8.0%', vaultMainBalanceWld: '0' };
const account = { id:'a1', user_id:'u1', tier:'TIER_1_YOUTH', status:'ACCUMULATING', accumulated_contribution_wld:'10000', total_contributions_count:1, hourly_payout_rate_bps:8, total_payout_received_wld:'45', created_at:'2026-10-01', updated_at:'2026-10-01' };

describe('pension receipt truth', () => {
  it('labels legacy payout rows and aggregate as unverified, not as received ledger money', () => {
    render(<PensionPortalClient overview={overview} myAccount={account} contributions={[]} payouts={[{ id:'p1', payout_amount_wld:'45', snapshot_accumulated_wld:'10000', created_at:'2026-10-15', ledgerVerification:'UNVERIFIED_LEDGER', ledgerTransactionId:null }]} userCashBalance="10000" isLoggedIn />);
    expect(screen.getAllByText(/기록상 누적 지급액/).length).toBeGreaterThan(0);
    fireEvent.keyDown(screen.getByRole('tab', { name: /기초연금 지급 기록/ }), { key: 'Enter', code: 'Enter' });
    expect(screen.getAllByText(/원장 미검증/).length).toBeGreaterThan(0);
    expect(screen.getByText(/지급 확정 아님/)).toBeTruthy();
    expect(screen.queryByText('누적 수령 총액')).toBeNull();
  });

  it('distinguishes failed history retrieval from a confirmed empty history', () => {
    render(<PensionPortalClient overview={overview} myAccount={account} contributions={[]} payouts={[]} userCashBalance="10000" isLoggedIn payoutHistoryUnavailable />);
    fireEvent.keyDown(screen.getByRole('tab', { name: /기초연금 지급 기록/ }), { key: 'Enter', code: 'Enter' });
    expect(screen.getAllByRole('alert').some((node) => node.textContent?.includes('수령 기록을 불러오지 못했습니다'))).toBe(true);
    expect(screen.queryByText('아직 기초연금 수령 내역이 없습니다.')).toBeNull();
  });
});
