import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act, cleanup, waitFor } from '@testing-library/react';
import React from 'react';
import { GoldenDuckFever } from './golden-duck-fever';
import * as dopamineActions from '@/app/actions/dopamine';

// Mock dopamine server actions
vi.mock('@/app/actions/dopamine', () => ({
  claimGoldenDuckAction: vi.fn(),
}));

describe('GoldenDuckFever Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('renders modal with timer and interactive elements when isOpen is true', () => {
    render(<GoldenDuckFever isOpen={true} />);

    expect(screen.getByText(/황금 오리 광클 피버 타임/)).toBeDefined();
    expect(screen.getByText(/10초 남음/)).toBeDefined();
    expect(screen.getByRole('button', { name: /피버 코인 광클하기/ })).toBeDefined();
  });

  it('increments taps, combo and earned WLD on coin click', () => {
    render(<GoldenDuckFever isOpen={true} />);

    const coinButton = screen.getByRole('button', { name: /피버 코인 광클하기/ });

    // 1st click
    act(() => {
      fireEvent.pointerDown(coinButton);
    });

    expect(screen.getByText(/콤보/)).toBeDefined();
    expect(screen.getByText('+25')).toBeDefined();

    // 2nd click
    act(() => {
      fireEvent.pointerDown(coinButton);
    });

    expect(screen.getByText('+50')).toBeDefined();
  });

  it('transitions to finished screen when 10 seconds elapse', () => {
    render(<GoldenDuckFever isOpen={true} />);

    // Fast-forward 10 seconds step by step
    for (let i = 0; i < 11; i++) {
      act(() => {
        vi.advanceTimersByTime(1000);
      });
    }

    expect(screen.getByText(/🎉 피버 타임 종료!/)).toBeDefined();
    expect(screen.getByRole('button', { name: /지갑에 WLD 보상 수령하기/ })).toBeDefined();
  });

  it('calls claimGoldenDuckAction and displays success feedback upon claim', async () => {
    vi.mocked(dopamineActions.claimGoldenDuckAction).mockResolvedValue({
      success: true,
      rewardAmount: 1250,
      newBalance: '15000',
      message: '1,250 WLD가 지갑에 성공적으로 입금되었습니다!',
    });

    const onClaimReward = vi.fn();
    render(<GoldenDuckFever isOpen={true} onClaimReward={onClaimReward} />);

    const coinButton = screen.getByRole('button', { name: /피버 코인 광클하기/ });
    act(() => {
      fireEvent.pointerDown(coinButton);
      fireEvent.pointerDown(coinButton);
    });

    // Finish 10s
    for (let i = 0; i < 11; i++) {
      act(() => {
        vi.advanceTimersByTime(1000);
      });
    }
    vi.useRealTimers();

    const claimButton = screen.getByRole('button', { name: /지갑에 WLD 보상 수령하기/ });
    await act(async () => {
      fireEvent.click(claimButton);
    });

    await waitFor(() => {
      expect(dopamineActions.claimGoldenDuckAction).toHaveBeenCalled();
      expect(screen.getByText(/1,250 WLD가 지갑에 성공적으로 입금되었습니다!/)).toBeDefined();
    });
    expect(onClaimReward).toHaveBeenCalledWith(1250, 2);
  });

  it('prompts user to log in if requiresLogin is returned from server action', async () => {
    vi.mocked(dopamineActions.claimGoldenDuckAction).mockResolvedValue({
      success: false,
      requiresLogin: true,
      message: '로그인 후 WLD 보상을 지갑에 수령할 수 있습니다.',
    });

    render(<GoldenDuckFever isOpen={true} />);

    for (let i = 0; i < 11; i++) {
      act(() => {
        vi.advanceTimersByTime(1000);
      });
    }
    vi.useRealTimers();

    const claimButton = screen.getByRole('button', { name: /지갑에 WLD 보상 수령하기/ });
    await act(async () => {
      fireEvent.click(claimButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/획득한 WLD를 지갑에 적립하려면 로그인이 필요합니다/)).toBeDefined();
      expect(screen.getByRole('link', { name: /로그인하고 WLD 수령하기/ })).toBeDefined();
    });
  });
});
