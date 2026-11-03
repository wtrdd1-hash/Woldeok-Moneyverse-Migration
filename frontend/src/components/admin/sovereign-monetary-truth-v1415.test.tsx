import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { CentralBankPanel } from './central-bank-panel';
import { NationalMintPanel } from './national-mint-panel';

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
describe('v1415 admin sovereign finance truth', () => {
  it('central bank explains unavailable verified monetary aggregates rather than showing invented ones', () => {
    render(<CentralBankPanel />);
    expect(screen.getByText(/통화정책 DB 및 확인된 원장 지표/)).toBeDefined();
    expect(screen.queryByText(/548,750,000/)).toBeNull();
    expect(screen.queryByText(/987,750,000/)).toBeNull();
    expect(screen.queryByRole('button', { name: /공식 인수 및 국고 방출 승인/ })).toBeNull();
  });
  it('mint bureau reads real policy database rather than claiming demo batches were minted', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true, json: async () => ({
        source: 'persistent_monetary_policy',
        is_issuance_frozen: false, verified_invariant: false,
        active_policy_orders_count: 0, total_mint_certificates_count: 0,
        total_retirement_certificates_count: 0,
      }),
    }));
    render(<NationalMintPanel />);
    expect(await screen.findByText('정책 DB 조회 완료')).toBeDefined();
    expect(screen.queryByText(/550,000,000/)).toBeNull();
    expect(screen.queryByText(/MINT-202610-001/)).toBeNull();
    expect(screen.queryByRole('button', { name: /M0 주조 신청/ })).toBeNull();
  });
});
