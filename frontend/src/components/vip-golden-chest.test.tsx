import { describe, expect, it, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { VipGoldenChestCard } from './vip-golden-chest-card';

const disabled = {
  available: false, isPlusUser: null, claimedToday: null,
  rewardAmount: '0', diceAwarded: 0, nextAvailableAt: null,
  reason: 'unverified_entitlement_and_ledger_receipt',
} as const;

describe('VIP Golden Chest verified reward truth', () => {
  afterEach(() => { cleanup(); vi.restoreAllMocks(); });

  it('displays an accessible disabled state instead of offering unverified money', () => {
    render(<VipGoldenChestCard status={disabled} />);
    expect(screen.getByRole('status').textContent).toMatch(/지급.*중단|이용.*불가/);
    expect(screen.queryByRole('button', { name: /황금 상자 열기/i })).toBeNull();
    expect(screen.queryByText(/수령 완료/i)).toBeNull();
    expect(screen.queryByRole('link', { name: /멤버십 업그레이드/i })).toBeNull();
  });

  it('does not call the browser API or pretend success when the server cannot verify a receipt', () => {
    const fetcher = vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'));
    render(<VipGoldenChestCard status={null} />);
    expect(screen.getByRole('status').textContent).toMatch(/확인.*불가|이용.*불가/);
    expect(fetcher).not.toHaveBeenCalled();
  });
});
