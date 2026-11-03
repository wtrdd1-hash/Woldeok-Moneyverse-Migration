// @vitest-environment jsdom
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { NationalMintPanel } from './national-mint-panel';

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
describe('v1652 Mint console real persisted status, no fabricated issuance', () => {
  it('displays zero DB certificate records as normal observed state, without legacy in-memory claims', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true, json: async () => ({
        source: 'persistent_monetary_policy',
        is_issuance_frozen: false, verified_invariant: false,
        active_policy_orders_count: 0, total_mint_certificates_count: 0,
        total_retirement_certificates_count: 0,
      }),
    }));
    render(<NationalMintPanel />);
    expect(await screen.findByText('정식 발행 증명서 기록')).toBeTruthy();
    expect(screen.getByText('정책 DB 조회 완료')).toBeTruthy();
    expect(screen.queryByText(/UNVERIFIED \/ 발행·폐기 요청 불가/)).toBeNull();
    expect(screen.queryByText(/500,000,000/)).toBeNull();
  });
  it('exposes real source failure and never presents it as zero mint or approval', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503 }));
    render(<NationalMintPanel />);
    expect(await screen.findByRole('alert')).toBeTruthy();
    expect(screen.queryByText('정식 발행 증명서 기록')).toBeNull();
  });
  it('shows an actual frozen monetary policy as an alert, without enabling unsupported mint writes', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true, json: async () => ({
        source: 'persistent_monetary_policy',
        is_issuance_frozen: true, verified_invariant: false,
        active_policy_orders_count: 0, total_mint_certificates_count: 0,
        total_retirement_certificates_count: 0,
      }),
    }));
    render(<NationalMintPanel />);
    expect(await screen.findByText('발행 동결')).toBeTruthy();
    expect(screen.queryByRole('button', { name: /즉시 발행|즉시 소각/ })).toBeNull();
  });
});
