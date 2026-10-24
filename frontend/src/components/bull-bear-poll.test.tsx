import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { BullBearPoll } from './bull-bear-poll';

const { voteBullBear } = vi.hoisted(() => ({ voteBullBear: vi.fn() }));
vi.mock('@/lib/dopamine-api', () => ({ voteBullBear }));

describe('BullBearPoll authoritative receipt boundary', () => {
  afterEach(() => {
    cleanup();
    voteBullBear.mockReset();
  });

  it('does not show fabricated counts, percentages, or jackpot eligibility', () => {
    render(<BullBearPoll symbol="CHIPS" stockName="침팬지 반도체" />);
    expect(screen.getByText(/침팬지 반도체/)).toBeDefined();
    expect(screen.queryByText(/142표|88표|230명/)).toBeNull();
    expect(screen.queryByText(/10,000 WLD/)).toBeNull();
    expect(screen.getByRole('status').textContent).toMatch(/준비|중단|unavailable/i);
  });

  it('ignores unverified caller-provided counts and prevents client-only success', () => {
    const onVote = vi.fn();
    render(
      <BullBearPoll
        symbol="CHIPS"
        initialBullCount={100}
        initialBearCount={100}
        onVote={onVote}
      />,
    );
    expect(screen.queryByText(/100표|50%|200명/)).toBeNull();
    const bullButton = screen.getByRole('button', { name: /상승 투표/ });
    const bearButton = screen.getByRole('button', { name: /하락 투표/ });
    expect(bullButton.hasAttribute('disabled')).toBe(true);
    expect(bearButton.hasAttribute('disabled')).toBe(true);
    fireEvent.click(bullButton);
    expect(voteBullBear).not.toHaveBeenCalled();
    expect(onVote).not.toHaveBeenCalled();
  });
});
