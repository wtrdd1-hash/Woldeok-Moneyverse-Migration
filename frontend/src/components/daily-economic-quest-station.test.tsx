import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { DailyEconomicQuestStation } from './daily-economic-quest-station';
import { fetchDailyQuestStatusAction, claimDailyQuestAction } from '@/app/actions/daily-quest';

vi.mock('@/app/actions/daily-quest', () => ({
  fetchDailyQuestStatusAction: vi.fn(),
  claimDailyQuestAction: vi.fn(),
}));

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.clearAllMocks();
});

describe('verified daily quest status', () => {
  it('ignores forged local reward totals and displays only server-confirmed receipts', async () => {
    localStorage.setItem(`mv_daily_quests_${new Date().toISOString().split('T')[0]}`,
      JSON.stringify({ completed: { quest_stock_analysis: true }, claimed: { quest_stock_analysis: true }, totalEarned: 9999999, allClearClaimed: true }));
    vi.mocked(fetchDailyQuestStatusAction).mockResolvedValue({
      claimedQuests: { quest_savings_deposit: true }, allClearClaimed: false, totalEarnedToday: 1000,
    });
    render(<DailyEconomicQuestStation />);
    await waitFor(() => expect(screen.getByText(/1,000 WLD 획득/)).toBeDefined());
    expect(screen.queryByText(/9,999,999 WLD/)).toBeNull();
    expect(screen.queryByText(/3일 연속 스트릭/)).toBeNull();
    expect(screen.queryByRole('button', { name: /보상 받기|황금 상자 열기/ })).toBeNull();
    expect(claimDailyQuestAction).not.toHaveBeenCalled();
  });

  it('fails closed when the authoritative status is unavailable', async () => {
    vi.mocked(fetchDailyQuestStatusAction).mockResolvedValue(null);
    render(<DailyEconomicQuestStation />);
    await waitFor(() => expect(screen.getByRole('status').textContent).toMatch(/확인할 수 없|조회할 수 없/));
    expect(screen.queryByText(/3일 연속 스트릭/)).toBeNull();
    expect(screen.queryByRole('button', { name: /보상 받기|황금 상자 열기/ })).toBeNull();
  });
});
