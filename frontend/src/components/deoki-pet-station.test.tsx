import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import React from 'react';
import { DeokiPetStation } from './deoki-pet-station';
import { claimPetFortune, type PetFortuneResult } from '@/lib/dopamine-api';

vi.mock('@/lib/dopamine-api', () => ({ claimPetFortune: vi.fn() }));

const serverQuote = '오늘은 배운 내용을 다시 복습해 보세요.';
const informationalReceipt: PetFortuneResult = {
  userId: '11111111-2222-4333-8444-555555555555',
  success: true, action: 'fortune', quote: serverQuote, rewardAmount: 0,
  rewardCredited: false, simulationOnly: true, affinityGained: 0,
  servedAt: '2026-10-24T00:00:00.000Z',
};

describe('DeokiPetStation verified fortune', () => {
  beforeEach(() => {
    vi.mocked(claimPetFortune).mockReset().mockResolvedValue(informationalReceipt);
  });
  afterEach(cleanup);

  it('shows pet affection as local-only and supports keyboard Enter and Space', () => {
    render(<DeokiPetStation initialAffection={20} />);
    const petBox = screen.getByRole('button', { name: '덕이 펫 쓰다듬기' });
    fireEvent.keyDown(petBox, { key: 'Enter' });
    fireEvent.keyDown(petBox, { key: ' ' });
    expect(screen.getByText(/24 pts/)).toBeDefined();
    expect(screen.getByText(/기기 내 표시|화면 내 표시/)).toBeDefined();
    expect(claimPetFortune).not.toHaveBeenCalled();
  });

  it('displays only the authenticated server quote, never a fabricated WLD payout', async () => {
    const onFortune = vi.fn();
    render(<DeokiPetStation onClaimFortune={onFortune} />);
    fireEvent.click(screen.getByRole('button', { name: '포춘쿠키 쪼개기' }));
    await waitFor(() => expect(screen.getByText(serverQuote, { exact: false })).toBeDefined());
    expect(onFortune).toHaveBeenCalledWith(serverQuote);
    expect(screen.queryByText(/WLD 즉시 지급|500 WLD|1,000 WLD/)).toBeNull();
    expect(screen.getAllByText(/WLD.*지급되지|WLD.*없/).length).toBeGreaterThan(0);
  });

  it('keeps retry enabled on API failure and does not emit a success callback', async () => {
    vi.mocked(claimPetFortune).mockResolvedValueOnce(null);
    const onFortune = vi.fn();
    render(<DeokiPetStation onClaimFortune={onFortune} />);
    const button = screen.getByRole('button', { name: '포춘쿠키 쪼개기' });
    fireEvent.click(button);
    await waitFor(() => expect(screen.getByRole('alert')).toBeDefined());
    expect(button.hasAttribute('disabled')).toBe(false);
    expect(onFortune).not.toHaveBeenCalled();
    expect(screen.queryByText(/WLD 즉시 지급/)).toBeNull();
  });

  it('rejects a legacy API that claims WLD without a ledger receipt', async () => {
    vi.mocked(claimPetFortune).mockResolvedValueOnce({ ...informationalReceipt, rewardAmount: 800 as 0, rewardCredited: true as false });
    const onFortune = vi.fn();
    render(<DeokiPetStation onClaimFortune={onFortune} />);
    fireEvent.click(screen.getByRole('button', { name: '포춘쿠키 쪼개기' }));
    await waitFor(() => expect(screen.getByRole('alert')).toBeDefined());
    expect(onFortune).not.toHaveBeenCalled();
  });

  it('submits only one request during repeated rapid clicks', async () => {
    let finish!: (value: Awaited<ReturnType<typeof claimPetFortune>>) => void;
    const pending = new Promise<Awaited<ReturnType<typeof claimPetFortune>>>((resolve) => { finish = resolve; });
    vi.mocked(claimPetFortune).mockReturnValueOnce(pending);
    render(<DeokiPetStation />);
    const button = screen.getByRole('button', { name: '포춘쿠키 쪼개기' });
    fireEvent.click(button);
    fireEvent.click(button);
    expect(claimPetFortune).toHaveBeenCalledTimes(1);
    finish(informationalReceipt);
    await waitFor(() => expect(screen.getByRole('status')).toBeDefined());
  });

  it('rejects malformed quote response rather than showing local fake fallback', async () => {
    vi.mocked(claimPetFortune).mockResolvedValueOnce({ ...informationalReceipt, quote: '' });
    render(<DeokiPetStation />);
    fireEvent.click(screen.getByRole('button', { name: '포춘쿠키 쪼개기' }));
    await waitFor(() => expect(screen.getByRole('alert')).toBeDefined());
    expect(screen.queryByText(/WLD 즉시 지급/)).toBeNull();
  });
});
