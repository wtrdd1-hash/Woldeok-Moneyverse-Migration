// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { PensionPortalClient, PENSION_LEDGER_SETTLEMENT_PAUSED } from './pension-portal-client';

afterEach(() => cleanup());

describe('legacy pension account actions follow the backend hold (QA 2026-11-25)', () => {
  it('pauses legacy account writes, says so honestly and points to the certified panel', () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(async () => {
      return new Response(JSON.stringify({ success: true, account: {} }), { status: 200 });
    });

    render(
      <PensionPortalClient
        overview={{
          totalAumWld: '10000',
          totalSubscribersCount: 1,
          totalRetiredReceiversCount: 1,
          totalPensionPaidWld: '45',
          benchmarkAnnualPayoutRate: '8.0%',
          vaultMainBalanceWld: '100000',
        }}
        myAccount={{
          id: 'fake-acc',
          user_id: 'fake-user',
          tier: 'TIER_1_YOUTH',
          status: 'RETIRED_RECEIVING',
          accumulated_contribution_wld: '10000',
          total_contributions_count: 1,
          hourly_payout_rate_bps: 8,
          total_payout_received_wld: '45',
          created_at: '2026-01-01',
          updated_at: '2026-01-01',
        }}
        contributions={[]}
        payouts={[]}
        userCashBalance="10000"
        isLoggedIn
      />,
    );

    expect(PENSION_LEDGER_SETTLEMENT_PAUSED).toBe(true);
    expect(document.body.textContent).not.toMatch(/검증이 완료|실시간 가동|정상 운영 중/);
    expect(document.body.textContent).toMatch(/정식 원장 납입·환급/);
    expect((screen.getByRole('button', { name: /국민연금 기여금 즉시 납입/ }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole('button', { name: /연금 수령 일시정지/ }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole('button', { name: /중도 해지/ }) as HTMLButtonElement).disabled).toBe(true);

    fetchSpy.mockRestore();
  });
});
