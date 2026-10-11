import { Injectable, Logger } from '@nestjs/common';
import { Pool } from 'pg';
import { randomUUID } from 'node:crypto';

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

  private async resolveActorUuid(adminId: string, client?: any): Promise<string> {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const executor = client || this.pool;
    if (uuidRegex.test(adminId)) {
      const check = await executor.query('SELECT id FROM public.users WHERE id = $1', [adminId]);
      if (check.rows.length > 0) {
        return adminId;
      }
    }
    const fallbackUser = await executor.query(
      "SELECT id FROM public.users WHERE status = 'active' ORDER BY created_at ASC LIMIT 1"
    );
    if (fallbackUser.rows.length > 0) {
      return fallbackUser.rows[0].id;
    }
    throw new Error('원장 분개를 위한 유효한 행위자(User)를 찾을 수 없습니다.');
  }

  async executeDepositPayout(
    institutionId: string,
    userId: string,
    adminId: string
  ): Promise<{ payoutAmountWld: number; newFundWld: number }> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // 1. 중복 대위변제 여부 검증 (Idempotency Guard)
      const existingPayout = await client.query(`
        SELECT id, payout_amount_wld::float AS amount
        FROM public.deposit_insurance_payouts
        WHERE institution_id = $1 AND user_id = $2 AND status = 'COMPLETED'
        LIMIT 1;
      `, [institutionId, userId]);

      if (existingPayout.rows.length > 0) {
        throw new Error('해당 금융기관에 대해 이미 대위변제금이 지급 완료된 예금자입니다.');
      }

      // 2. 유저의 USER_CASH 활성 계좌 조회 및 잠금
      const userCashAccRes = await client.query(`
        SELECT a.id AS "accountId"
        FROM public.accounts a
        WHERE a.owner_user_id = $1 AND a.account_type = 'USER_CASH' AND a.status = 'active'
        LIMIT 1;
      `, [userId]);

      if (userCashAccRes.rows.length === 0) {
        throw new Error('대위변제금을 입금받을 유저의 활성 현금 계좌(USER_CASH)를 찾을 수 없습니다.');
      }
      const userCashAccountId = userCashAccRes.rows[0].accountId;

      // 3. 기금 마스터 및 보장 한도 잠금 (FOR UPDATE)
      const fundRes = await client.query(`
        SELECT 
          total_fund_wld::float AS fund,
          coalesce(protection_limit_per_user, 500000)::float AS "protectionLimit"
        FROM public.deposit_insurance_funds
        FOR UPDATE;
      `);
      if (fundRes.rows.length === 0) {
        throw new Error('예금보험기금 마스터 레코드가 존재하지 않습니다.');
      }
      const currentFund = fundRes.rows[0].fund;
      const protectionLimit = fundRes.rows[0].protectionLimit;

      // 4. 유저 보호 대상 예금 산출
      const balanceRes = await client.query(`
        SELECT coalesce(sum(ab.available_amount), 0)::float AS "totalDeposit"
        FROM public.accounts a
        JOIN public.account_balances ab ON ab.account_id = a.id
        WHERE a.owner_user_id = $1 AND a.account_type IN ('USER_CASH', 'USER_BANK', 'ESCROW') AND a.status = 'active';
      `, [userId]);

      const totalDeposit = balanceRes.rows[0]?.totalDeposit ?? 0;
      const payoutAmount = Math.min(totalDeposit, protectionLimit);

      if (payoutAmount <= 0) {
        throw new Error('대위변제 대상 보호 예금 잔액이 없습니다.');
      }

      if (currentFund < payoutAmount) {
        throw new Error(`예금보험기금 가용 재원이 부족합니다. (필요: ${payoutAmount} WLD, 가용: ${currentFund} WLD)`);
      }

      // 5. 원천 통화 발행(MINT) 활성 계좌 조회
      const mintAccRes = await client.query(`
        SELECT id AS "accountId"
        FROM public.accounts
        WHERE system_key = 'mint' AND account_type = 'MINT' AND status = 'active'
        LIMIT 1;
      `);
      if (mintAccRes.rows.length === 0) {
        throw new Error('대위변제 원천 MINT 계좌를 찾을 수 없습니다.');
      }
      const mintAccountId = mintAccRes.rows[0].accountId;

      // 6. 정책 버전 및 유효한 행위자 식별
      const policyRes = await client.query('SELECT active.version FROM public.economy_active_policy() AS active;');
      const policyVersion = policyRes.rows[0]?.version || null;
      const actorUuid = await this.resolveActorUuid(adminId, client);

      // 7. 복식부기 원장 분개 (economy_post_transaction 호출)
      const idempotencyKey = randomUUID();
      await client.query(`
        SELECT public.economy_post_transaction(
          $1::uuid,
          'KDIC_DEPOSIT_PAYOUT',
          $2::uuid,
          $3,
          jsonb_build_array(
            jsonb_build_object('accountId', $4::uuid, 'amount', $5::numeric, 'direction', 'credit'),
            jsonb_build_object('accountId', $6::uuid, 'amount', $5::numeric, 'direction', 'debit')
          ),
          'kdic.payout.completed',
          jsonb_build_object('institutionId', $7::text, 'userId', $8::uuid, 'payoutAmount', $5::numeric)
        );
      `, [
        idempotencyKey,
        actorUuid,
        policyVersion,
        mintAccountId,
        payoutAmount,
        userCashAccountId,
        institutionId,
        userId,
      ]);

      // 8. 예보기금 통계 차감 및 누적 지급액 갱신
      const updateFundRes = await client.query(`
        UPDATE public.deposit_insurance_funds
        SET 
          total_fund_wld = total_fund_wld - $1,
          cumulative_payouts_wld = cumulative_payouts_wld + $1,
          updated_at = now()
        RETURNING total_fund_wld::float AS fund;
      `, [payoutAmount]);

      // 9. 대위변제 원장 레코드 영구 기록
      await client.query(`
        INSERT INTO public.deposit_insurance_payouts (
          institution_id, user_id, original_deposit_wld, payout_amount_wld, status, reason
        ) VALUES ($1, $2, $3, $4, 'COMPLETED', '예금자보호법 제31조에 의거한 예금 대위변제금 지급');
      `, [institutionId, userId, totalDeposit, payoutAmount]);

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
