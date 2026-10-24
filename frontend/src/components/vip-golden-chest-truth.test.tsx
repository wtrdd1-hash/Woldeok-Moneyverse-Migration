import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { VipGoldenChestCard } from './vip-golden-chest-card';

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe('VIP chest availability truth', () => {
  it('shows unavailable status rather than a fabricated reward claim when the server is not ready', () => {
    render(<VipGoldenChestCard status={{ available: false, isPlusUser: null, claimedToday: null, rewardAmount: '0', diceAwarded: 0 }} />);
    expect(screen.getByText(/현재.*지급.*불가|현재.*이용.*불가|준비 중/)).toBeTruthy();
    expect(screen.queryByRole('button', { name: /황금 상자 열기/ })).toBeNull();
    expect(screen.queryByText(/수령 완료/)).toBeNull();
  });

  it('fails closed on missing status and never makes a client-side grant request', () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    render(<VipGoldenChestCard status={null} />);
    expect(screen.queryByRole('button', { name: /황금 상자 열기/ })).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
