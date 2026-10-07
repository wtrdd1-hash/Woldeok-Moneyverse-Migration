import { Inject, Injectable, Logger } from '@nestjs/common';
import type { Pool, PoolClient } from 'pg';
import { PG_POOL } from '../../core/pool.provider';

export interface NationalPensionOverview {
  totalAumWld: string;
  totalSubscribersCount: number;
  totalRetiredReceiversCount: number;
  totalPensionPaidWld: string;
  benchmarkAnnualPayoutRate: string;
  vaultMainBalanceWld: string;
}

export interface NationalPensionAccountRow {
  id: string;
  user_id: string;
  tier: string;
  status: string;
  accumulated_contribution_wld: string;
  total_contributions_count: number;
  hourly_payout_rate_bps: number;
  total_payout_received_wld: string;
  last_payout_at?: string;
  retired_at?: string;
  created_at: string;
  updated_at: string;
}

export interface NationalPensionContributionRow {
  id: string;
  account_id: string;
  user_id: string;
  amount_wld: string;
  note: string;
  created_at: string;
}

export interface NationalPensionPayoutLogRow {
  id: string;
  account_id: string;
  user_id: string;
  payout_amount_wld: string;
  snapshot_accumulated_wld: string;
  created_at: string;
}

@Injectable()
export class NationalPensionRepository {
  private readonly logger = new Logger(NationalPensionRepository.name);

  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  private calculateTierAndRate(accumulated: number): { tier: string; hourlyRateBps: number } {
    if (accumulated >= 10000000) {
      return { tier: 'TIER_5_HONOR', hourlyRateBps: 12 };
    } else if (accumulated >= 2000000) {
      return { tier: 'TIER_4_PLATINUM', hourlyRateBps: 11 };
    } else if (accumulated >= 500000) {
      return { tier: 'TIER_3_GOLD', hourlyRateBps: 10 };
    } else if (accumulated >= 100000) {
      return { tier: 'TIER_2_CITIZEN', hourlyRateBps: 9 };
    }
    return { tier: 'TIER_1_YOUTH', hourlyRateBps: 8 };
  }

  private async ensureUserCashAccount(client: PoolClient, userId: string): Promise<string> {
    const existing = await client.query<{ id: string }>(
      `SELECT id FROM public.accounts WHERE owner_user_id = $1 AND account_type = 'USER_CASH' LIMIT 1`,
      [userId],
    );
    if (existing.rows[0]) {
      const accId = existing.rows[0].id;
      await client.query(
        `INSERT INTO public.account_balances (account_id, available_amount)
         VALUES ($1, 0)
         ON CONFLICT (account_id) DO NOTHING`,
        [accId],
      );
      return accId;
    }

    const created = await client.query<{ id: string }>(
      `INSERT INTO public.accounts (owner_user_id, account_type, currency, status, allow_negative)
       VALUES ($1, 'USER_CASH', 'WLD', 'active', false)
       RETURNING id`,
      [userId],
    );
    const newAccId = created.rows[0]?.id;
    if (!newAccId) {
      throw new Error('사용자 계좌 생성에 실패했습니다.');
    }
    await client.query(
      `INSERT INTO public.account_balances (account_id, available_amount)
       VALUES ($1, 0)
       ON CONFLICT (account_id) DO NOTHING`,
      [newAccId],
    );
    return newAccId;
  }

  async getOverview(): Promise<NationalPensionOverview> {
    const aumRes = await this.pool.query(
      `SELECT 
         COALESCE(SUM(accumulated_contribution_wld), 0) AS total_aum,
         COUNT(id) AS total_subscribers,
         COUNT(id) FILTER (WHERE status = 'RETIRED_RECEIVING') AS total_receivers,
         COALESCE(SUM(total_payout_received_wld), 0) AS total_pension_paid
       FROM public.national_pension_accounts
       WHERE status != 'LIQUIDATED'`,
    );

    const vaultRes = await this.pool.query(
      `SELECT balance_wld FROM public.system_treasury_vaults WHERE code = 'VAULT_MAIN' LIMIT 1`,
    );

    const configRes = await this.pool.query(
      `SELECT benchmark_annual_payout_rate_bps FROM public.national_pension_configs LIMIT 1`,
    );

    const totalAum = aumRes.rows[0]?.total_aum || '0';
    const totalSubscribers = Number(aumRes.rows[0]?.total_subscribers || 0);
    const totalReceivers = Number(aumRes.rows[0]?.total_receivers || 0);
    const totalPensionPaid = aumRes.rows[0]?.total_pension_paid || '0';
    const vaultBal = vaultRes.rows[0]?.balance_wld || '0';
    const benchmarkBps = configRes.rows[0]?.benchmark_annual_payout_rate_bps || 800;

    return {
      totalAumWld: totalAum.toString(),
      totalSubscribersCount: totalSubscribers,
      totalRetiredReceiversCount: totalReceivers,
      totalPensionPaidWld: totalPensionPaid.toString(),
      benchmarkAnnualPayoutRate: `${(benchmarkBps / 100).toFixed(1)}%`,
      vaultMainBalanceWld: vaultBal.toString(),
    };
  }

