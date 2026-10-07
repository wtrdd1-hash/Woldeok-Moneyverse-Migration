import { Inject, Injectable, Logger } from '@nestjs/common';
import type { Pool, PoolClient } from 'pg';
import { PG_POOL } from '../../core/pool.provider';

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
      FROM public.treasury_bonds
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
      FROM public.treasury_bonds
      WHERE id = $1
    `, [id]);
    return res.rows[0] ?? null;
  }

  async getOverview(): Promise<TreasuryBondsOverview> {
    const [bondsRes, holdingsRes, couponsRes, repoRes] = await Promise.all([
      this.pool.query<{ count: string; total_funded: string }>(`
        SELECT COUNT(*)::text as count, COALESCE(SUM(total_funded_wld), 0)::text as total_funded
        FROM public.treasury_bonds
        WHERE status = 'OPEN_SUBSCRIPTION' OR status = 'TRADING'
      `),
      this.pool.query<{ count: string }>(`
        SELECT COUNT(DISTINCT user_id)::text as count
        FROM public.treasury_bond_holdings
        WHERE status = 'HOLDING'
      `),
      this.pool.query<{ total: string }>(`
        SELECT COALESCE(SUM(amount_wld), 0)::text as total
        FROM public.treasury_bond_coupon_logs
      `),
      this.pool.query<{ total: string }>(`
        SELECT COALESCE(SUM(principal_wld), 0)::text as total
        FROM public.treasury_bond_repo_loans
        WHERE status = 'ACTIVE'
      `),
    ]);

    const bonds = await this.listBonds();
    const b1Y = bonds.find(b => b.symbol === 'KTB-01Y')?.annual_coupon_rate_bps ?? 450;
    const b3Y = bonds.find(b => b.symbol === 'KTB-03Y')?.annual_coupon_rate_bps ?? 520;
    const b5Y = bonds.find(b => b.symbol === 'KTB-05Y')?.annual_coupon_rate_bps ?? 650;

    return {
      totalBondsActive: Number(bondsRes.rows[0]?.count ?? '0'),
      totalFundedWld: bondsRes.rows[0]?.total_funded ?? '0',
      totalHoldersCount: Number(holdingsRes.rows[0]?.count ?? '0'),
      totalCouponsPaidWld: couponsRes.rows[0]?.total ?? '0',
      totalRepoLoansWld: repoRes.rows[0]?.total ?? '0',
      benchmark1YYield: `${(b1Y / 100).toFixed(2)}%`,
      benchmark3YYield: `${(b3Y / 100).toFixed(2)}%`,
      benchmark5YYield: `${(b5Y / 100).toFixed(2)}%`,
    };
  }

  async listUserHoldings(userId: string): Promise<BondHoldingRow[]> {
    const res = await this.pool.query<BondHoldingRow>(`
      SELECT
        h.id, h.user_id, h.bond_id,
        b.symbol AS bond_symbol,
        b.name AS bond_name,
        h.units::text,
        b.par_value_wld::text,
        h.purchase_price_total_wld::text,
        h.accrued_interest_wld::text,
        b.hourly_coupon_rate_bps,
        b.annual_coupon_rate_bps,
        h.purchased_at::text,
        h.maturity_at::text,
        h.status,
        h.auto_rollover,
        h.collateral_locked,
        GREATEST(0, ROUND(EXTRACT(EPOCH FROM (h.maturity_at - now())) / 3600))::int AS hours_left
      FROM public.treasury_bond_holdings h
      JOIN public.treasury_bonds b ON b.id = h.bond_id
      WHERE h.user_id = $1
      ORDER BY h.purchased_at DESC
    `, [userId]);
    return res.rows;
  }

  async listUserRepoLoans(userId: string): Promise<BondRepoLoanRow[]> {
    const res = await this.pool.query<BondRepoLoanRow>(`
      SELECT
        l.id, l.holding_id, l.user_id,
        b.name AS bond_name, b.symbol AS bond_symbol,
        l.principal_wld::text, l.annual_interest_rate_bps,
        l.accrued_interest_wld::text, l.ltv_percent,
        l.status, l.created_at::text
      FROM public.treasury_bond_repo_loans l
      JOIN public.treasury_bond_holdings h ON h.id = l.holding_id
      JOIN public.treasury_bonds b ON b.id = h.bond_id
      WHERE l.user_id = $1
      ORDER BY l.created_at DESC
    `, [userId]);
    return res.rows;
  }

  async listRecentCouponLogs(limit = 20): Promise<BondCouponLogRow[]> {
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
    userId: string,
    bondId: string,
    units: number,
  ): Promise<{
    holdingId: string;
    totalPriceWld: string;
    maturityAt: string;
  }> {
    if (units <= 0) throw new Error('청약 좌수는 1좌 이상이어야 합니다.');

    const client: PoolClient = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const bondRes = await client.query<TreasuryBondRow>(`
        SELECT * FROM public.treasury_bonds WHERE id = $1 FOR UPDATE
      `, [bondId]);
      const bond = bondRes.rows[0];
      if (!bond) throw new Error('존재하지 않는 국채입니다.');
      if (bond.status !== 'OPEN_SUBSCRIPTION' && bond.status !== 'TRADING') {
        throw new Error('현재 청약이 마감되었거나 일시 정지된 국채입니다.');
      }
      if (BigInt(bond.available_units) < BigInt(units)) {
        throw new Error(`청약 잔여 좌수가 부족합니다. (잔여: ${bond.available_units}좌)`);
      }

      const parValue = BigInt(bond.par_value_wld);
      const totalPrice = parValue * BigInt(units);

      // 계좌 확인 및 잔액 조회
      const accountId = await this.ensureUserCashAccount(client, userId);
      const balRes = await client.query<{ available_amount: string }>(`
        SELECT available_amount::text FROM public.account_balances WHERE account_id = $1 FOR UPDATE
      `, [accountId]);
      const currentBal = BigInt(balRes.rows[0]?.available_amount ?? '0');
      if (currentBal < totalPrice) {
        throw new Error('계좌 잔액(WLD)이 부족합니다.');
      }

      // 잔액 차감
      await client.query(`
        UPDATE public.account_balances
        SET available_amount = available_amount - $1, updated_at = now()
        WHERE account_id = $2
      `, [totalPrice.toString(), accountId]);

      // 중앙 국고(VAULT_MAIN) 자금 증액
      const vaultRes = await client.query<{ id: string; balance_wld: string }>(`
        SELECT id, balance_wld FROM public.system_treasury_vaults WHERE code = 'VAULT_MAIN' FOR UPDATE
      `);
      const mainVault = vaultRes.rows[0];
      if (mainVault) {
        const prevBal = BigInt(mainVault.balance_wld);
        const nextBal = prevBal + totalPrice;

        await client.query(`
          UPDATE public.system_treasury_vaults
          SET balance_wld = $1, updated_at = now()
          WHERE id = $2
        `, [nextBal.toString(), mainVault.id]);

        await client.query(`
          INSERT INTO public.system_treasury_ledger (
            vault_id, tx_type, amount_wld, actor_id, reason, balance_before, balance_after
          ) VALUES (
            $1, 'TAX_COLLECTION', $2, $3, $4, $5, $6
          )
        `, [
          mainVault.id,
          totalPrice.toString(),
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId) ? userId : null,
          `[국채 청약 자금 조달] ${bond.name} (${bond.symbol}) ${units}좌 청약 국고 귀속`,
          prevBal.toString(),
          nextBal.toString(),
        ]);
      }

      // 국채 발행 잔여량 차감
      await client.query(`
        UPDATE public.treasury_bonds
        SET
          available_units = available_units - $1,
          total_funded_wld = total_funded_wld + $2,
          updated_at = now()
        WHERE id = $3
      `, [units, totalPrice.toString(), bondId]);

      // 국채 보유 원장 등록
      const maturityInterval = `${bond.maturity_hours} hours`;
      const holdingRes = await client.query<{ id: string; maturity_at: string }>(`
        INSERT INTO public.treasury_bond_holdings (
          user_id, bond_id, units, purchase_price_total_wld, accrued_interest_wld, maturity_at
        ) VALUES (
          $1, $2, $3, $4, 0, now() + interval '${maturityInterval}'
        ) RETURNING id, maturity_at::text
      `, [userId, bondId, units, totalPrice.toString()]);

      await client.query('COMMIT');

      const created = holdingRes.rows[0];
      if (!created) throw new Error('국채 보유 원장 등록에 실패했습니다.');

      return {
        holdingId: created.id,
        totalPriceWld: totalPrice.toString(),
        maturityAt: created.maturity_at,
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * 국채 담보 저리 대출 (Repo Loan) 신청
   * 국채 원금의 80% LTV 한도로 긴급 현금 대출 집행
   */
  async createRepoLoan(
    userId: string,
    holdingId: string,
  ): Promise<{
    loanId: string;
    loanAmountWld: string;
  }> {
    const client: PoolClient = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const holdingRes = await client.query<{
        id: string;
        user_id: string;
        units: string;
        par_value_wld: string;
        purchase_price_total_wld: string;
        collateral_locked: boolean;
        status: string;
      }>(`
        SELECT h.*, b.par_value_wld::text
        FROM public.treasury_bond_holdings h
        JOIN public.treasury_bonds b ON b.id = h.bond_id
        WHERE h.id = $1 AND h.user_id = $2 FOR UPDATE
      `, [holdingId, userId]);

      const holding = holdingRes.rows[0];
      if (!holding) throw new Error('해당 국채 보유 원장을 찾을 수 없습니다.');
      if (holding.status !== 'HOLDING') throw new Error('만기 또는 매도된 국채는 담보로 제공할 수 없습니다.');
      if (holding.collateral_locked) throw new Error('이미 대출 담보로 잠겨있는 채권입니다.');

      const principalValue = BigInt(holding.units) * BigInt(holding.par_value_wld);
      // LTV 80%
      const loanAmount = (principalValue * BigInt(80)) / BigInt(100);

      // 담보 잠금
      await client.query(`
        UPDATE public.treasury_bond_holdings SET collateral_locked = true, updated_at = now() WHERE id = $1
      `, [holdingId]);

      // 대출 계좌 입금
      const accountId = await this.ensureUserCashAccount(client, userId);
      await client.query(`
        UPDATE public.account_balances
        SET available_amount = available_amount + $1, updated_at = now()
        WHERE account_id = $2
      `, [loanAmount.toString(), accountId]);

      // 레포 대출 계약서 등록
      const loanRes = await client.query<{ id: string }>(`
        INSERT INTO public.treasury_bond_repo_loans (
          holding_id, user_id, principal_wld, annual_interest_rate_bps, hourly_interest_rate_bps, ltv_percent, status
        ) VALUES (
          $1, $2, $3, 250, 3, 80, 'ACTIVE'
        ) RETURNING id
      `, [holdingId, userId, loanAmount.toString()]);

      await client.query('COMMIT');

      const createdLoan = loanRes.rows[0];
      if (!createdLoan) throw new Error('레포 대출 계약 생성에 실패했습니다.');

      return {
        loanId: createdLoan.id,
        loanAmountWld: loanAmount.toString(),
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * 국채 담보 대출 상환
   */
  async repayRepoLoan(
    userId: string,
    loanId: string,
  ): Promise<{
    repaidAmountWld: string;
  }> {
    const client: PoolClient = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const loanRes = await client.query<{
        id: string;
        holding_id: string;
        user_id: string;
        principal_wld: string;
        accrued_interest_wld: string;
        status: string;
      }>(`
        SELECT * FROM public.treasury_bond_repo_loans WHERE id = $1 AND user_id = $2 FOR UPDATE
      `, [loanId, userId]);

      const loan = loanRes.rows[0];
      if (!loan) throw new Error('대출 계약을 찾을 수 없습니다.');
      if (loan.status !== 'ACTIVE') throw new Error('이미 상환된 대출입니다.');

      const totalRepay = BigInt(loan.principal_wld) + BigInt(loan.accrued_interest_wld);

      // 계좌 잔액 확인 및 차감
      const accountId = await this.ensureUserCashAccount(client, userId);
      const balRes = await client.query<{ available_amount: string }>(`
        SELECT available_amount::text FROM public.account_balances WHERE account_id = $1 FOR UPDATE
      `, [accountId]);
      const currentBal = BigInt(balRes.rows[0]?.available_amount ?? '0');
      if (currentBal < totalRepay) throw new Error('대출 상환을 위한 계좌 잔액이 부족합니다.');

      await client.query(`
        UPDATE public.account_balances SET available_amount = available_amount - $1, updated_at = now() WHERE account_id = $2
      `, [totalRepay.toString(), accountId]);

      // 대출 상태 REPAID 및 담보 잠금 해제
      await client.query(`
        UPDATE public.treasury_bond_repo_loans SET status = 'REPAID', updated_at = now() WHERE id = $1
      `, [loanId]);

      await client.query(`
        UPDATE public.treasury_bond_holdings SET collateral_locked = false, updated_at = now() WHERE id = $1
      `, [loan.holding_id]);

      await client.query('COMMIT');

      return {
        repaidAmountWld: totalRepay.toString(),
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
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
    const client: PoolClient = await this.pool.connect();
    let totalCoupons = BigInt(0);
    let totalMaturities = BigInt(0);
    let holdingsProcessed = 0;
    let maturedCount = 0;

    try {
      await client.query('BEGIN');

      const holdings = await client.query<{
        holding_id: string;
        user_id: string;
        bond_id: string;
        bond_symbol: string;
        bond_name: string;
        units: string;
        par_value_wld: string;
        hourly_coupon_rate_bps: number;
        auto_rollover: boolean;
        collateral_locked: boolean;
        maturity_at: string;
        maturity_hours: number;
        is_matured: boolean;
      }>(`
        SELECT
          h.id AS holding_id,
          h.user_id,
          h.bond_id,
          b.symbol AS bond_symbol,
          b.name AS bond_name,
          h.units::text,
          b.par_value_wld::text,
          b.hourly_coupon_rate_bps,
          b.maturity_hours,
          h.auto_rollover,
          h.collateral_locked,
          h.maturity_at::text,
          (h.maturity_at <= now()) AS is_matured
        FROM public.treasury_bond_holdings h
        JOIN public.treasury_bonds b ON b.id = h.bond_id
        WHERE h.status = 'HOLDING'
        FOR UPDATE
      `);

      for (const h of holdings.rows) {
        holdingsProcessed++;
        const units = BigInt(h.units);
        const par = BigInt(h.par_value_wld);
        const principal = units * par;

        // 쿠폰 이자
        const coupon = (principal * BigInt(h.hourly_coupon_rate_bps)) / BigInt(10000);

        if (coupon > BigInt(0)) {
          totalCoupons += coupon;

          const accountId = await this.ensureUserCashAccount(client, h.user_id);
          await client.query(`
            UPDATE public.account_balances
            SET available_amount = available_amount + $1, updated_at = now()
            WHERE account_id = $2
          `, [coupon.toString(), accountId]);

          await client.query(`
            UPDATE public.treasury_bond_holdings
            SET accrued_interest_wld = accrued_interest_wld + $1, updated_at = now()
            WHERE id = $2
          `, [coupon.toString(), h.holding_id]);

          await client.query(`
            INSERT INTO public.treasury_bond_coupon_logs (
              holding_id, user_id, bond_id, event_type, amount_wld
            ) VALUES (
              $1, $2, $3, 'COUPON_INTEREST', $4
            )
          `, [h.holding_id, h.user_id, h.bond_id, coupon.toString()]);
        }

        // 만기 도달 시 상환 또는 자동 롤오버
        if (h.is_matured) {
          maturedCount++;

          if (h.auto_rollover && !h.collateral_locked) {
            // 자동 재투자: 만기 연장
            const rolloverInterval = `${h.maturity_hours} hours`;
            await client.query(`
              UPDATE public.treasury_bond_holdings
              SET maturity_at = now() + interval '${rolloverInterval}', updated_at = now()
              WHERE id = $1
            `, [h.holding_id]);
          } else {
            // 원금 상환
            totalMaturities += principal;
            const accountId = await this.ensureUserCashAccount(client, h.user_id);
            await client.query(`
              UPDATE public.account_balances
              SET available_amount = available_amount + $1, updated_at = now()
              WHERE account_id = $2
            `, [principal.toString(), accountId]);

            await client.query(`
              UPDATE public.treasury_bond_holdings
              SET status = 'MATURED', updated_at = now()
              WHERE id = $1
            `, [h.holding_id]);

            await client.query(`
              INSERT INTO public.treasury_bond_coupon_logs (
                holding_id, user_id, bond_id, event_type, amount_wld
              ) VALUES (
                $1, $2, $3, 'MATURITY_REDEMPTION', $4
              )
            `, [h.holding_id, h.user_id, h.bond_id, principal.toString()]);
          }
        }
      }

      await client.query('COMMIT');

      return {
        couponsDistributedWld: totalCoupons.toString(),
        maturitiesRedeemedWld: totalMaturities.toString(),
        holdingsProcessed,
        maturedCount,
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
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
