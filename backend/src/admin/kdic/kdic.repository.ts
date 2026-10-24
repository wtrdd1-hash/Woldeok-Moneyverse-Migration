import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { Pool } from 'pg';

export interface KdicFundStatus {
  id: string;
  fundName: string;
  totalFundWld: number;
  protectionLimitPerUser: number;
  totalInsuredDepositsWld: number;
  cumulativePremiumsCollectedWld: number;
  cumulativePayoutsWld: number;
  isEmergencyMode: boolean;
  updatedAt: string;
}

export interface InsuredInstitution {
  id: string;
  institutionName: string;
  institutionType: string;
  bisRatioPct: number;
  soundnessGrade: string;
  totalDepositsWld: number;
  premiumRatePct: number;
  status: string;
  updatedAt: string;
}

export interface UserInsuredCoverage {
  userId: string;
  totalDepositWld: number;
  protectionLimitWld: number;
  protectedAmountWld: number;
  unprotectedAmountWld: number;
  coverageRatioPct: number;
  isFullyProtected: boolean;
}

export interface KdicPremiumRecord {
  id: string;
  institutionId: string;
  institutionName: string;
  quarter: string;
  assessedDepositBase: number;
  premiumAmountWld: number;
  status: string;
  createdAt: string;
}

export interface KdicPayoutRecord {
  id: string;
  institutionId: string;
  institutionName: string;
  userId: string;
  displayName?: string;
  originalDepositWld: number;
  payoutAmountWld: number;
  status: string;
  reason: string;
  createdAt: string;
}

@Injectable()
export class KdicRepository {
  constructor(private readonly pool: Pool) {}

  async getFundStatus(): Promise<KdicFundStatus> {
    const res = await this.pool.query(`
      SELECT 
        id,
        fund_name AS "fundName",
        total_fund_wld::float AS "totalFundWld",
        protection_limit_per_user::float AS "protectionLimitPerUser",
        total_insured_deposits_wld::float AS "totalInsuredDepositsWld",
        cumulative_premiums_collected_wld::float AS "cumulativePremiumsCollectedWld",
        cumulative_payouts_wld::float AS "cumulativePayoutsWld",
        is_emergency_mode AS "isEmergencyMode",
        updated_at AS "updatedAt"
      FROM public.deposit_insurance_funds
      LIMIT 1;
    `);

    if (res.rows.length === 0) {
      throw new Error('예금보험기금 마스터 레코드가 존재하지 않습니다.');
    }
    return res.rows[0];
  }

  async getInsuredInstitutions(): Promise<InsuredInstitution[]> {
    const res = await this.pool.query(`
      SELECT 
        id,
        institution_name AS "institutionName",
        institution_type AS "institutionType",
        bis_ratio_pct::float AS "bisRatioPct",
        soundness_grade AS "soundnessGrade",
        total_deposits_wld::float AS "totalDepositsWld",
        premium_rate_pct::float AS "premiumRatePct",
        status,
        updated_at AS "updatedAt"
      FROM public.insured_institutions
      ORDER BY total_deposits_wld DESC;
    `);
    return res.rows;
  }

  async getUserInsuredCoverage(userId: string): Promise<UserInsuredCoverage> {
    const fundRes = await this.pool.query(`
      SELECT coalesce(protection_limit_per_user, 500000)::float AS "protectionLimit"
      FROM public.deposit_insurance_funds
      LIMIT 1;
    `);
    const protectionLimit = fundRes.rows[0]?.protectionLimit ?? 500000;

    const balanceRes = await this.pool.query(`
      SELECT coalesce(sum(ab.available_amount), 0)::float AS "totalDeposit"
      FROM public.accounts a
      JOIN public.account_balances ab ON ab.account_id = a.id
      WHERE a.owner_user_id = $1 AND a.account_type IN ('USER_CASH', 'USER_BANK', 'ESCROW') AND a.status = 'active';
    `, [userId]);

    const totalDeposit = balanceRes.rows[0]?.totalDeposit ?? 0;
    const protectedAmount = Math.min(totalDeposit, protectionLimit);
    const unprotectedAmount = Math.max(0, totalDeposit - protectionLimit);
    const coverageRatioPct = totalDeposit > 0 ? Math.round((protectedAmount / totalDeposit) * 1000) / 10 : 100;

    return {
      userId,
      totalDepositWld: totalDeposit,
      protectionLimitWld: protectionLimit,
      protectedAmountWld: protectedAmount,
      unprotectedAmountWld: unprotectedAmount,
      coverageRatioPct,
      isFullyProtected: unprotectedAmount === 0,
    };
  }

  // Defense in depth: no caller, scheduler, or alternate route may invoke legacy DML.
  async assessQuarterlyPremiums(_adminId: string): Promise<{ totalCollectedWld: number; recordsCount: number }> {
    throw new ServiceUnavailableException('KDIC financial settlements are temporarily unavailable');
  }

  async injectEmergencyLiquidity(_institutionId: string, _amountWld: number, _adminId: string): Promise<{ newBisRatioPct: number; newFundWld: number }> {
    throw new ServiceUnavailableException('KDIC financial settlements are temporarily unavailable');
  }

  async executeDepositPayout(_institutionId: string, _userId: string, _adminId: string): Promise<{ payoutAmountWld: number; newFundWld: number }> {
    throw new ServiceUnavailableException('KDIC financial settlements are temporarily unavailable');
  }

  async listRecentPremiums(limit: number = 20): Promise<KdicPremiumRecord[]> {
    const res = await this.pool.query(`
      SELECT 
        p.id,
        p.institution_id AS "institutionId",
        coalesce(i.institution_name, p.institution_id) AS "institutionName",
        p.quarter,
        p.assessed_deposit_base::float AS "assessedDepositBase",
        p.premium_amount_wld::float AS "premiumAmountWld",
        p.status,
        p.created_at AS "createdAt"
      FROM public.deposit_insurance_premiums p
      LEFT JOIN public.insured_institutions i ON i.id = p.institution_id
      ORDER BY p.created_at DESC
      LIMIT $1;
    `, [limit]);
    return res.rows;
  }

  async listRecentPayouts(limit: number = 20): Promise<KdicPayoutRecord[]> {
    const res = await this.pool.query(`
      SELECT 
        py.id,
        py.institution_id AS "institutionId",
        coalesce(i.institution_name, py.institution_id) AS "institutionName",
        py.user_id AS "userId",
        coalesce(mp.display_name, '예금자') AS "displayName",
        py.original_deposit_wld::float AS "originalDepositWld",
        py.payout_amount_wld::float AS "payoutAmountWld",
        py.status,
        py.reason,
        py.created_at AS "createdAt"
      FROM public.deposit_insurance_payouts py
      LEFT JOIN public.insured_institutions i ON i.id = py.institution_id
      LEFT JOIN public.member_profiles mp ON mp.user_id = py.user_id
      ORDER BY py.created_at DESC
      LIMIT $1;
    `, [limit]);
    return res.rows;
  }
}
