// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import { PensionPortalClient } from './pension-portal-client';

afterEach(() => cleanup());

const verifiedAccount = {
  id: '123e4567-e89b-42d3-a456-426614174000',
  user_id: '123e4567-e89b-42d3-a456-426614174001',
  tier: 'TIER_1_YOUTH', status: 'ACCUMULATING',
  accumulated_contribution_wld: '0', total_contributions_count: 0,
  hourly_payout_rate_bps: 8, total_payout_received_wld: '0',
  created_at: '2026-10-01T00:00:00Z', updated_at: '2026-10-01T00:00:00Z',
};

describe('P1 member pension evidence states', () => {
  it('does not claim empty receipts when the owner-scoped source failed', () => {
    render(<PensionPortalClient overview={null} myAccount={null}
      contributions={null} payouts={null} userCashBalance="0"
      isLoggedIn={false} memberStatus="unavailable" walletVerified={false} />);
    expect(screen.getByText('연금 계좌 조회 불가')).toBeTruthy();
    expect(screen.getByText('지갑 잔액 조회 불가')).toBeTruthy();
    fireEvent.mouseDown(screen.getByRole('tab', { name: /내 기여금 납입 이력/ }), { button: 0, ctrlKey: false });
    expect(screen.getByText('기여금 내역 조회 불가')).toBeTruthy();
    expect(screen.queryByText('아직 기여금 납입 내역이 없습니다.')).toBeNull();
    fireEvent.mouseDown(screen.getByRole('tab', { name: /기초연금 수령 내역/ }), { button: 0, ctrlKey: false });
    expect(screen.getByText('수령 내역 조회 불가')).toBeTruthy();
    expect(screen.queryByText('아직 기초연금 수령 내역이 없습니다.')).toBeNull();
    expect(screen.getAllByRole('link', { name: '다시 조회하기' }).length).toBeGreaterThan(0);
  });
  it('keeps verified empty receipt histories separate from unavailable', () => {
    render(<PensionPortalClient overview={null} myAccount={verifiedAccount}
      contributions={[]} payouts={[]} userCashBalance="0"
      isLoggedIn memberStatus="verified" />);
    fireEvent.mouseDown(screen.getByRole('tab', { name: /내 기여금 납입 이력/ }), { button: 0, ctrlKey: false });
    expect(screen.getByText('아직 기여금 납입 내역이 없습니다.')).toBeTruthy();
    expect(screen.queryByText('기여금 내역 조회 불가')).toBeNull();
    fireEvent.mouseDown(screen.getByRole('tab', { name: /기초연금 수령 내역/ }), { button: 0, ctrlKey: false });
    expect(screen.getByText('아직 기초연금 수령 내역이 없습니다.')).toBeTruthy();
    expect(screen.queryByText('수령 내역 조회 불가')).toBeNull();
  });
});
