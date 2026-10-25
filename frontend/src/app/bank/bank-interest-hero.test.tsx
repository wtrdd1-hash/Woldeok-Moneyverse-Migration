// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { TossBankHeroCard } from './toss-bank-hero-card';

vi.mock('./actions', () => ({
  claimInterestAction: vi.fn(), depositAction: vi.fn(), withdrawAction: vi.fn(),
}));
vi.mock('@/lib/audio-effects', () => ({
  playCoinCollectSound: vi.fn(), playStockTickSound: vi.fn(),
}));
const props = {
  bankBalance: '9007199254740993',
  cashBalance: '100',
  unclaimedInterest: '0',
  dailyRatePct: 0.1,
  annualYieldPct: 40,
};

describe('bank interest hero authoritative WLD display', () => {
  afterEach(cleanup);

  it('does not fabricate accrued WLD or enable a claim when the server reports zero', () => {
    render(<TossBankHeroCard {...props} />);
    expect(screen.getByRole('button', { name: /지금 이자 받기/ }).hasAttribute('disabled')).toBe(true);
    expect(screen.getByText(/서버에서 확인한 정산 대기 이자/)).toBeTruthy();
    expect(screen.getByText(/9,007,199,254,740,993/)).toBeTruthy();
    expect(screen.queryByText(/실시간으로 쌓이는 이자/)).toBeNull();
  });

  it('enables the action only for a positive exact server interest snapshot', () => {
    render(<TossBankHeroCard {...props} unclaimedInterest="9007199254740993" />);
    expect(screen.getByRole('button', { name: /지금 이자 받기/ }).hasAttribute('disabled')).toBe(false);
    expect(screen.getAllByText(/9,007,199,254,740,993/)).toHaveLength(2);
  });

  it('keeps preset controls at least 44px tall for touch input', () => {
    const { container } = render(<TossBankHeroCard {...props} />);
    expect(container.querySelectorAll('button.h-9')).toHaveLength(0);
  });
});
