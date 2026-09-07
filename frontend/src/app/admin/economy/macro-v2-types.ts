export interface AdminPolicyV2 {
  id: number;
  master_killswitch_active: boolean;
  auto_balancing_active: boolean;
  banking_circuit_broken: boolean;
  businesses_circuit_broken: boolean;
  market_circuit_broken: boolean;
  daily_deposit_interest_bps: number;
  bond_7d_yield_bps: number;
  bond_30d_yield_bps: number;
  loan_daily_interest_bps: number;
  inflation_threshold_ratio: number;
  last_auto_balanced_at: string | null;
  auto_balance_log: unknown;
  updated_at: string;
  updated_by: string | null;
}

export interface JobStat {
  job_type: string;
  user_count: number;
  avg_level: number;
}

export interface BusinessStat {
  symbol: string;
  name: string;
  total_owners: number;
  boosted_count: number;
}

export interface BondsStat {
  holding_count: number;
  holding_principal: string;
  redeemed_count: number;
  redeemed_amount: string;
}

export interface LoansStat {
  active_count: number;
  active_outstanding: string;
  repaid_count: number;
}

export interface MacroEconomyV2 {
  m2_supply: string;
  cash_total: string;
  bank_total: string;
  faucet_today: string;
  sink_today: string;
  net_flow_today: string;
  inflation_ratio: number;
  inflation_alert: boolean;
  policy: AdminPolicyV2;
  jobs_stats: JobStat[];
  businesses_stats: BusinessStat[];
  bonds_stats: BondsStat;
  loans_stats: LoansStat;
}

export interface UserAssetInspectV2 {
  user_id: string;
  display_name: string | null;
  created_at: string;
  status: string;
  cash_balance: string;
  bank_balance: string;
  total_interest_claimed: string;
  jobs: Array<{
    job_type: string;
    level: number;
    experience: string;
    is_active: boolean;
  }>;
  businesses: Array<{
    id: string;
    symbol: string;
    name: string;
    boost_active: boolean;
    status: string;
  }>;
  active_loan: {
    loan_id: string;
    principal: string;
    outstanding: string;
    issued_at: string;
  } | null;
  bonds: Array<{
    id: string;
    bond_code: string;
    bond_name: string;
    principal_amount: string;
    maturity_amount: string;
    maturity_at: string;
    status: string;
  }>;
}
