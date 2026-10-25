import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { DailyAttendanceRoulette } from './daily-attendance-roulette';

afterEach(() => vi.unstubAllGlobals());

describe('tools attendance status', () => {
  it('never renders a fictitious 100 million WLD jackpot or an unverified claim button', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ signedIn: true, checkedInToday: true, streakDays: 2, lastAttendedDate: '2026-10-25', nextRewardPreview: 30, isJackpotEligible: false }) }));
    render(<DailyAttendanceRoulette />);
    await waitFor(() => expect(screen.getByText(/2일 연속 출석/)).toBeTruthy());
    expect(screen.queryByText(/1억 WLD/)).toBeNull();
    expect(screen.queryByText(/지갑에 즉시 적립/)).toBeNull();
    expect(screen.queryByRole('button', { name: /보상 받기|룰렛 돌리기/ })).toBeNull();
  });

  it('displays an explicit unavailable state rather than a default streak on HTTP 503', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503 }));
    render(<DailyAttendanceRoulette />);
    await waitFor(() => expect(screen.getByRole('alert')).toBeTruthy());
    expect(screen.queryByText(/3일차 달성/)).toBeNull();
  });
});
