import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BankLiquidityCard } from './bank-liquidity-card';

describe('member banking scenario provenance', () => {
  it('does not fabricate 35% borrowing when the authenticated member has no loan', () => {
    render(<BankLiquidityCard bankBalance="1000000" loanDebt="0" creditLimit="5000000" />);
    expect(screen.getByText('0.0%')).toBeDefined();
    expect(screen.queryByText('35.0%')).toBeNull();
    expect(screen.getAllByText(/교육용.*모형/).length).toBeGreaterThan(0);
  });

  it('uses the exact member loan/deposit ratio without inventing platform-wide liquidity', () => {
    render(<BankLiquidityCard bankBalance="10000000" loanDebt="4000000" creditLimit="7000000" />);
    expect(screen.getByText('40.0%')).toBeDefined();
    expect(screen.getByText('신용 대출 한도')).toBeDefined();
    expect(screen.getByText(/7,000,000/)).toBeDefined();
    expect(screen.getAllByText(/예시 금리/).length).toBeGreaterThan(0);
    expect(screen.queryByText('20% 법정 지급준비금')).toBeNull();
    expect(screen.queryByText(/인출 100% 상시 보장/)).toBeNull();
  });

  it('does not present fictitious rates or reserves when the member has no deposit', () => {
    render(<BankLiquidityCard bankBalance="0" loanDebt="0" creditLimit="1000000" />);
    expect(screen.getByRole('status').textContent).toMatch(/예금 잔액이 없어.*모형/);
    expect(screen.queryByText('연 3.00%')).toBeNull();
    expect(screen.queryByText(/100%.*보장/)).toBeNull();
  });

  it('clearly disclaims that modeled rates and reserve buffers are not contractual guarantees', () => {
    render(<BankLiquidityCard bankBalance="10000000" loanDebt="4000000" creditLimit="7000000" isEn />);
    expect(screen.getAllByText(/educational model/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/not actual applied rates or guaranteed reserves/i)).toBeDefined();
  });
});
