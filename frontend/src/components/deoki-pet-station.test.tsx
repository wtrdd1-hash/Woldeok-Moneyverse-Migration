import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import React from 'react';
import { DeokiPetStation } from './deoki-pet-station';
import { fetchPetFortunePreview } from '@/lib/dopamine-api';

vi.mock('@/lib/dopamine-api', () => ({
  fetchPetFortunePreview: vi.fn().mockResolvedValue({ kind: 'preview', quote: 'Diversification is not a promise.', rewardPosted: false }),
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

  it('shows only a verified quote and never invents a WLD reward', async () => {
    const onPreview = vi.fn();
    render(<DeokiPetStation onPreviewFortune={onPreview} />);
    fireEvent.click(screen.getByRole('button', { name: '포춘쿠키 쪼개기' }));
    await waitFor(() => expect(onPreview).toHaveBeenCalledWith('Diversification is not a promise.'));
    expect(screen.getByText(/Diversification is not a promise/)).toBeDefined();
    expect(screen.queryByText(/WLD 즉시 지급/)).toBeNull();
  });

  it('does not mark a failed preview as claimed or notify a reward', async () => {
    vi.mocked(fetchPetFortunePreview).mockResolvedValueOnce(null);
    const onPreview = vi.fn();
    render(<DeokiPetStation onPreviewFortune={onPreview} />);
    fireEvent.click(screen.getByRole('button', { name: '포춘쿠키 쪼개기' }));
    await waitFor(() => expect(screen.getByRole('alert')).toBeDefined());
    expect(onPreview).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: '포춘쿠키 쪼개기' }).hasAttribute('disabled')).toBe(false);
  });
});
