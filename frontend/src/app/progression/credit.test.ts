import { describe, expect, it } from 'vitest';
import type { CreditLoan } from './credit';
import { gradeLabel, hasOverdueLoan, isRepayable, loanStanding, urgentFirst } from './credit';

function loan(status: string, issuedAt: string): CreditLoan {
  return {
    loan_id: `${status}-${issuedAt}`,
    principal_amount: '1000',
    interest_amount: '50',
    outstanding_amount: '1050',
    status,
    issued_at: issuedAt,
    repaid_at: null,
  };
}

describe('loanStanding', () => {
  it('recognises the three statuses the column may hold', () => {
    expect(loanStanding('active')).toBe('active');
    expect(loanStanding('overdue')).toBe('overdue');
    expect(loanStanding('repaid')).toBe('repaid');
  });

  // 076 added a status to a column that had held two for forty migrations,
  // and the mapper that narrowed it turned the whole loan list into a 500.
  // An unfamiliar status has to stay renderable.
  it('does not refuse a status it has not been taught', () => {
    expect(loanStanding('written_off')).toBe('unknown');
  });
});

describe('isRepayable', () => {
  // The load-bearing one. `bank_repay` takes 'active' or 'overdue', on
  // purpose: a loan that could not be repaid once it aged would make
  // defaulting the better move, so an overdue loan keeps its repay form.
  it('keeps an overdue loan payable', () => {
    expect(isRepayable('overdue')).toBe(true);
    expect(isRepayable('active')).toBe(true);
  });

  it('offers no form where the database function would refuse one', () => {
    expect(isRepayable('repaid')).toBe(false);
    expect(isRepayable('written_off')).toBe(false);
  });
});

describe('hasOverdueLoan', () => {
  it('reports an overdue loan anywhere in the list', () => {
    const loans = [loan('repaid', '2026-01-01'), loan('overdue', '2026-02-01')];
    expect(hasOverdueLoan(loans)).toBe(true);
  });

  it('is quiet when nothing is overdue', () => {
    expect(hasOverdueLoan([loan('active', '2026-02-01')])).toBe(false);
    expect(hasOverdueLoan([])).toBe(false);
  });
});

describe('urgentFirst', () => {
  it('lifts an overdue loan above a newer healthy one', () => {
    const ordered = urgentFirst([
      loan('active', '2026-03-01'),
      loan('overdue', '2026-01-01'),
      loan('repaid', '2026-02-01'),
    ]);
    expect(ordered.map((entry) => entry.status)).toEqual(['overdue', 'active', 'repaid']);
  });

  // The database orders by issued_at DESC and the sort is stable, so loans
  // sharing a standing keep that newest-first order.
  it('keeps the database order among loans in the same standing', () => {
    const ordered = urgentFirst([loan('repaid', '2026-03-01'), loan('repaid', '2026-01-01')]);
    expect(ordered.map((entry) => entry.issued_at)).toEqual(['2026-03-01', '2026-01-01']);
  });

  it('does not reorder the array it was handed', () => {
    const loans = [loan('active', '2026-03-01'), loan('overdue', '2026-01-01')];
    urgentFirst(loans);
    expect(loans.map((entry) => entry.status)).toEqual(['active', 'overdue']);
  });
});

describe('gradeLabel', () => {
  it('reads each seeded grade in Korean', () => {
    expect(gradeLabel('new')).toBe('신규');
    expect(gradeLabel('A')).toBe('A 등급');
  });

  it('shows a grade it has not been taught rather than dropping it', () => {
    expect(gradeLabel('S')).toBe('S');
  });
});
