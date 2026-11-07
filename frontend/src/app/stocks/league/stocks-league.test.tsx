// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { StocksLeagueClient } from './stocks-league-client';

const uuid = (tail: string) => `12345678-1234-4234-8234-${tail}`;
const season = { id: uuid('000000000001'), status: 'active', title: 'Autumn season', startsAt: '2026-10-01T00:00:00.000Z', endsAt: '2026-11-01T00:00:00.000Z' };
const whale = { id: uuid('000000000002'), seasonId: season.id, userId: uuid('000000000003'), userName: 'Verified trader', initialAsset: 100000, currentAsset: 125000, roiRate: 25, rankPosition: 1, tier: 'Gold', isWhale: true, followerCount: 5, createdAt: '2026-10-12T00:00:00.000Z' };

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe('stock league source-truth UI', () => {
  it('shows verified source-backed leaderboard and disables unledgered copy trading', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true, season, whales: [whale], leaderboard: [] }) }));
    render(<StocksLeagueClient />);
    expect(await screen.findByText('Verified trader')).toBeTruthy();
    expect(screen.getByText(/카피 트레이딩은 현재 이용할 수 없습니다/)).toBeTruthy();
    expect(screen.queryByRole('button', { name: /카피 트레이딩 시작/ })).toBeNull();
    expect(screen.queryByText('여의도_헤지펀드_마스터')).toBeNull();
  });
  it('never replaces upstream failure with fabricated whales or a fake subscription', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    render(<StocksLeagueClient />);
    expect(await screen.findByRole('alert')).toBeTruthy();
    expect(screen.getByRole('button', { name: /다시 조회/ })).toBeTruthy();
    expect(screen.queryByText('184.2%')).toBeNull();
  });
  it('distinguishes verified empty season from a failed request', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true, season: null, whales: [], leaderboard: [] }) }));
    render(<StocksLeagueClient />);
    await waitFor(() => expect(screen.getByText(/진행 중인 리그가 없습니다/)).toBeTruthy());
    expect(screen.queryByRole('alert')).toBeNull();
  });
});
