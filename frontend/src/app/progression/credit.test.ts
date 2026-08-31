import { describe, expect, it } from 'vitest';
import type { CreditLoan, CreditRung } from './credit';
import {
  gradeLabel,
  hasOverdueLoan,
  isRepayable,
  lendsNothing,
  loanStanding,
  ratePercent,
  rungConditions,
  urgentFirst,
} from './credit';

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

/**
 * The ladder 096 exposes. Every one of these numbers is enforced by
 * `bank_borrow` from that migration on, which is what makes printing them
 * honest -- before it the same table was seeded and read by nothing.
 */
function rung(overrides: Partial<CreditRung> = {}): CreditRung {
  return {
    grade: 'C',
    minimum_account_days: 7,
    minimum_work_completions: 10,
    credit_limit: '2000',
    interest_bps: 800,
    term_days: 30,
    minimum_repayment: '100',
    held: false,
    ...overrides,
  };
}

describe('ratePercent', () => {
  it('reads the seeded rates as the specification writes them', () => {
    expect(ratePercent(800)).toBe('8%');
    expect(ratePercent(600)).toBe('6%');
    expect(ratePercent(500)).toBe('5%');
  });

  it('does not round a fractional rate away', () => {
    expect(ratePercent(850)).toBe('8.5%');
  });

  it('says a zero rate rather than nothing', () => {
    expect(ratePercent(0)).toBe('0%');
  });
});

describe('rungConditions', () => {
  it('names the two conditions bank_credit_grade actually tests', () => {
    expect(rungConditions(rung())).toBe('가입 7일 · 작업 10회');
  });

  // The 'new' grade asks for nothing, and is reached by having just arrived.
  it('says so when a rung asks for nothing', () => {
    expect(
      rungConditions(rung({ minimum_account_days: 0, minimum_work_completions: 0 })),
    ).toBe('조건 없음');
  });

  it('drops a condition set to zero rather than printing 0일', () => {
    expect(rungConditions(rung({ minimum_account_days: 0 }))).toBe('작업 10회');
  });
});

describe('lendsNothing', () => {
  it('is true for the grade that may not borrow at all', () => {
    expect(lendsNothing(rung({ grade: 'new', credit_limit: '0' }))).toBe(true);
    expect(lendsNothing(rung())).toBe(false);
  });
});
