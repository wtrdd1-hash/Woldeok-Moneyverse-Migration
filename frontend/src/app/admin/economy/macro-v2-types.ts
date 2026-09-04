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
  updated_by: string;
}

export interface JobStat {
  job_type: string;
  active_members: number;
  total_earned: number;
}

export interface BusinessStat {
  symbol: string;
  name: string;
  total_shares: number;
  owner_count: number;
  total_dividends_paid: number;
}

export interface BondsStat {
  holding_count: number;
  holding_principal: number;
  redeemed_count: number;
  redeemed_amount: number;
}

export interface LoansStat {
  active_count: number;
  active_outstanding: number;
  repaid_count: number;
}

export interface MacroEconomyV2 {
  m2_supply: number;
  cash_total: number;
  bank_total: number;
  faucet_today: number;
  sink_today: number;
  net_flow_today: number;
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
  wallet_balance: number;
  bank_deposit_balance: number;
  loan_debt_balance: number;
  job: {
    job_type: string;
    level: number;
    experience: number;
  } | null;
  businesses: Array<{
    symbol: string;
    name: string;
    share_count: number;
    total_dividends_received: number;
  }>;
  bonds: Array<{
    bond_type: string;
    principal_amount: number;
    yield_amount: number;
    matures_at: string;
    status: string;
  }>;
}
