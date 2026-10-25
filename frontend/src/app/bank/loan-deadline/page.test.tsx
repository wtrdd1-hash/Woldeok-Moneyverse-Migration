import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

const { apiOrNull, requireMember } = vi.hoisted(() => ({apiOrNull: vi.fn(), requireMember: vi.fn()}));
vi.mock('@/lib/api', () => ({apiOrNull}));
vi.mock('@/lib/session', () => ({requireMember}));
vi.mock('@/lib/locale-server', () => ({getServerLocale: async () => 'ko'}));
vi.mock('@/components/amount', () => ({Amount: ({value}: {value: string}) => <span>{value} WLD</span>}));

import LoanDeadlinePage, {metadata, dynamic} from './page';

const snapshot = {
  hasActiveLoan: true, quoteOnly: true, observedAt: '2026-10-25T00:00:00Z',
  loanId: '77a071a6-a75e-4bcb-ac7e-10ae50aa86ef', loanStatus: 'active',
  maturityAt: '2026-10-26T00:00:00Z', dueState: 'due_soon',
  daysUntilDue: 1, overdueDays: null,
  outstandingAmount: '90071992547409931234567890',
  minimumRepayment: '200', cashBalance: '100', canCoverMinimum: false,
};

describe('member-only loan deadline readiness page', () => {
  beforeEach(() => {vi.clearAllMocks(); apiOrNull.mockResolvedValue(snapshot);});
  it('is dynamic and noindex', () => {
    expect(dynamic).toBe('force-dynamic');
    expect(metadata.robots).toMatchObject({index: false, follow: false});
  });
  it('reads authenticated API, shows due soon and cash shortfall without fake success', async () => {
    render(await LoanDeadlinePage());
    expect(requireMember).toHaveBeenCalledOnce();
    expect(apiOrNull).toHaveBeenCalledWith('/api/v1/banking/loan-deadline');
    expect(screen.getByText(/7일 이내 만기/)).toBeTruthy();
    expect(screen.getByText(/최소 상환액을 충당할 현금이 부족/)).toBeTruthy();
    expect(screen.getByText(/실제 상환이나 알림 예약이 실행되지 않습니다/)).toBeTruthy();
    expect(screen.queryByText(/상환 완료/)).toBeNull();
  });
  it('shows explicit unavailable status on null or malformed server response', async () => {
    apiOrNull.mockResolvedValue(null);
    render(await LoanDeadlinePage());
    expect(screen.getByText(/확인할 수 없습니다/)).toBeTruthy();
  });
  it('distinguishes no active loan from a failed API', async () => {
    apiOrNull.mockResolvedValue({hasActiveLoan: false, quoteOnly: true, observedAt: '2026-10-25T00:00:00Z'});
    render(await LoanDeadlinePage());
    expect(screen.getByText(/상환 중인 대출이 없습니다/)).toBeTruthy();
  });
  it('shows overdue status without fabricating a due-soon claim', async () => {
    apiOrNull.mockResolvedValue({...snapshot, dueState: 'overdue', daysUntilDue: null, overdueDays: 4});
    render(await LoanDeadlinePage());
    expect(screen.getByText(/만기 경과/)).toBeTruthy();
    expect(screen.queryByText(/7일 이내 만기/)).toBeNull();
  });
});
