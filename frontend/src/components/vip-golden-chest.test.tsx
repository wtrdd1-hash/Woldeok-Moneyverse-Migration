import { describe, expect, it, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { VipGoldenChestCard } from './vip-golden-chest-card';

describe('VipGoldenChestCard', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('renders VIP Golden Chest banner and reward elements for Plus users', () => {
    render(<VipGoldenChestCard isPlusUser={true} initialClaimed={false} />);

    expect(screen.getByText('VIP PLUS EXCLUSIVE')).toBeTruthy();
    expect(screen.getByText('Moneyverse Plus 전용 일일 VIP 황금 상자')).toBeTruthy();
    expect(screen.getByText('+2,000 WLD')).toBeTruthy();
    expect(screen.getByText('럭키 다이스 x1')).toBeTruthy();
    expect(screen.getByRole('button', { name: /황금 상자 열기/i })).toBeTruthy();
  });

  it('renders Upgrade button for non-Plus users', () => {
    render(<VipGoldenChestCard isPlusUser={false} initialClaimed={false} />);

    expect(screen.getByText(/Plus 멤버십 업그레이드/i)).toBeTruthy();
    expect(screen.queryByRole('button', { name: /황금 상자 열기/i })).toBeNull();
  });

  it('handles claim button click with reward animation feedback', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, rewardAmount: 2000, diceAwarded: 1 }),
    });

    render(<VipGoldenChestCard isPlusUser={true} initialClaimed={false} />);

    const claimBtn = screen.getByRole('button', { name: /황금 상자 열기/i });
    fireEvent.click(claimBtn);

    await waitFor(() => {
      expect(screen.getByText(/오늘 보상 수령 완료/i)).toBeTruthy();
    });
  });
});
