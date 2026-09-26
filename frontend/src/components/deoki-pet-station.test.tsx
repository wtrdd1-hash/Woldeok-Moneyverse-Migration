import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import React from 'react';
import { DeokiPetStation } from './deoki-pet-station';

vi.mock('@/lib/dopamine-api', () => ({
  claimPetFortune: vi.fn().mockResolvedValue({ success: true, rewardAmount: 500 }),
}));

describe('DeokiPetStation Component', () => {
  afterEach(() => {
    cleanup();
  });

  it('increases affection points when petting duck', () => {
    render(<DeokiPetStation initialAffection={20} />);

    expect(screen.getByText(/20 pts/)).toBeDefined();

    const petBox = screen.getByRole('button', { name: '덕이 펫 쓰다듬기' });
    fireEvent.click(petBox);

    expect(screen.getByText(/22 pts/)).toBeDefined();
  });

  it('cracks fortune cookie and claims bonus WLD', async () => {
    const onClaimFortuneMock = vi.fn();
    render(<DeokiPetStation onClaimFortune={onClaimFortuneMock} />);

    const cookieButton = screen.getByRole('button', { name: '포춘쿠키 쪼개기' });
    fireEvent.click(cookieButton);

    await waitFor(() => {
      expect(onClaimFortuneMock).toHaveBeenCalledTimes(1);
      expect(screen.getByText(/WLD 즉시 지급!/)).toBeDefined();
    });
  });
});
