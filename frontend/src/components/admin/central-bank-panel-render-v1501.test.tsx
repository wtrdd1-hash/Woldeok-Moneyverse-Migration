import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { CentralBankPanel } from './central-bank-panel';

describe('v1501 central-bank preview disclosure', () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('shows backend data but never offers a fake official mint approval', async () => {
    const snapshot = {
      source: 'non_persistent_backend_preview',
      pendingBatches: [{ id: 'real', batchNumber: 'MINT-LIVE-BACKEND', amountWld: '100', mintReason: 'Requested' }],
      aggregates: { m0BaseMoneyWld: '100', m1NarrowMoneyWld: '180', m2BroadMoneyWld: '432', moneyMultiplier: '4.32' },
      policy: { ratePercent: '3.75' },
      reserve: { ratioPercent: '8.00' },
    };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => snapshot }));
    render(<CentralBankPanel />);

    expect(await screen.findByText('MINT-LIVE-BACKEND')).not.toBeNull();
    expect(screen.queryByText('MINT-202610-002')).toBeNull();
    expect(screen.getByText(/서버 메모리에 있는 임시 참고 데이터/)).not.toBeNull();
    expect(screen.getAllByRole('button').every((button) => button.hasAttribute('disabled'))).toBe(true);
  });

  it('does not silently fall back to synthetic monetary data on API failures', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503 }));
    render(<CentralBankPanel />);

    expect(await screen.findByRole('alert')).not.toBeNull();
    expect(screen.queryByText('548,750,000 WLD')).toBeNull();
  });
});
