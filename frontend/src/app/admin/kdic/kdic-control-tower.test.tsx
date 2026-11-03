// @vitest-environment jsdom
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { KdicControlTower } from './kdic-control-tower';
import { fixture } from './kdic-fixture';

afterEach(() => vi.unstubAllGlobals());
describe('KDIC admin truthful observation and unsafe action hold', () => {
  it('shows an alert, no invented 10M WLD or 40% and blocks fund writes when unavailable', () => {
    render(<KdicControlTower initialData={null} />);
    expect(screen.getByRole('alert').textContent).toContain('조회 결과를 확인할 수 없습니다');
    expect(screen.queryByText(/10,000,000/)).toBeNull();
    expect(screen.queryByText(/40.0%/)).toBeNull();
    expect((screen.getByRole('button', { name: /예보료.*징수/ }) as HTMLButtonElement).disabled).toBe(true);
  });
  it('holds financial writes even when observations are valid pending the DB security gate', () => {
    render(<KdicControlTower initialData={fixture.data} />);
    expect((screen.getByRole('button', { name: /예보료.*징수/ }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole('button', { name: /긴급 유동성.*대여/ }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole('button', { name: /대위변제금.*환급/ }) as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getAllByRole('status').map((node) => node.textContent).join(' ')).toContain('서버에서도 집행 요청을 HTTP 503으로 차단');
  });
  it('exposes real ledger counters to admins but does not unlock financial execution', () => {
    render(<KdicControlTower initialData={fixture.data} initialLedger={{
      checkedAt: new Date().toISOString(), transactionCount: '891',
      postingCount: '1829', accountCount: '40', unbalancedTransactionCount: '0',
      mismatchedAccountCount: '0', absoluteDifferenceWld: '0',
      unlinkedTreasuryCount: '552', treasuryRecordCount: '552',
      numericBalanced: true, state: 'BLOCKED', settlementReady: false,
      blockers: ['KDIC_WRITERS_UNVERIFIED', 'TREASURY_ROWS_WITHOUT_CANONICAL_LINK'],
    }} />);
    expect(screen.getByRole('region', { name: 'KDIC 원장 검증' }).textContent).toContain('552 / 552건');
    expect(screen.getByRole('region', { name: 'KDIC 원장 검증' }).textContent).toContain('금융 집행 승인 아님');
    expect((screen.getByRole('button', { name: /예보료.*징수/ }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('discards pre-reset ledger evidence rather than displaying old 552 Treasury mismatches', () => {
    render(<KdicControlTower initialData={fixture.data} initialLedger={{
      checkedAt: '2026-11-02T14:13:15.000Z',
      transactionCount: '891', postingCount: '1829', accountCount: '42',
      unbalancedTransactionCount: '0', mismatchedAccountCount: '0',
      absoluteDifferenceWld: '0', unlinkedTreasuryCount: '552',
      treasuryRecordCount: '552', numericBalanced: true, state: 'BLOCKED',
      settlementReady: false, blockers: ['KDIC_WRITERS_UNVERIFIED', 'TREASURY_ROWS_WITHOUT_CANONICAL_LINK'],
    }} />);
    const region = screen.getByRole('region', { name: 'KDIC 원장 검증' });
    expect(region.textContent).toContain('실시간 원장 증거를 확인하지 못했습니다');
    expect(region.textContent).not.toContain('552 / 552건');
  });

  it('does not flash a false source outage while refresh is still pending', () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})));
    render(<KdicControlTower initialData={fixture.data} />);
    fireEvent.click(screen.getByRole('button', { name: /새로고침/ }));
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.getAllByText(/검증 자료 조회 중/).length).toBeGreaterThan(0);
  });
  it('keeps verified fund and institutions visible when only the separate ledger diagnostics fail', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url: string) => ({
      ok: url === '/api/admin/kdic/overview',
      status: url === '/api/admin/kdic/overview' ? 200 : 503,
      json: async () => fixture,
    })));
    render(<KdicControlTower initialData={null} initialLedger={null} />);
    fireEvent.click(screen.getByRole('button', { name: /새로고침/ }));
    await waitFor(() => expect(screen.queryByRole('alert')).toBeNull());
    expect(screen.getAllByText(/10,000,000/).length).toBeGreaterThan(0);
    expect(screen.getByRole('region', { name: 'KDIC 원장 검증' }).textContent).toContain('실시간 원장 증거를 확인하지 못했습니다');
    expect((screen.getByRole('button', { name: /예보료.*징수/ }) as HTMLButtonElement).disabled).toBe(true);
  });
  it('keeps fresh verified ledger diagnostic when only fund overview fails', async () => {
    const proof = {
      success: true,
      data: {
        checkedAt: new Date().toISOString(),
        transactionCount: '891', postingCount: '1829', accountCount: '42',
        unbalancedTransactionCount: '0', mismatchedAccountCount: '0',
        absoluteDifferenceWld: '0', unlinkedTreasuryCount: '0', treasuryRecordCount: '0',
        numericBalanced: true, settlementReady: false, state: 'BLOCKED',
        blockers: ['KDIC_WRITERS_UNVERIFIED'],
      },
    };
    vi.stubGlobal('fetch', vi.fn(async (url: string) => ({
      ok: url === '/api/admin/kdic/ledger-integrity',
      status: url === '/api/admin/kdic/ledger-integrity' ? 200 : 503,
      json: async () => proof,
    })));
    render(<KdicControlTower initialData={fixture.data} initialLedger={null} />);
    fireEvent.click(screen.getByRole('button', { name: /새로고침/ }));
    await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('KDIC 조회 결과를 확인할 수 없습니다'));
    expect(screen.getByRole('region', { name: 'KDIC 원장 검증' }).textContent).toContain('891건');
  });
  it('refreshes via same-origin authenticated Next endpoint and discards stale observations on failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503 }));
    render(<KdicControlTower initialData={fixture.data} />);
    fireEvent.click(screen.getByRole('button', { name: /새로고침/ }));
    await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('조회 결과를 확인할 수 없습니다'));
    expect(vi.mocked(fetch)).toHaveBeenCalledWith('/api/admin/kdic/overview', { cache: 'no-store' });
    expect(screen.queryByText(/10,000,000/)).toBeNull();
  });
});
