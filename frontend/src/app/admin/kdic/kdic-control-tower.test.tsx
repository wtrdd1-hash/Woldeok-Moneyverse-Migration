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
      checkedAt: '2026-10-30T01:00:00.000Z', transactionCount: '891',
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

  it('refreshes via same-origin authenticated Next endpoint and discards stale observations on failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503 }));
    render(<KdicControlTower initialData={fixture.data} />);
    fireEvent.click(screen.getByRole('button', { name: /새로고침/ }));
    await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('조회 결과를 확인할 수 없습니다'));
    expect(vi.mocked(fetch)).toHaveBeenCalledWith('/api/admin/kdic/overview', { cache: 'no-store' });
    expect(screen.queryByText(/10,000,000/)).toBeNull();
  });
});
