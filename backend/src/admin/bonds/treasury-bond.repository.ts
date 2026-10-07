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

export interface TreasuryBondsOverview {
  totalBondsActive: number;
  totalFundedWld: string;
  totalHoldersCount: number;
  totalCouponsPaidWld: string;
  benchmark1YYield: string;
  benchmark3YYield: string;
  benchmark5YYield: string;
}

@Injectable()
export class TreasuryBondRepository {
  private readonly logger = new Logger(TreasuryBondRepository.name);

  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

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
    const [bondsRes, holdingsRes, couponsRes] = await Promise.all([
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
        GREATEST(0, ROUND(EXTRACT(EPOCH FROM (h.maturity_at - now())) / 3600))::int AS hours_left
      FROM public.treasury_bond_holdings h
      JOIN public.treasury_bonds b ON b.id = h.bond_id
      WHERE h.user_id = $1
      ORDER BY h.purchased_at DESC
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

  /**
   * 국채 청약(매수) 트랜잭션: 유저 지갑 차감 -> 국채 발행 잔여량 차감 -> 국고(VAULT_MAIN) 입금
   */
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

      // 1. 국채 조회 및 락
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

      // 2. 유저 지갑 잔액 조회 및 차감
      const walletRes = await client.query<{ balance_wld: string }>(`
        SELECT balance_wld::text FROM public.wallets WHERE user_id = $1 FOR UPDATE
      `, [userId]);
      const userWallet = walletRes.rows[0];
      if (!userWallet || BigInt(userWallet.balance_wld) < totalPrice) {
        throw new Error('지갑 잔액(WLD)이 부족합니다.');
      }

      await client.query(`
        UPDATE public.wallets
        SET balance_wld = (balance_wld::numeric - $1)::text, updated_at = now()
        WHERE user_id = $2
      `, [totalPrice.toString(), userId]);

      // 3. 중앙 국고(VAULT_MAIN) 잔액 증액
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

      // 4. 국채 가용 좌수 차감 및 조달액 증가
      await client.query(`
        UPDATE public.treasury_bonds
        SET
          available_units = available_units - $1,
          total_funded_wld = total_funded_wld + $2,
          updated_at = now()
        WHERE id = $3
      `, [units, totalPrice.toString(), bondId]);

      // 5. 국채 보유 원장 등록
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
      if (!created) {
        throw new Error('국채 보유 원장 등록에 실패했습니다.');
      }

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
   * 전 유저 국채 쿠폰 이자 일괄 지급 및 만기 상환 엔진 (1시간 복리 사이클 결합)
   */
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

      // 1. 활성 보유 채권 목록 조회
      const holdings = await client.query<{
        holding_id: string;
        user_id: string;
        bond_id: string;
        bond_symbol: string;
        bond_name: string;
        units: string;
        par_value_wld: string;
        purchase_price_total_wld: string;
        hourly_coupon_rate_bps: number;
        maturity_at: string;
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
          h.purchase_price_total_wld::text,
          b.hourly_coupon_rate_bps,
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

        // 시간당 쿠폰 이자 계산: principal * hourly_coupon_rate_bps / 10000
        const coupon = (principal * BigInt(h.hourly_coupon_rate_bps)) / BigInt(10000);

        if (coupon > BigInt(0)) {
          totalCoupons += coupon;

          // 유저 지갑에 쿠폰 이자 입금
          await client.query(`
            UPDATE public.wallets
            SET balance_wld = (balance_wld::numeric + $1)::text, updated_at = now()
            WHERE user_id = $2
          `, [coupon.toString(), h.user_id]);

          // 누적 이자 업데이트
          await client.query(`
            UPDATE public.treasury_bond_holdings
            SET accrued_interest_wld = accrued_interest_wld + $1, updated_at = now()
            WHERE id = $2
          `, [coupon.toString(), h.holding_id]);

          // 이자 지급 로그
          await client.query(`
            INSERT INTO public.treasury_bond_coupon_logs (
              holding_id, user_id, bond_id, event_type, amount_wld
            ) VALUES (
              $1, $2, $3, 'COUPON_INTEREST', $4
            )
          `, [h.holding_id, h.user_id, h.bond_id, coupon.toString()]);
        }

        // 만기 도달 시 원금 상환 (Maturity Redemption)
        if (h.is_matured) {
          maturedCount++;
          totalMaturities += principal;

          // 원금 반환
          await client.query(`
            UPDATE public.wallets
            SET balance_wld = (balance_wld::numeric + $1)::text, updated_at = now()
            WHERE user_id = $2
          `, [principal.toString(), h.user_id]);

          // 보유 채권 상태 MATURED 변경
          await client.query(`
            UPDATE public.treasury_bond_holdings
            SET status = 'MATURED', updated_at = now()
            WHERE id = $1
          `, [h.holding_id]);

          // 상환 로그
          await client.query(`
            INSERT INTO public.treasury_bond_coupon_logs (
              holding_id, user_id, bond_id, event_type, amount_wld
            ) VALUES (
              $1, $2, $3, 'MATURITY_REDEMPTION', $4
            )
          `, [h.holding_id, h.user_id, h.bond_id, principal.toString()]);
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
