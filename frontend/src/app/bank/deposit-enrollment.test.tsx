// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { DepositWithdrawCard } from './bank-forms';

vi.mock('@/components/locale-provider', () => ({ useLocale: () => ({ locale: 'ko', setLocale: () => {} }) }));
vi.mock('./actions', () => ({
  depositAction: vi.fn(), withdrawAction: vi.fn(), claimInterestAction: vi.fn(),
  borrowAction: vi.fn(), repayAction: vi.fn(), purchaseBondAction: vi.fn(), redeemBondAction: vi.fn(),
}));

describe('ledger-backed deposit enrollment form', () => {
  afterEach(cleanup);
  it('provides the real signup form target and submits through the bank action', () => {
    const { container } = render(
      <DepositWithdrawCard cashBalance="0" bankBalance="0" dailyRatePct={0.1} />,
    );
    expect(container.querySelector('#bank-real-deposit')).not.toBeNull();
    expect(screen.getByRole('button', { name: /실제 WLD 예금 가입·입금하기/ })).toBeTruthy();
    expect(screen.getAllByText('0')).toHaveLength(2);
  });
});
