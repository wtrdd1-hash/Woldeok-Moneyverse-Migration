// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { PensionPortalClient } from './pension-portal-client';

afterEach(() => cleanup());

describe('P0 national pension unjournaled transfer user-truth', () => {
  it('shows an accessible suspension message and disables every financial mutation control', () => {
    const fetchSpy = vi.spyOn(globalThis,'fetch').mockImplementation(async () => { throw Error('Unexpected pension request'); });
    render(<PensionPortalClient
      overview={{
        totalAumWld:'10000',
        totalSubscribersCount:1,
        totalRetiredReceiversCount:1,
        totalPensionPaidWld:'45',
        benchmarkAnnualPayoutRate:'8.0%',
        vaultMainBalanceWld:'0',
      }}
      myAccount={{
        id:'fake-acc',user_id:'fake-user',tier:'TIER_1_YOUTH',
        status:'RETIRED_RECEIVING',accumulated_contribution_wld:'10000',
        total_contributions_count:1,hourly_payout_rate_bps:8,
        total_payout_received_wld:'45',created_at:'2026-01-01',updated_at:'2026-01-01',
      }}
      contributions={[]}
      payouts={[]}
      userCashBalance="10000"
      isLoggedIn
    />);
    expect(screen.getByRole('alert').textContent).toContain('원장 정산');
    expect((screen.getByRole('button',{name:/국민연금 기여금 즉시 납입/}) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole('button',{name:/연금 수령 일시정지/}) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole('button',{name:/중도 해지/}) as HTMLButtonElement).disabled).toBe(true);
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });
});
