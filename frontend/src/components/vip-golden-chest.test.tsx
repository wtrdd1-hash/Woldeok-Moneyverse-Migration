import { describe, expect, it, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { VipGoldenChestCard } from './vip-golden-chest-card';

describe('VipGoldenChestCard', () => {
  afterEach(cleanup);

  it('shows an explicit unavailable state without promising WLD or dice', () => {
    render(<VipGoldenChestCard status={{ available: false, isPlusUser: null, claimedToday: null, rewardAmount: '0', diceAwarded: 0 }} />);
    expect(screen.getByText('Moneyverse Plus 전용 일일 VIP 황금 상자')).toBeTruthy();
    expect(screen.getByRole('status').textContent).toContain('준비 중');
    expect(screen.queryByText(/수령 완료|2,000 WLD/)).toBeNull();
    expect(screen.queryByRole('button', { name: /황금 상자 열기/i })).toBeNull();
  });

  it('does not trust a future status alone as a committed reward receipt', () => {
    render(<VipGoldenChestCard status={{ available: true, isPlusUser: true, claimedToday: false, rewardAmount: '2000', diceAwarded: 1 }} />);
    expect(screen.queryByRole('button', { name: /황금 상자 열기/i })).toBeNull();
    expect(screen.queryByText(/수령 완료/)).toBeNull();
  });
});
