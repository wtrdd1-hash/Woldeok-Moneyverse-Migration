import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RepaymentPreviewCard } from './repayment-preview-card';
import type { RepaymentPreview } from './types';

const base: RepaymentPreview = {
  loanId: 'a0000000-0000-4000-8000-000000000001',
  requestedAmount: '90071992547409931234567890',
  effectiveAmount: '90071992547409931234567890',
  cashBalance: '90071992547409931234567890',
  outstandingAmount: '90071992547409931234567891',
  remainingCash: '0',
  remainingDebt: '1',
  canRepay: true,
  reason: 'READY',
  previewOnly: true,
  revalidateAtExecution: true,
};

describe('loan repayment preview card', () => {
  it('renders exact large WLD values and warns that no transaction occurred', () => {
    render(<RepaymentPreviewCard preview={base} />);
    expect(screen.getAllByText('90,071,992,547,409,931,234,567,890 WLD')).toHaveLength(3);
    expect(screen.getByText(/미리보기는 WLD를 이동시키지 않습니다/)).toBeDefined();
    expect(screen.getByRole('link', { name: /실제 상환하기/ }).getAttribute('href')).toBe('/bank');
  });

  it('does not fabricate projected balances when cash is insufficient', () => {
    render(<RepaymentPreviewCard preview={{
      ...base, canRepay: false, reason: 'INSUFFICIENT_CASH',
      remainingCash: null, remainingDebt: null,
    }} />);
    expect(screen.getByRole('status').textContent).toContain('잔액이 부족');
    expect(screen.queryByText('상환 후 예상 현금')).toBeNull();
  });

  it('discloses SQL capped payment rather than claiming the requested overpayment', () => {
    render(<RepaymentPreviewCard preview={{
      ...base, requestedAmount: '500', effectiveAmount: '100',
      cashBalance: '200', outstandingAmount: '100', remainingCash: '100', remainingDebt: '0',
      reason: 'CAPPED_TO_OUTSTANDING',
    }} />);
    expect(screen.getByRole('status').textContent).toContain('제한됩니다');
    expect(screen.getByText('500 WLD')).toBeDefined();
    expect(screen.getAllByText('100 WLD').length).toBeGreaterThan(0);
  });
});
