// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MegaJackpotLotteryDashboard } from './mega-jackpot-lottery-dashboard';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('lottery public read-only card', () => {
  it('shows only server-verified rounds and no fake purchase action', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
      rounds: [{
        roundNumber: 1,
        status: 'OPEN',
        ticketPriceWld: '1000',
        jackpotPoolWld: '900719925474099300000',
        totalTicketsSold: 0,
        drawsAt: '2026-11-01T00:00:00.000Z',
        settledAt: null,
        winningNumbers: null,
      }],
    }), { status: 200 })));
    render(<MegaJackpotLotteryDashboard />);
    expect(await screen.findByText('제 1회')).toBeTruthy();
    expect(screen.getByText(/900,719,925,474,099,300,000 WLD/)).toBeTruthy();
    expect(screen.queryByText(/구매 완료/)).toBeNull();
    expect(screen.queryByRole('button', { name: /구매/ })).toBeNull();
    expect(screen.queryByText(/제 42회/)).toBeNull();
  });

  it('does not pretend an empty history when the server fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 503 })));
    render(<MegaJackpotLotteryDashboard />);
    expect(await screen.findByRole('alert')).toBeTruthy();
    expect(screen.queryByText(/공개 복권 회차가 없습니다/)).toBeNull();
  });
});
