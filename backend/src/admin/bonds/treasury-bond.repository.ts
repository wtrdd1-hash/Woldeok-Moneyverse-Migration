import { BadRequestException, ConflictException, Inject, Injectable, Logger, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import type { Pool, PoolClient } from 'pg';
import { PG_POOL } from '../../core/pool.provider';
import { BOND_REPO_LOAN_HOLD_REASON } from './bond-repo-loan-hold';
import { BOND_SUBSCRIPTION_HOLD_REASON } from './bond-subscription-hold';
import { BOND_COUPON_SETTLEMENT_HOLD_REASON } from './bond-coupon-settlement-hold';

export interface TreasuryBondRow {
  id: string;
  symbol: string;
  name: string;
  maturity_hours: number;
  annual_coupon_rate_bps: number;
  hourly_coupon_rate_bps: number;
  par_value_wld: string;
  total_issued_units: string;
  available_units: string;
  total_funded_wld: string;
  status: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface BondHoldingRow {
  id: string;
  user_id: string;
  bond_id: string;
  bond_symbol: string;
  bond_name: string;
  units: string;
  par_value_wld: string;
  purchase_price_total_wld: string;
  accrued_interest_wld: string;
  hourly_coupon_rate_bps: number;
  annual_coupon_rate_bps: number;
  purchased_at: string;
  maturity_at: string;
  status: string;
  auto_rollover: boolean;
  collateral_locked: boolean;
  hours_left?: number;
}

export interface BondCouponLogRow {
  id: string;
  holding_id: string | null;
  user_id: string;
  bond_symbol: string;
  bond_name: string;
  event_type: string;
  amount_wld: string;
  created_at: string;
}

export interface BondRepoLoanRow {
  id: string;
  holding_id: string;
  user_id: string;
  bond_name: string;
  bond_symbol: string;
  principal_wld: string;
  annual_interest_rate_bps: number;
  accrued_interest_wld: string;
  ltv_percent: number;
  status: string;
  created_at: string;
}

export interface BondOrderRow {
  id: string;
  seller_id: string;
  bond_id: string;
  holding_id: string;
  bond_symbol: string;
  bond_name: string;
  units: string;
  unit_price_wld: string;
  par_value_wld: string;
  status: string;
  created_at: string;
}

export interface TreasuryBondsOverview {
  totalBondsActive: number;
  totalFundedWld: string;
  totalHoldersCount: number;
  totalCouponsPaidWld: string;
  totalRepoLoansWld: string;
  benchmark1YYield: string;
  benchmark3YYield: string;
  benchmark5YYield: string;
}

/** Missing or inactive virtual bonds have no published benchmark yield. */
export function bondBenchmarkYield(
  bonds: readonly Pick<TreasuryBondRow, 'symbol' | 'annual_coupon_rate_bps' | 'status'>[],
  symbol: string,
): string {
  const match = bonds.find((bond) => bond.symbol === symbol &&
    (bond.status === 'OPEN_SUBSCRIPTION' || bond.status === 'TRADING'));
  return match && Number.isSafeInteger(match.annual_coupon_rate_bps) && match.annual_coupon_rate_bps >= 0
    ? `${(match.annual_coupon_rate_bps / 100).toFixed(2)}%`
    : '—';
}

@Injectable()
export class TreasuryBondRepository {
  private readonly logger = new Logger(TreasuryBondRepository.name);

  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  private async ensureUserCashAccount(client: PoolClient, userId: string): Promise<string> {
    const existing = await client.query<{ id: string }>(`
      SELECT id FROM public.accounts WHERE owner_user_id = $1 AND account_type = 'USER_CASH' LIMIT 1
    `, [userId]);
    if (existing.rows[0]) return existing.rows[0].id;

    const created = await client.query<{ id: string }>(`
      INSERT INTO public.accounts (owner_user_id, account_type, currency, status, allow_negative)
      VALUES ($1, 'USER_CASH', 'WLD', 'active', false)
      RETURNING id
    `, [userId]);
    const accountId = created.rows[0]?.id;
    if (!accountId) throw new Error('사용자 계좌 생성에 실패했습니다.');

    await client.query(`
      INSERT INTO public.account_balances (account_id, available_amount)
      VALUES ($1, 0)
      ON CONFLICT (account_id) DO NOTHING
    `, [accountId]);

    return accountId;
  }

  async listBonds(): Promise<TreasuryBondRow[]> {
    const res = await this.pool.query<TreasuryBondRow>(`
      SELECT
        id, symbol, name, maturity_hours,
        annual_coupon_rate_bps, hourly_coupon_rate_bps,
        par_value_wld::text,
        total_issued_units::text,
        available_units::text,
        total_funded_wld::text,
        status, description,
        created_at::text, updated_at::text
      FROM public.bond_public_catalog()
      ORDER BY maturity_hours ASC
    `);
    return res.rows;
  }

  async getBondById(id: string): Promise<TreasuryBondRow | null> {
    const res = await this.pool.query<TreasuryBondRow>(`
      SELECT
        id, symbol, name, maturity_hours,
        annual_coupon_rate_bps, hourly_coupon_rate_bps,
        par_value_wld::text,
        total_issued_units::text,
        available_units::text,
        total_funded_wld::text,
        status, description,
        created_at::text, updated_at::text
      FROM public.bond_public_catalog()
      WHERE id = $1
    `, [id]);
    return res.rows[0] ?? null;
  }

  async getOverview(): Promise<TreasuryBondsOverview> {
    const [bondsRes, totalsRes] = await Promise.all([
      this.pool.query<{ count: string; total_funded: string }>(`
        SELECT COUNT(*)::text as count, COALESCE(SUM(total_funded_wld), 0)::text as total_funded
        FROM public.bond_public_catalog()
        WHERE status = 'OPEN_SUBSCRIPTION' OR status = 'TRADING'
      `),
      this.pool.query<{ holders_count: string; coupons_paid_wld: string; repo_active_principal_wld: string }>(`
        SELECT * FROM public.bond_public_read_totals()
      `),
    ]);
    const totals = totalsRes.rows[0];
    if (!totals || !/^(0|[1-9][0-9]*)$/.test(totals.holders_count)
      || !Number.isSafeInteger(Number(totals.holders_count))
      || !/^(0|[1-9][0-9]*)$/.test(totals.coupons_paid_wld)
      || !/^(0|[1-9][0-9]*)$/.test(totals.repo_active_principal_wld)) {
      throw new ServiceUnavailableException('Bond market aggregate evidence unavailable');
    }

    const bonds = await this.listBonds();

    return {
      totalBondsActive: Number(bondsRes.rows[0]?.count ?? '0'),
      totalFundedWld: bondsRes.rows[0]?.total_funded ?? '0',
      totalHoldersCount: Number(totals.holders_count),
      totalCouponsPaidWld: totals.coupons_paid_wld,
      totalRepoLoansWld: totals.repo_active_principal_wld,
      benchmark1YYield: bondBenchmarkYield(bonds, 'KTB-01Y'),
      benchmark3YYield: bondBenchmarkYield(bonds, 'KTB-03Y'),
      benchmark5YYield: bondBenchmarkYield(bonds, 'KTB-05Y'),
    };
  }

  async listUserHoldings(userId: string): Promise<BondHoldingRow[]> {
    const res = await this.pool.query<BondHoldingRow>(`
      SELECT * FROM public.bond_owner_holdings($1::uuid)
    `, [userId]);
    return res.rows;
  }

  async listUserRepoLoans(userId: string): Promise<BondRepoLoanRow[]> {
    const res = await this.pool.query<BondRepoLoanRow>(`
      SELECT * FROM public.bond_owner_repo_loans($1::uuid)
    `, [userId]);
    return res.rows;
  }

  async listRecentCouponLogs(limit = 20): Promise<BondCouponLogRow[]> {
    if (!Number.isSafeInteger(limit) || limit < 1 || limit > 100) {
      throw new BadRequestException('limit must be an integer between 1 and 100');
    }
    const res = await this.pool.query<BondCouponLogRow>(`
      SELECT
        l.id, l.holding_id, l.user_id,
        b.symbol AS bond_symbol,
        b.name AS bond_name,
        l.event_type,
        l.amount_wld::text,
        l.created_at::text
      FROM public.treasury_bond_coupon_logs l
      JOIN public.treasury_bonds b ON b.id = l.bond_id
      ORDER BY l.created_at DESC
      LIMIT $1
    `, [limit]);
    return res.rows;
  }

  async subscribeBond(
    _userId: string,
    _bondId: string,
    _units: number,
  ): Promise<{ holdingId: string; totalPriceWld: string; maturityAt: string }> {
    // Defense in depth: internal callers must not bypass the HTTP safety hold.
    throw new ServiceUnavailableException(BOND_SUBSCRIPTION_HOLD_REASON);
  }
  async createRepoLoan(
    _userId: string,
    _holdingId: string,
  ): Promise<{ loanId: string; loanAmountWld: string }> {
    // No direct account_balances credit is permitted without balanced postings.
    throw new ServiceUnavailableException(BOND_REPO_LOAN_HOLD_REASON);
  }

  async repayRepoLoan(
    _userId: string,
    _loanId: string,
  ): Promise<{ repaidAmountWld: string }> {
    // Do not debit balances or unlock collateral without a replay-safe receipt.
    throw new ServiceUnavailableException(BOND_REPO_LOAN_HOLD_REASON);
  }

  async toggleAutoRollover(userId: string, holdingId: string, enabled: boolean): Promise<boolean> {
    const res = await this.pool.query(`
      UPDATE public.treasury_bond_holdings
      SET auto_rollover = $1, updated_at = now()
      WHERE id = $2 AND user_id = $3
    `, [enabled, holdingId, userId]);
    return (res.rowCount ?? 0) > 0;
  }

  async processHourlyCouponsAndMaturities(): Promise<{
    couponsDistributedWld: string;
    maturitiesRedeemedWld: string;
    holdingsProcessed: number;
    maturedCount: number;
  }> {
    // Fail before obtaining a DB client. Legacy code credited USER_CASH without
    // economy_post_transaction postings and could replay coupons each invocation.
    throw new ServiceUnavailableException(BOND_COUPON_SETTLEMENT_HOLD_REASON);
  }
  async updateBondStatus(bondId: string, status: string, annualCouponRateBps?: number): Promise<boolean> {
    const params: (string | number)[] = [status, bondId];
    let query = `UPDATE public.treasury_bonds SET status = $1, updated_at = now()`;
    if (typeof annualCouponRateBps === 'number') {
      const hourlyBps = Math.max(1, Math.round((annualCouponRateBps / 365 / 24) * 100));
      query += `, annual_coupon_rate_bps = $3, hourly_coupon_rate_bps = $4`;
      params.push(annualCouponRateBps, hourlyBps);
    }
    query += ` WHERE id = $2`;
    const res = await this.pool.query(query, params);
    return (res.rowCount ?? 0) > 0;
  }
}