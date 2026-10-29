import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { CentralBankPanel } from './central-bank-panel';

describe('v1503 central-bank real policy controls', () => {
  afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
  it('shows measured partial ledger and enables actual policy controls without fake mint', async () => {
    const snapshot = {
      source: 'ledger_partial_and_persistent_policy',
      monetary: {
        m_total: '100', m_circulating: '40', m_treasury: '60',
        m_bank_liquidity: null, m_locked: null, verified_invariant: false,
        active_policy_orders_count: 1, total_mint_certificates_count: 0,
        is_issuance_frozen: false,
      },
      policy: { source: 'persistent_monetary_policy', ratePercent: '3.75', targetInflationPercent: '2.00' },
      reserve: { source: 'persistent_monetary_policy', ratioPercent: '7.00' },
    };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => snapshot }));
    render(<CentralBankPanel />);
    expect(await screen.findByText('국가 기준금리')).not.toBeNull();
    expect(screen.getByText(/기록된 실제 화폐 발행 증명서/)).not.toBeNull();
    expect(screen.getByRole('button', { name: '기준금리 정책 저장' }).hasAttribute('disabled')).toBe(false);
    expect(screen.getByRole('button', { name: '지급준비율 정책 저장' }).hasAttribute('disabled')).toBe(false);
    expect(screen.queryByText('MINT-202610-002')).toBeNull();
  });
  it('does not invent monetary values if ledger API fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503 }));
    render(<CentralBankPanel />);
    expect(await screen.findByRole('alert')).not.toBeNull();
    expect(screen.queryByText('548,750,000 WLD')).toBeNull();
  });
});
