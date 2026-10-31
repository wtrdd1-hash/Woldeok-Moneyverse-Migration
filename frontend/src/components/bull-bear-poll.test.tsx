import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import React from 'react';
import { BullBearPoll } from './bull-bear-poll';
import { voteBullBear } from '@/lib/dopamine-api';

vi.mock('@/lib/dopamine-api', () => ({ voteBullBear: vi.fn() }));

describe('BullBearPoll source-of-truth hold', () => {
  afterEach(() => { cleanup(); vi.clearAllMocks(); });

  it('does not show invented votes, jackpot amounts, or participation controls', () => {
    render(<BullBearPoll symbol="CHIPS" stockName="침팬지 반도체" />);
    expect(screen.getByText(/침팬지 반도체/)).toBeDefined();
    expect(screen.getByRole('status').textContent).toMatch(/검증된 투표 기록이 없어/);
    expect(screen.queryByText(/10,000 WLD/)).toBeNull();
    expect(screen.queryByText(/142/)).toBeNull();
    expect(screen.queryByRole('button', { name: /투표/ })).toBeNull();
    expect(voteBullBear).not.toHaveBeenCalled();
  });

  it('never treats caller-provided counts as verified vote evidence', () => {
    render(<BullBearPoll symbol="CHIPS" initialBullCount={100} initialBearCount={200} />);
    expect(screen.queryByText(/100표|200표|33%|67%/)).toBeNull();
    expect(screen.getByRole('status').textContent).toMatch(/이용할 수 없습니다/);
  });
});
