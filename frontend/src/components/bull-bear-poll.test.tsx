import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import React from 'react';
import { BullBearPoll } from './bull-bear-poll';

vi.mock('@/lib/dopamine-api', () => ({
  voteBullBear: vi.fn().mockResolvedValue({ success: true, poolEligible: true }),
}));

describe('BullBearPoll Component', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders poll and calculates percentages properly', () => {
    render(
      <BullBearPoll
        symbol="CHIPS"
        stockName="침팬지 반도체"
        initialBullCount={100}
        initialBearCount={100}
      />
    );

    expect(screen.getByText(/침팬지 반도체/)).toBeDefined();
    expect(screen.getByText(/상승 \(Bull\) 50%/)).toBeDefined();
    expect(screen.getByText(/하락 \(Bear\) 50%/)).toBeDefined();
  });

  it('handles user vote and increments selected option', async () => {
    const onVoteMock = vi.fn();
    render(
      <BullBearPoll
        symbol="CHIPS"
        initialBullCount={100}
        initialBearCount={100}
        onVote={onVoteMock}
      />
    );

    const bullBtn = screen.getByRole('button', { name: '상승 투표 떡상 가자' });
    fireEvent.click(bullBtn);

    await waitFor(() => {
      expect(onVoteMock).toHaveBeenCalledWith('bull');
      expect(screen.getByText(/101표/)).toBeDefined();
    });
  });
});
