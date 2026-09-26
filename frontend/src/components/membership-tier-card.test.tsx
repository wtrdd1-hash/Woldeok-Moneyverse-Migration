import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { MembershipTierCard } from './membership-tier-card';

describe('MembershipTierCard', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders Free Core and Moneyverse Plus tiers correctly', () => {
    render(<MembershipTierCard userBalance={50000} isPlusMember={false} />);

    expect(screen.getByText('Moneyverse Plus 멤버십 티어')).toBeDefined();
    expect(screen.getByText('Free Core')).toBeDefined();
    expect(screen.getByText('100% 광고 완전 제거 (Ad-Free)')).toBeDefined();
    expect(screen.getByText('프레스티지 환생 시 자산 30% 영구 보존')).toBeDefined();
  });

  it('shows error message when balance is insufficient to subscribe', async () => {
    render(<MembershipTierCard userBalance={5000} isPlusMember={false} />);

    const subscribeBtn = screen.getByRole('button', { name: 'Plus VIP 시작하기' });
    fireEvent.click(subscribeBtn);

    await waitFor(() => {
      expect(screen.getByText(/잔액이 부족합니다/)).toBeDefined();
    });
  });

  it('triggers onSubscribe callback when balance is sufficient', async () => {
    const handleSubscribe = vi.fn();
    render(<MembershipTierCard userBalance={50000} isPlusMember={false} onSubscribe={handleSubscribe} />);

    const subscribeBtn = screen.getByRole('button', { name: 'Plus VIP 시작하기' });
    fireEvent.click(subscribeBtn);

    await waitFor(() => {
      expect(handleSubscribe).toHaveBeenCalled();
      expect(screen.getByText(/Moneyverse Plus VIP 멤버십이 활성화되었습니다/)).toBeDefined();
    });
  });
});
