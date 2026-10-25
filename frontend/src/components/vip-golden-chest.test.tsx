import { describe, expect, it, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { VipGoldenChestCard } from './vip-golden-chest-card';

describe('VipGoldenChestCard - verified reward boundary', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('disables the chest when the backend cannot verify an entitlement or ledger receipt', () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    render(<VipGoldenChestCard status={{
      available: false,
      entitlementVerified: false,
      ledgerReceiptVerified: false,
      reason: 'LEDGER_RECEIPT_UNAVAILABLE',
    }} />);
    expect(screen.getByRole('status').textContent).toMatch(/지급 기능.*중단/);
    expect(screen.queryByRole('button', { name: /황금 상자 열기/i })).toBeNull();
    expect(screen.queryByText(/수령 완료|입금되었습니다|럭키 다이스 x1/i)).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
    const walletLink = screen.getByRole('link', { name: /지갑 기록 확인/i });
    expect(walletLink.getAttribute('href')).toBe('/wallet');
    expect(walletLink.className).toMatch(/min-h-11|focus-visible/);
  });

  it('shows a distinct unknown state when the private status API is unavailable', () => {
    render(<VipGoldenChestCard status={null} />);
    expect(screen.getByRole('status').textContent).toMatch(/상태를 확인할 수 없습니다/);
    expect(screen.queryByRole('button')).toBeNull();
  });
});
