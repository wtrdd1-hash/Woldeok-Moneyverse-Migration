import { Injectable, Logger } from '@nestjs/common';
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
  private readonly logger = new Logger(KdicRepository.name);

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
    const balanceRes = await this.pool.query(`
      SELECT coalesce(sum(ab.available_balance + ab.locked_balance), 0)::float AS "totalDeposit"
      FROM public.accounts a
      JOIN public.account_balances ab ON ab.account_id = a.id
      WHERE a.user_id = $1 AND a.account_type IN ('USER_CASH', 'SAVINGS', 'ESCROW');
    `, [userId]);

    const totalDeposit = balanceRes.rows[0]?.totalDeposit ?? 0;
    const protectionLimit = 500000; // 5천만원 상당
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

  async assessQuarterlyPremiums(adminId: string): Promise<{ totalCollectedWld: number; recordsCount: number }> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const insts = await client.query(`
        SELECT id, institution_name, total_deposits_wld::float AS deposits, premium_rate_pct::float AS rate
        FROM public.insured_institutions
        FOR UPDATE;
      `);

      let totalCollected = 0;
      const quarter = `2026-Q${Math.floor(new Date().getMonth() / 3) + 1}`;

      for (const inst of insts.rows) {
        // 분기별 예보료 = 연간 요율(0.08%) / 4
        const premium = Math.round((inst.deposits * (inst.rate / 100)) / 4);
        totalCollected += premium;

        await client.query(`
          INSERT INTO public.deposit_insurance_premiums (
            institution_id, quarter, assessed_deposit_base, premium_amount_wld, status
          ) VALUES ($1, $2, $3, $4, 'COLLECTED');
        `, [inst.id, quarter, inst.deposits, premium]);
      }

      await client.query(`
        UPDATE public.deposit_insurance_funds
        SET 
          total_fund_wld = total_fund_wld + $1,
          cumulative_premiums_collected_wld = cumulative_premiums_collected_wld + $1,
          updated_at = now();
      `, [totalCollected]);

      await client.query('COMMIT');
      return { totalCollectedWld: totalCollected, recordsCount: insts.rows.length };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async injectEmergencyLiquidity(
    institutionId: string,
    amountWld: number,
    adminId: string
  ): Promise<{ newBisRatioPct: number; newFundWld: number }> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const fundRes = await client.query(`
        SELECT total_fund_wld::float AS fund
        FROM public.deposit_insurance_funds
        FOR UPDATE;
      `);
      const fund = fundRes.rows[0]?.fund ?? 0;
      if (fund < amountWld) {
        throw new Error('예금보험기금 가용 재원이 부족합니다.');
      }

      // 기금 차감
      const updateFundRes = await client.query(`
        UPDATE public.deposit_insurance_funds
        SET total_fund_wld = total_fund_wld - $1, is_emergency_mode = true, updated_at = now()
        RETURNING total_fund_wld::float AS fund;
      `, [amountWld]);

      // 금융기관 유동성 지원 및 BIS 비율 회복 (+2.5%p)
      const updateInstRes = await client.query(`
        UPDATE public.insured_institutions
        SET 
          bis_ratio_pct = LEAST(16.0, bis_ratio_pct + 2.50),
          status = 'HEALTHY',
          soundness_grade = 'GRADE_1',
          updated_at = now()
        WHERE id = $1
        RETURNING bis_ratio_pct::float AS bis;
      `, [institutionId]);

      await client.query('COMMIT');
      return {
        newBisRatioPct: updateInstRes.rows[0]?.bis ?? 14.5,
        newFundWld: updateFundRes.rows[0]?.fund ?? 0,
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async executeDepositPayout(
    institutionId: string,
    userId: string,
    adminId: string
  ): Promise<{ payoutAmountWld: number; newFundWld: number }> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // 유저 예금 조회
      const coverage = await this.getUserInsuredCoverage(userId);
      const payoutAmount = coverage.protectedAmountWld;

      if (payoutAmount <= 0) {
        throw new Error('대위변제 대상 보호 예금 잔액이 없습니다.');
      }

      // 예보기금 차감
      const updateFundRes = await client.query(`
        UPDATE public.deposit_insurance_funds
        SET 
          total_fund_wld = total_fund_wld - $1,
          cumulative_payouts_wld = cumulative_payouts_wld + $1,
          updated_at = now()
        RETURNING total_fund_wld::float AS fund;
      `, [payoutAmount]);

      // 유저 계좌로 대위변제금 입금
      await client.query(`
        UPDATE public.account_balances ab
        SET available_balance = available_balance + $2, updated_at = now()
        FROM public.accounts a
        WHERE a.id = ab.account_id AND a.user_id = $1 AND a.account_type = 'USER_CASH';
      `, [userId, payoutAmount]);

      // 대위변제 기록
      await client.query(`
        INSERT INTO public.deposit_insurance_payouts (
          institution_id, user_id, original_deposit_wld, payout_amount_wld, status, reason
        ) VALUES ($1, $2, $3, $4, 'COMPLETED', '예금자보호법 제31조에 의거한 예금 대위변제금 지급');
      `, [institutionId, userId, coverage.totalDepositWld, payoutAmount]);

      await client.query('COMMIT');
      return {
        payoutAmountWld: payoutAmount,
        newFundWld: updateFundRes.rows[0]?.fund ?? 0,
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
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
