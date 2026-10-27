// @vitest-environment jsdom
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { PensionControlTower } from './pension-control-tower';

const overview = {
  totalAumWld: '9007199254740993',
  totalSubscribersCount: 1,
  totalRetiredReceiversCount: 0,
  totalPensionPaidWld: '0',
  benchmarkAnnualPayoutRate: '8.0%',
  vaultMainBalanceWld: '25000000',
};
const payout = {
  id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  account_id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  user_id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
  payout_amount_wld: '9007199254740993',
  snapshot_accumulated_wld: '9007199254740999',
  created_at: '2026-10-27T00:00:00.000Z',
};
afterEach(() => vi.unstubAllGlobals());

describe('admin pension evidence and payout hold', () => {
  it('shows unavailable data rather than invented zeros or a 25M vault', () => {
    render(<PensionControlTower initialOverview={null} initialPayoutLogs={null} />);
    expect(screen.getByRole('alert').textContent).toContain('연금 관제 데이터를 확인할 수 없습니다');
    expect(screen.getByText(/지급 내역을 확인할 수 없습니다/)).toBeTruthy();
    expect(screen.queryByText(/25,000,000/)).toBeNull();
  });
  it('keeps uncertified manual payouts disabled and preserves exact large WLD', () => {
    render(<PensionControlTower initialOverview={overview} initialPayoutLogs={[payout]} />);
    expect((screen.getByRole('button', { name: /기초연금 즉시 일괄 지급/ }) as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getAllByText(/9,007,199,254,740,993/).length).toBeGreaterThan(0);
    expect(screen.queryByText(/기금 100% 국가 재정 지급 보증/)).toBeNull();
  });
  it('refreshes both authenticated overview and payout logs with no-store', async () => {
    const nextOverview = { ...overview, totalAumWld: '12345' };
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => nextOverview })
      .mockResolvedValueOnce({ ok: true, json: async () => [payout] });
    vi.stubGlobal('fetch', fetchMock);
    render(<PensionControlTower initialOverview={null} initialPayoutLogs={null} />);
    fireEvent.click(screen.getByRole('button', { name: /새로고침/ }));
    await waitFor(() => expect(screen.queryByRole('alert')).toBeNull());
    expect(screen.getByText(/12,345/)).toBeTruthy();
    expect(screen.getAllByText(/9,007,199,254,740,993/).length).toBeGreaterThan(0);
    expect(fetchMock).toHaveBeenCalledWith('/api/admin/pension/overview', { cache: 'no-store' });
    expect(fetchMock).toHaveBeenCalledWith('/api/admin/pension/recent-payouts', { cache: 'no-store' });
  });
  it('rejects a 200 response with invalid monetary evidence', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ...overview, totalAumWld: 'NaN' }) })
      .mockResolvedValueOnce({ ok: true, json: async () => [] }));
    render(<PensionControlTower initialOverview={overview} initialPayoutLogs={[]} />);
    fireEvent.click(screen.getByRole('button', { name: /새로고침/ }));
    await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('연금 관제 데이터를 확인할 수 없습니다'));
    expect(screen.queryByText(/9,007,199,254,740,993/)).toBeNull();
  });
  it('invalidates stale data when authenticated refresh fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    render(<PensionControlTower initialOverview={overview} initialPayoutLogs={[payout]} />);
    fireEvent.click(screen.getByRole('button', { name: /새로고침/ }));
    await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('연금 관제 데이터를 확인할 수 없습니다'));
    expect(screen.getByText(/지급 내역을 확인할 수 없습니다/)).toBeTruthy();
  });
});
