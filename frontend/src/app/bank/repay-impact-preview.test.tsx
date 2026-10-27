// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { RepayImpactPreview } from './repay-impact-preview';

const previewMock = vi.hoisted(() => vi.fn());
vi.mock('./actions', () => ({ previewRepayAction: previewMock }));
const loanId = 'a0000000-0000-4000-8000-000000000001';

describe('member repayment impact preview', () => {
  afterEach(() => { cleanup(); vi.clearAllMocks(); });
  it('shows exact amount effects only after a member explicitly requests a read-only preview', async () => {
    previewMock.mockResolvedValueOnce({
      status: 'ok', preview: {
        loanId, requestedAmount: '900719925474099312345678', payableAmount: '100',
        cashBefore: '1000', cashAfter: '900', debtBefore: '100', debtAfter: '0',
        adjustmentAmount: '900719925474099312345578', eligible: true,
        reason: 'ready', observedAt: '2026-10-28T00:00:00.000Z', nonbinding: true,
      },
    });
    render(<RepayImpactPreview loanId={loanId} amount="900719925474099312345678" repayComplete={false} />);
    expect(screen.queryByText(/실제 차감 예상/)).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /상환 후 잔액 미리보기/ }));
    await waitFor(() => expect(screen.getByText(/실제 차감 예상/)).toBeTruthy());
    expect(screen.getByText(/초과 입력 조정/)).toBeTruthy();
    expect(screen.getByText(/읽기 전용 예상 결과/)).toBeTruthy();
  });

  it('hides a stale result when amount changes or repayment completes', async () => {
    previewMock.mockResolvedValueOnce({
      status: 'ok', preview: { loanId, requestedAmount: '10', payableAmount: '10',
        cashBefore: '100', cashAfter: '90', debtBefore: '20', debtAfter: '10',
        adjustmentAmount: '0', eligible: true, reason: 'ready', observedAt: '', nonbinding: true },
    });
    const view = render(<RepayImpactPreview loanId={loanId} amount="10" repayComplete={false} />);
    fireEvent.click(screen.getByRole('button', { name: /상환 후 잔액 미리보기/ }));
    await waitFor(() => expect(screen.getByText(/실제 차감 예상/)).toBeTruthy());
    view.rerender(<RepayImpactPreview loanId={loanId} amount="11" repayComplete={false} />);
    expect(screen.queryByText(/실제 차감 예상/)).toBeNull();
    view.rerender(<RepayImpactPreview loanId={loanId} amount="10" repayComplete={true} />);
    expect(screen.queryByText(/실제 차감 예상/)).toBeNull();
  });
});
