export interface BankLoan {
  readonly loan_id: string;
  readonly principal_amount: string;
  readonly interest_amount: string;
  readonly outstanding_amount: string;
  readonly issued_at: string;
  readonly status: string;
  readonly maturity_at?: string | null;
  readonly minimum_repayment?: string;
  readonly credit_grade?: string;
}

export interface BankBond {
  readonly id: string;
  readonly bond_code: 'BOND_7D' | 'BOND_30D' | string;
  readonly bond_name: string;
  readonly principal_amount: string;
  readonly yield_bps: number;
  readonly maturity_amount: string;
  readonly purchased_at: string;
  readonly maturity_at: string;
  readonly is_matured: boolean;
  readonly status: 'holding' | 'redeemed' | string;
}

export interface BankStanding {
  readonly cash_balance: string;
  readonly bank_balance: string;
  readonly daily_interest_rate_bps: number;
  readonly daily_interest_rate_pct: number;
  readonly annual_yield_pct: number;
  readonly unclaimed_interest: string;
  readonly credit_grade: string;
  readonly credit_limit: string;
  readonly loan_interest_bps: number;
  readonly loan_term_days: number;
  readonly loan_minimum_repayment: string;
  readonly active_loan: BankLoan | null;
  readonly bonds: readonly BankBond[];
}
