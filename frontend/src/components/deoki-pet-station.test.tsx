import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import React from 'react';
import { DeokiPetStation } from './deoki-pet-station';
import { claimPetFortune } from '@/lib/dopamine-api';

vi.mock('@/lib/dopamine-api', () => ({
  claimPetFortune: vi.fn().mockResolvedValue({ success: true, rewardAmount: 500 }),
}));

describe('DeokiPetStation Component', () => {
  afterEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it('increases local practice affection without claiming a server reward', () => {
    render(<DeokiPetStation initialAffection={20} />);

    expect(screen.getByText(/20 pts/)).toBeDefined();

    const petBox = screen.getByRole('button', { name: '덕이 펫 쓰다듬기' });
    fireEvent.click(petBox);

    expect(screen.getByText(/22 pts/)).toBeDefined();
    expect(claimPetFortune).not.toHaveBeenCalled();
  });

  it('cracks a practice-only fortune without fabricating a WLD payout', async () => {
    render(<DeokiPetStation />);

    const cookieButton = screen.getByRole('button', { name: '포춘쿠키 쪼개기' });
    fireEvent.click(cookieButton);

    await waitFor(() => {
      expect(screen.getByText(/연습용 점괘/)).toBeDefined();
      expect(screen.queryByText(/WLD 즉시 지급!/)).toBeNull();
      expect(claimPetFortune).not.toHaveBeenCalled();
    });
  });
});
