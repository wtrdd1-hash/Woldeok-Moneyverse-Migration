// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { apiOrNull } from '@/lib/api';
import { requireMember } from '@/lib/session';
import CasinoHistorySummaryPage, { metadata } from './page';

vi.mock('@/lib/api', () => ({ apiOrNull: vi.fn() }));
vi.mock('@/lib/session', () => ({ requireMember: vi.fn() }));
afterEach(() => { cleanup(); vi.clearAllMocks(); });

describe('private casino play summary page', () => {
  it('requires the member and never indexes the page', async () => {
    vi.mocked(apiOrNull).mockResolvedValue(null);
    render(await CasinoHistorySummaryPage());
    expect(requireMember).toHaveBeenCalledOnce();
    expect(metadata.robots).toEqual({ index: false, follow: false });
    expect(screen.getByText('게임 기록을 불러올 수 없어요.')).toBeTruthy();
    expect(screen.queryByText('0 WLD')).toBeNull();
  });

  it('shows exact signed last-20 sample and a verified transaction identifier', async () => {
    vi.mocked(apiOrNull).mockResolvedValue({
      scope: 'last_20_recorded_plays', sampleLimit: 20, playCount: 1,
      totalStakeWld: '900719925474099312345', netWld: '-900719925474099312345',
      winCount: 0, lossCount: 1, evenCount: 0,
      plays: [{ play_id: 'p1', transaction_id: 'tx1', game: 'coin',
        choice: 'heads', outcome: 'tails', stake_amount: '900719925474099312345',
        net_amount: '-900719925474099312345', played_at: '2026-10-25T00:00:00.000Z' }],
    });
    render(await CasinoHistorySummaryPage());
    expect(screen.getByText(/최근 최대 20판 기준/)).toBeTruthy();
    expect(screen.getAllByText(/900,719,925,474,099,312,345/).length).toBeGreaterThan(0);
    expect(screen.getByText(/tx1/)).toBeTruthy();
    expect(screen.getByText(/전체 기간 통계가 아닙니다/)).toBeTruthy();
  });

  it('distinguishes a real empty sample from a failed read', async () => {
    vi.mocked(apiOrNull).mockResolvedValue({
      scope: 'last_20_recorded_plays', sampleLimit: 20, playCount: 0,
      totalStakeWld: '0', netWld: '0', winCount: 0, lossCount: 0, evenCount: 0, plays: [],
    });
    render(await CasinoHistorySummaryPage());
    expect(screen.getByText('기록된 게임이 없어요.')).toBeTruthy();
    expect(screen.queryByText('게임 기록을 불러올 수 없어요.')).toBeNull();
  });
});
