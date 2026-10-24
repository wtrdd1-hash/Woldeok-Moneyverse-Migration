import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { MiniShowdownModal } from './mini-showdown-modal';

const playRound = vi.fn();
vi.mock('@/app/arcade/showdown-actions', () => ({ playMiniShowdownRound: (...args: unknown[]) => playRound(...args) }));

describe('P0 mini-showdown practice truth', () => {
  afterEach(() => { cleanup(); vi.clearAllMocks(); });

  it('shows practice-only disclosure and never advertises WLD payout', () => {
    render(<MiniShowdownModal isOpen onClose={() => {}} />);
    expect(screen.getByText(/연습 전용/)).toBeDefined();
    expect(screen.queryByText(/190 WLD/)).toBeNull();
    expect(screen.queryByText(/배당: 1.90x/)).toBeNull();
  });

  it('does not invent a dice result or claim money on API failure', async () => {
    playRound.mockResolvedValue(null);
    render(<MiniShowdownModal isOpen onClose={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: '주사위 굴리기' }));
    await waitFor(() => expect(screen.getByRole('alert')).toBeDefined());
    expect(screen.getByText(/ROUND 1/)).toBeDefined();
    expect(screen.queryByText(/WLD 획득/)).toBeNull();
  });

  it('uses server-returned dice for the next round and never calls with client outcome', async () => {
    playRound.mockResolvedValue({ success: true, mode: 'PRACTICE_ONLY', playerRoll: [6], aiRoll: [1], outcome: 'win', stake: '0', payout: '0', resolvedAt: new Date().toISOString() });
    render(<MiniShowdownModal isOpen onClose={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: '주사위 굴리기' }));
    await waitFor(() => expect(screen.getByText(/ROUND 2/)).toBeDefined());
    expect(playRound).toHaveBeenCalledWith();
    expect(screen.queryByText(/WLD 획득/)).toBeNull();
  });
});
