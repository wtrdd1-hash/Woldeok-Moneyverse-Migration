import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoanHistoryPanel } from './loan-history-panel';

const overdue = {
  loanId: '22222222-2222-4222-8222-222222222222',
  principalAmount: '90071992547409931234567890', interestAmount: '1',
  outstandingAmount: '90071992547409931234567891', status: 'overdue' as const,
  issuedAt: '2026-09-01T00:00:00Z', repaidAt: null,
};

describe('loan history member view', () => {
  it('shows server-verified overdue status and full WLD precision', () => {
    render(<LoanHistoryPanel loans={[overdue]} status="overdue" isEn={false} />);
    expect(screen.getByText('연체')).toBeDefined();
    expect(screen.getByText(/90,071,992,547,409,931,234,567,891/)).toBeDefined();
    expect(screen.getByRole('link', { name: '상환 완료' }).getAttribute('href')).toBe('/bank/loans?status=repaid');
  });

  it('distinguishes empty owner results from an unavailable backend', () => {
    const { rerender } = render(<LoanHistoryPanel loans={[]} status="active" isEn={true} />);
    expect(screen.getByText('No loans match this status.')).toBeDefined();
    rerender(<LoanHistoryPanel loans={null} status="all" isEn={true} />);
    expect(screen.getByText('Loan history is unavailable.')).toBeDefined();
  });
});