  async getOrCreateAccount(userId: string): Promise<NationalPensionAccountRow> {
    const existing = await this.pool.query<NationalPensionAccountRow>(
      `SELECT * FROM public.national_pension_accounts WHERE user_id = $1 LIMIT 1`,
      [userId],
    );
    if (existing.rows[0]) {
      return existing.rows[0];
    }

    const created = await this.pool.query<NationalPensionAccountRow>(
      `INSERT INTO public.national_pension_accounts (user_id, tier, status, hourly_payout_rate_bps)
       VALUES ($1, 'TIER_1_YOUTH', 'ACCUMULATING', 8)
       RETURNING *`,
      [userId],
    );
    const acc = created.rows[0];
    if (!acc) {
      throw new Error('국민연금 계좌 개설에 실패했습니다.');
    }
    return acc;
  }

  async contribute(userId: string, amountWld: number, note = '국민연금 기여금 납입') {
    if (amountWld <= 0) {
      throw new Error('기여금 납입액은 0보다 커야 합니다.');
    }

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // 1. 유저 계좌 확인 및 잔액 차감
      const userAccountId = await this.ensureUserCashAccount(client, userId);
      const balRes = await client.query<{ available_amount: string }>(
        `SELECT available_amount FROM public.account_balances WHERE account_id = $1 FOR UPDATE`,
        [userAccountId],
      );
      const currentBalance = Number(balRes.rows[0]?.available_amount || 0);
      if (currentBalance < amountWld) {
        throw new Error(
          `지갑 잔액이 부족합니다. (보유: ${currentBalance.toLocaleString('ko-KR')} WLD, 필요: ${amountWld.toLocaleString('ko-KR')} WLD)`,
        );
      }

      await client.query(
        `UPDATE public.account_balances SET available_amount = available_amount - $1 WHERE account_id = $2`,
        [amountWld, userAccountId],
      );

      // 2. 중앙 국고(VAULT_MAIN)로 기여금 입금
      const vaultRes = await client.query<{ id: string; balance_wld: string }>(
        `UPDATE public.system_treasury_vaults 
         SET balance_wld = (balance_wld::numeric + $1)::text, updated_at = NOW() 
         WHERE code = 'VAULT_MAIN' 
         RETURNING id, balance_wld`,
        [amountWld],
      );
      const newVaultBalance = vaultRes.rows[0]?.balance_wld || '0';

      // 3. 연금 계좌 조회/생성
      let accRes = await client.query<NationalPensionAccountRow>(
        `SELECT * FROM public.national_pension_accounts WHERE user_id = $1 FOR UPDATE`,
        [userId],
      );
      let account: NationalPensionAccountRow;
      if (!accRes.rows[0]) {
        const created = await client.query<NationalPensionAccountRow>(
          `INSERT INTO public.national_pension_accounts (user_id, tier, status, hourly_payout_rate_bps)
           VALUES ($1, 'TIER_1_YOUTH', 'ACCUMULATING', 8)
           RETURNING *`,
          [userId],
        );
        const newAcc = created.rows[0];
        if (!newAcc) throw new Error('연금 계좌 생성 오류');
        account = newAcc;
      } else {
        account = accRes.rows[0];
      }

      const newAccumulated = Number(account.accumulated_contribution_wld) + amountWld;
      const { tier, hourlyRateBps } = this.calculateTierAndRate(newAccumulated);

      // 4. 연금 계좌 업데이트
      const updatedAccRes = await client.query<NationalPensionAccountRow>(
        `UPDATE public.national_pension_accounts
         SET accumulated_contribution_wld = $1,
             total_contributions_count = total_contributions_count + 1,
             tier = $2,
             hourly_payout_rate_bps = $3,
             status = CASE WHEN status = 'LIQUIDATED' THEN 'ACCUMULATING' ELSE status END,
             updated_at = NOW()
         WHERE id = $4
         RETURNING *`,
        [newAccumulated, tier, hourlyRateBps, account.id],
      );
      const updatedAccount = updatedAccRes.rows[0];
      if (!updatedAccount) throw new Error('연금 계좌 갱신 실패');

      // 5. 기여금 납입 이력 기록
      await client.query(
        `INSERT INTO public.national_pension_contributions (account_id, user_id, amount_wld, note)
         VALUES ($1, $2, $3, $4)`,
        [account.id, userId, amountWld, note],
      );

      // 6. 국고 회계 원장 기록
      if (vaultRes.rows[0]?.id) {
        const balanceBefore = (BigInt(newVaultBalance) - BigInt(amountWld)).toString();
        const validActorId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)
          ? userId
          : null;
        await client.query(
          `INSERT INTO public.system_treasury_ledger (
             vault_id, tx_type, amount_wld, actor_id, reason, balance_before, balance_after
           ) VALUES ($1, 'FEE_RECIRCULATION', $2, $3, $4, $5, $6)`,
          [
            vaultRes.rows[0].id,
            amountWld.toString(),
            validActorId,
            '[국민연금] 국민 공적 연금 기여금 납입 및 국고 편입',
            balanceBefore,
            newVaultBalance,
          ],
        );
      }

