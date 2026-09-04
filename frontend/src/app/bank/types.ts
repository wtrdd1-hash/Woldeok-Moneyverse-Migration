export interface BankLoan {
  readonly loan_id: string;
  readonly principal_amount: number | string;
  readonly interest_amount: number | string;
  readonly outstanding_amount: number | string;
  readonly issued_at: string;
  readonly status: string;
}

export interface BankBond {
  readonly id: string;
  readonly bond_code: 'BOND_7D' | 'BOND_30D' | string;
  readonly bond_name: string;
  readonly principal_amount: number | string;
  readonly yield_bps: number;
  readonly maturity_amount: number | string;
  readonly purchased_at: string;
  readonly maturity_at: string;
  readonly is_matured: boolean;
  readonly status: 'holding' | 'redeemed' | string;
}

export interface BankStanding {
  readonly cash_balance: number | string;
  readonly bank_balance: number | string;
  readonly daily_interest_rate_pct: number;
  readonly annual_yield_pct: number;
  readonly unclaimed_interest: number | string;
  readonly credit_limit: number | string;
  readonly active_loan: BankLoan | null;
  readonly bonds: readonly BankBond[];
}
