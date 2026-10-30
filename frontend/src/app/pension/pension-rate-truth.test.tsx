// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { PensionPortalClient } from './pension-portal-client';

afterEach(() => cleanup());

describe('P1 NPS annual yield truth #1910', () => {
  it('does not present legacy backend 8% or tier 7% as funded annual promises', () => {
    render(<PensionPortalClient
      overview={{ totalAumWld: '50000', totalSubscribersCount: 1, totalRetiredReceiversCount: 1, totalPensionPaidWld: '0', benchmarkAnnualPayoutRate: '8.0%', vaultMainBalanceWld: '0' }}
      myAccount={null} contributions={[]} payouts={[]} userCashBalance="0" isLoggedIn={false}
    />);
    expect(screen.getByRole('alert').textContent).toContain('원장 정산');
    expect(document.body.textContent).toContain('연 지급률 미검증');
    expect(document.body.textContent).not.toContain('연 7~10%');
    expect(document.body.textContent).not.toContain('8.0%');
    expect(document.body.textContent).not.toContain('연 7.0%');
    expect(document.body.textContent).not.toContain('시간당 확정 수령액');
    expect(document.body.textContent).not.toContain('24시간 연속 입금');
  });
});