      await client.query('COMMIT');

      return {
        account: updatedAccount,
        contributedAmountWld: amountWld,
        newVaultBalanceWld: newVaultBalance,
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async toggleRetirement(userId: string): Promise<NationalPensionAccountRow> {
    const acc = await this.getOrCreateAccount(userId);
    if (acc.status === 'LIQUIDATED') {
      throw new Error('해지된 계좌입니다. 새로 기여금을 납입하여 연금을 재개하십시오.');
    }
    if (Number(acc.accumulated_contribution_wld) < 1000) {
      throw new Error('은퇴 연금 수령 개시를 위해서는 최소 1,000 WLD 이상의 적립금이 필요합니다.');
    }

    const nextStatus = acc.status === 'RETIRED_RECEIVING' ? 'ACCUMULATING' : 'RETIRED_RECEIVING';

    const res = await this.pool.query<NationalPensionAccountRow>(
      `UPDATE public.national_pension_accounts
       SET status = $1,
           retired_at = ${nextStatus === 'RETIRED_RECEIVING' ? 'NOW()' : 'NULL'},
           updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [nextStatus, acc.id],
    );
    const updated = res.rows[0];
    if (!updated) throw new Error('은퇴 상태 변경에 실패했습니다.');
    return updated;
  }

  async liquidate(userId: string) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const accRes = await client.query<NationalPensionAccountRow>(
        `SELECT * FROM public.national_pension_accounts WHERE user_id = $1 FOR UPDATE`,
        [userId],
      );
      const acc = accRes.rows[0];
      if (!acc || acc.status === 'LIQUIDATED') {
        throw new Error('해지 가능한 유효한 연금 계좌가 없습니다.');
      }
      const account: NationalPensionAccountRow = acc;
      const principal = Number(account.accumulated_contribution_wld);
      if (principal <= 0) {
        throw new Error('적립된 연금 원금이 없습니다.');
      }

      // 95% 환급, 5% 복지기금 귀속
      const refundAmount = Math.floor(principal * 0.95);
      const welfarePenalty = principal - refundAmount;

      // 국고 차감
      await client.query(
        `UPDATE public.system_treasury_vaults 
         SET balance_wld = GREATEST(0, (balance_wld::numeric - $1))::text, updated_at = NOW() 
         WHERE code = 'VAULT_MAIN'`,
        [refundAmount],
      );

      // 복지기금(VAULT_WELFARE)에 5% 가산
      await client.query(
        `UPDATE public.system_treasury_vaults 
         SET balance_wld = (balance_wld::numeric + $1)::text, updated_at = NOW() 
         WHERE code = 'VAULT_WELFARE'`,
        [welfarePenalty],
      );

      // 유저 계좌로 95% 입금
      const userAccountId = await this.ensureUserCashAccount(client, userId);
      await client.query(
        `UPDATE public.account_balances SET available_amount = available_amount + $1 WHERE account_id = $2`,
        [refundAmount, userAccountId],
      );

      // 연금 계좌 상태를 LIQUIDATED로 변경
      const updated = await client.query<NationalPensionAccountRow>(
        `UPDATE public.national_pension_accounts
         SET status = 'LIQUIDATED',
             accumulated_contribution_wld = 0,
             hourly_payout_rate_bps = 8,
             retired_at = NULL,
             updated_at = NOW()
         WHERE id = $1
         RETURNING *`,
        [account.id],
      );
      const liquidatedAccount = updated.rows[0];
      if (!liquidatedAccount) throw new Error('해지 처리에 실패했습니다.');

      await client.query('COMMIT');

      return {
        account: liquidatedAccount,
        refundAmountWld: refundAmount,
        welfareContributionWld: welfarePenalty,
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async distributeHourlyPensionPayouts() {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // 은퇴 수령 중인 계좌 조회
      const pensionersRes = await client.query<NationalPensionAccountRow>(
        `SELECT * FROM public.national_pension_accounts 
         WHERE status = 'RETIRED_RECEIVING' AND accumulated_contribution_wld > 0
         FOR UPDATE`,
      );

      if (pensionersRes.rows.length === 0) {
        await client.query('COMMIT');
        return {
          totalPayoutAmount: 0,
          pensionersCount: 0,
        };
      }

      let totalPaid = 0;
      for (const p of pensionersRes.rows) {
        const accumulated = Number(p.accumulated_contribution_wld);
        const bps = Number(p.hourly_payout_rate_bps || 8);
        const hourlyPayout = Math.max(1, Math.floor((accumulated * bps) / 10000));

        // 유저 지갑으로 지급
        const userAccountId = await this.ensureUserCashAccount(client, p.user_id);
        await client.query(
          `UPDATE public.account_balances SET available_amount = available_amount + $1 WHERE account_id = $2`,
          [hourlyPayout, userAccountId],
        );

        // 연금 계좌 누적 수령액 갱신
        await client.query(
          `UPDATE public.national_pension_accounts 
           SET total_payout_received_wld = total_payout_received_wld + $1,
               last_payout_at = NOW(),
               updated_at = NOW()
           WHERE id = $2`,
          [hourlyPayout, p.id],
        );

        // 지급 이력 기록
        await client.query(
          `INSERT INTO public.national_pension_payout_logs (account_id, user_id, payout_amount_wld, snapshot_accumulated_wld)
           VALUES ($1, $2, $3, $4)`,
          [p.id, p.user_id, hourlyPayout, accumulated],
        );

        totalPaid += hourlyPayout;
      }

      // 국고(VAULT_MAIN)에서 총 연금 지급액 차감
      if (totalPaid > 0) {
        await client.query(
          `UPDATE public.system_treasury_vaults 
           SET balance_wld = GREATEST(0, (balance_wld::numeric - $1))::text, updated_at = NOW() 
           WHERE code = 'VAULT_MAIN'`,
          [totalPaid],
        );
      }

      await client.query('COMMIT');

      return {
        totalPayoutAmount: totalPaid,
        pensionersCount: pensionersRes.rows.length,
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async listContributions(userId: string, limit = 20): Promise<NationalPensionContributionRow[]> {
    const res = await this.pool.query<NationalPensionContributionRow>(
      `SELECT * FROM public.national_pension_contributions WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2`,
      [userId, limit],
    );
    return res.rows;
  }

  async listPayoutLogs(userId: string, limit = 20): Promise<NationalPensionPayoutLogRow[]> {
    const res = await this.pool.query<NationalPensionPayoutLogRow>(
      `SELECT * FROM public.national_pension_payout_logs WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2`,
      [userId, limit],
    );
    return res.rows;
  }

  async listRecentPayoutLogs(limit = 20): Promise<NationalPensionPayoutLogRow[]> {
    const res = await this.pool.query<NationalPensionPayoutLogRow>(
      `SELECT * FROM public.national_pension_payout_logs ORDER BY created_at DESC LIMIT $1`,
      [limit],
    );
    return res.rows;
  }
}
