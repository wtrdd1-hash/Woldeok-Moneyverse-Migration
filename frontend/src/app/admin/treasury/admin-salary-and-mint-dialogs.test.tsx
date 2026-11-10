import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AdminSalaryDisburseDialog } from './admin-salary-disburse-dialog';
import { AdminMintTopupDialog } from './admin-mint-topup-dialog';

describe('AdminSalaryDisburseDialog & AdminMintTopupDialog', () => {
  it('renders admin salary disburse dialog trigger button properly', () => {
    render(<AdminSalaryDisburseDialog />);
    const button = screen.getByRole('button', { name: /관리자 임금 지급/i });
    expect(button).toBeDefined();
  });

  it('renders mint topup dialog trigger button properly', () => {
    render(<AdminMintTopupDialog />);
    const button = screen.getByRole('button', { name: /조폐국 화폐발행 국고 충전/i });
    expect(button).toBeDefined();
  });
});
