// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { PensionPortalClient } from './pension-portal-client';

afterEach(() => cleanup());

describe('v1514 pension overview evidence unavailable', () => {
  it('labels failed public overview reads as unavailable without invented zero balances', () => {
    render(<PensionPortalClient
      overview={null}
      myAccount={null} contributions={[]} payouts={[]}
      userCashBalance="0" isLoggedIn={false}
    />);
    expect(screen.getByRole('alert').textContent).toContain('원장 정산');
    expect(screen.getByText('연금 통계 조회 불가')).toBeTruthy();
    expect(screen.getAllByText('조회 불가')).toHaveLength(3);
    expect(document.body.textContent).not.toContain('25,000,000 WLD');
    // The separate unauthenticated wallet display is outside the failed overview.
    for (const label of ['총 기금 운용자산 (AUM)', '가입 국민 / 은퇴 수령자', '누적 지급 기초연금']) {
      expect(screen.getByText(label).parentElement?.textContent).toContain('조회 불가');
      expect(screen.getByText(label).parentElement?.textContent).not.toContain('0 WLD');
    }
  });
});
