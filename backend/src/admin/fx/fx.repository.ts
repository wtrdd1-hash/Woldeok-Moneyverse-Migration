import { Injectable, Logger } from '@nestjs/common';
import { Pool, PoolClient } from 'pg';

export interface FxReserveStatus {
  id: string;
  reserveName: string;
  currency: string;
  totalReservesUsd: number;
  targetAnchorRate: number;
  currentRate: number;
  isHalted: boolean;
  totalInterventionsCount: number;
  totalIntervenedUsd: number;
  updatedAt: string;
}

export interface FxRatePoint {
  id: string;
  rate: number;
  changePct: number;
  volumeUsd: number;
  interventionType: string;
  note: string | null;
  createdAt: string;
}

export interface FxWallet {
  id: string;
  userId: string;
  usdBalance: number;
  totalSwappedWldIn: number;
  totalSwappedUsdOut: number;
  usdSavingsInterestEarned: number;
  updatedAt: string;
}

export interface FxTransaction {
  id: string;
  userId: string;
  displayName?: string;
  transactionType: string;
  fromCurrency: string;
  toCurrency: string;
  fromAmount: number;
  toAmount: number;
  appliedRate: number;
  feeWld: number;
  createdAt: string;
}

export interface SdrAssetAllocation {
  id: string;
  assetName: string;
  assetType: string;
  allocationWeightPct: number;
  holdingAmount: number;
  unit: string;
  usdValue: number;
  updatedAt: string;
}

export interface CurrencySwapAgreement {
  id: string;
  counterparty: string;
  totalFacilityUsd: number;
  drawnAmountUsd: number;
  availableFacilityUsd: number;
  status: string;
  interestRatePct: number;
  effectiveDate: string;
  expiryDate: string;
  updatedAt: string;
}

export interface FxForwardContract {
  id: string;
  userId: string;
  displayName?: string;
  position: 'BUY_USD' | 'SELL_USD';
  tenor: '1M' | '3M' | '6M';
  contractAmountUsd: number;
  contractRate: number;
  spotRateAtContract: number;
  marginWld: number;
  maturityDate: string;
  settlementRate: number | null;
  realizedPnlWld: number | null;
  status: 'ACTIVE' | 'SETTLED' | 'CANCELLED';
  createdAt: string;
  settledAt: string | null;
}

export interface FxEarlyWarning {
  fsiScore: number;
  stage: 'NORMAL' | 'WATCH' | 'CAUTION' | 'EMERGENCY';
  triggerReason: string;
  currentSpotRate: number;
}

@Injectable()
export class FxRepository {
  private readonly logger = new Logger(FxRepository.name);

  constructor(private readonly pool: Pool) {}

  async getReserveStatus(): Promise<FxReserveStatus> {
    const res = await this.pool.query(`
      SELECT 
        id,
        reserve_name AS "reserveName",
        currency,
        total_reserves_usd::float AS "totalReservesUsd",
        target_anchor_rate::float AS "targetAnchorRate",
        current_rate::float AS "currentRate",
        is_halted AS "isHalted",
        total_interventions_count AS "totalInterventionsCount",
        total_intervened_usd::float AS "totalIntervenedUsd",
        updated_at AS "updatedAt"
      FROM public.foreign_exchange_reserves
      LIMIT 1;
    `);

    if (res.rows.length === 0) {
      throw new Error('외환보유액 마스터 원장이 존재하지 않습니다.');
    }
    return res.rows[0];
  }

  async getLatestRate(): Promise<number> {
    const res = await this.pool.query(`
      SELECT current_rate::float AS rate 
      FROM public.foreign_exchange_reserves 
      LIMIT 1;
    `);
    return res.rows[0]?.rate ?? 1350.0;
  }

  async getRateHistory(limit: number = 30): Promise<FxRatePoint[]> {
    const res = await this.pool.query(`
      SELECT 
        id,
        rate::float AS rate,
        change_pct::float AS "changePct",
        volume_usd::float AS "volumeUsd",
        intervention_type AS "interventionType",
        note,
        created_at AS "createdAt"
      FROM public.foreign_exchange_rates
      ORDER BY created_at DESC
      LIMIT $1;
    `, [limit]);

    return res.rows.reverse();
  }

  async getOrCreateUserWallet(userId: string): Promise<FxWallet> {
    const existing = await this.pool.query(`
      SELECT 
        id,
        user_id AS "userId",
        usd_balance::float AS "usdBalance",
        total_swapped_wld_in::float AS "totalSwappedWldIn",
        total_swapped_usd_out::float AS "totalSwappedUsdOut",
        usd_savings_interest_earned::float AS "usdSavingsInterestEarned",
        updated_at AS "updatedAt"
      FROM public.foreign_exchange_wallets
      WHERE user_id = $1;
    `, [userId]);

    if (existing.rows.length > 0) {
      return existing.rows[0];
    }

    const inserted = await this.pool.query(`
      INSERT INTO public.foreign_exchange_wallets (user_id, usd_balance)
      VALUES ($1, 0.00)
      ON CONFLICT (user_id) DO UPDATE SET updated_at = now()
      RETURNING 
        id,
        user_id AS "userId",
        usd_balance::float AS "usdBalance",
        total_swapped_wld_in::float AS "totalSwappedWldIn",
        total_swapped_usd_out::float AS "totalSwappedUsdOut",
        usd_savings_interest_earned::float AS "usdSavingsInterestEarned",
        updated_at AS "updatedAt";
    `, [userId]);

    return inserted.rows[0];
  }

  async setHalt(isHalted: boolean): Promise<boolean> {
    const res = await this.pool.query(`
      UPDATE public.foreign_exchange_reserves
      SET is_halted = $1, updated_at = now()
      RETURNING is_halted;
    `, [isHalted]);
    return res.rows[0]?.is_halted ?? false;
  }

  async swapWldToUsd(
    userId: string,
    wldAmount: number
  ): Promise<{ usdCredited: number; feeWld: number; appliedRate: number }> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const reserveRes = await client.query(`
        SELECT id, total_reserves_usd::float AS reserves, current_rate::float AS rate, is_halted 
        FROM public.foreign_exchange_reserves 
        FOR UPDATE;
      `);
      const reserve = reserveRes.rows[0];
      if (!reserve || reserve.is_halted) {
        throw new Error('외환시장이 현재 일시 정지(Halt) 상태입니다.');
      }

      const appliedRate = reserve.rate;
      const feeWld = Math.round(wldAmount * 0.002); // 0.2% 외환거래세
      const netWld = wldAmount - feeWld;
      const rawUsd = netWld / appliedRate;
      const usdCredited = Math.floor(rawUsd * 100) / 100; // 소수점 2자리

      if (usdCredited <= 0) {
        throw new Error('환전 가능한 최소 달러 금액 미만입니다.');
      }
      if (reserve.reserves < usdCredited) {
        throw new Error('중앙은행 외환보유액 유동성이 부족하여 환전할 수 없습니다.');
      }

      // 1. 유저 WLD 차감
      const balCheck = await client.query(`
        SELECT ab.available_balance::float AS balance
        FROM public.accounts a
        JOIN public.account_balances ab ON ab.account_id = a.id
        WHERE a.user_id = $1 AND a.account_type = 'USER_CASH'
        FOR UPDATE;
      `, [userId]);

      if (!balCheck.rows[0] || balCheck.rows[0].balance < wldAmount) {
        throw new Error(`보유 WLD 잔액이 부족합니다. (필요: ${wldAmount.toLocaleString()} WLD)`);
      }

      await client.query(`
        UPDATE public.account_balances ab
        SET available_balance = available_balance - $2,
            updated_at = now()
        FROM public.accounts a
        WHERE a.id = ab.account_id AND a.user_id = $1 AND a.account_type = 'USER_CASH';
      `, [userId, wldAmount]);

      // 2. 외환거래세 0.2% 국고 입금
      if (feeWld > 0) {
        await client.query(`
          UPDATE public.system_treasury_vaults
          SET balance_wld = balance_wld + $1, updated_at = now()
          WHERE code = 'VAULT_MAIN';
        `, [feeWld]);
      }

      // 3. 외환보유액 달러 차감
      await client.query(`
        UPDATE public.foreign_exchange_reserves
        SET total_reserves_usd = total_reserves_usd - $1, updated_at = now();
      `, [usdCredited]);

      // 4. 유저 외화 지갑 USD 가산
      await client.query(`
        INSERT INTO public.foreign_exchange_wallets (user_id, usd_balance, total_swapped_wld_in)
        VALUES ($1, $2, $3)
        ON CONFLICT (user_id) DO UPDATE SET
          usd_balance = public.foreign_exchange_wallets.usd_balance + $2,
          total_swapped_wld_in = public.foreign_exchange_wallets.total_swapped_wld_in + $3,
          updated_at = now();
      `, [userId, usdCredited, wldAmount]);

      // 5. 트랜잭션 기록
      await client.query(`
        INSERT INTO public.foreign_exchange_transactions (
          user_id, transaction_type, from_currency, to_currency, from_amount, to_amount, applied_rate, fee_wld
        ) VALUES ($1, 'BUY_USD', 'WLD', 'USD', $2, $3, $4, $5);
      `, [userId, wldAmount, usdCredited, appliedRate, feeWld]);

      await client.query('COMMIT');
      return { usdCredited, feeWld, appliedRate };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async swapUsdToWld(
    userId: string,
    usdAmount: number
  ): Promise<{ wldCredited: number; feeWld: number; appliedRate: number }> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const reserveRes = await client.query(`
        SELECT current_rate::float AS rate, is_halted 
        FROM public.foreign_exchange_reserves 
        FOR UPDATE;
      `);
      const reserve = reserveRes.rows[0];
      if (!reserve || reserve.is_halted) {
        throw new Error('외환시장이 현재 일시 정지(Halt) 상태입니다.');
      }

      const appliedRate = reserve.rate;
      const walletRes = await client.query(`
        SELECT usd_balance::float AS balance
        FROM public.foreign_exchange_wallets
        WHERE user_id = $1
        FOR UPDATE;
      `, [userId]);

      if (!walletRes.rows[0] || walletRes.rows[0].balance < usdAmount) {
        throw new Error(`보유 USD 잔액이 부족합니다. (필요: $${usdAmount.toLocaleString()})`);
      }

      const grossWld = Math.floor(usdAmount * appliedRate);
      const feeWld = Math.round(grossWld * 0.002); // 0.2% 외환거래세
      const wldCredited = grossWld - feeWld;

      // 1. 유저 외화 지갑 USD 차감
      await client.query(`
        UPDATE public.foreign_exchange_wallets
        SET usd_balance = usd_balance - $2,
            total_swapped_usd_out = total_swapped_usd_out + $2,
            updated_at = now()
        WHERE user_id = $1;
      `, [userId, usdAmount]);

      // 2. 외환보유액 달러 확충
      await client.query(`
        UPDATE public.foreign_exchange_reserves
        SET total_reserves_usd = total_reserves_usd + $1, updated_at = now();
      `, [usdAmount]);

      // 3. 외환거래세 국고 입금
      if (feeWld > 0) {
        await client.query(`
          UPDATE public.system_treasury_vaults
          SET balance_wld = balance_wld + $1, updated_at = now()
          WHERE code = 'VAULT_MAIN';
        `, [feeWld]);
      }

      // 4. 유저 WLD 입금
      await client.query(`
        UPDATE public.account_balances ab
        SET available_balance = available_balance + $2,
            updated_at = now()
        FROM public.accounts a
        WHERE a.id = ab.account_id AND a.user_id = $1 AND a.account_type = 'USER_CASH';
      `, [userId, wldCredited]);

      // 5. 트랜잭션 기록
      await client.query(`
        INSERT INTO public.foreign_exchange_transactions (
          user_id, transaction_type, from_currency, to_currency, from_amount, to_amount, applied_rate, fee_wld
        ) VALUES ($1, 'SELL_USD', 'USD', 'WLD', $2, $3, $4, $5);
      `, [userId, usdAmount, wldCredited, appliedRate, feeWld]);

      await client.query('COMMIT');
      return { wldCredited, feeWld, appliedRate };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async executeSmoothingIntervention(
    type: 'SELL_USD' | 'BUY_USD',
    amountUsd: number,
    adminId: string
  ): Promise<{ newRate: number; newReservesUsd: number }> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const reserveRes = await client.query(`
        SELECT id, current_rate::float AS rate, total_reserves_usd::float AS reserves
        FROM public.foreign_exchange_reserves
        FOR UPDATE;
      `);
      const reserve = reserveRes.rows[0];

      let newRate = reserve.rate;
      let newReserves = reserve.reserves;

      if (type === 'SELL_USD') {
        // 달러 매도 개입: 달러 방출로 WLD 가치 방어 (환율 하락: -25.0 WLD)
        if (reserve.reserves < amountUsd) {
          throw new Error('개입에 필요한 외환보유액이 부족합니다.');
        }
        newReserves -= amountUsd;
        newRate = Math.max(1280.0, reserve.rate - 25.0);
      } else {
        // 달러 매수 개입: 달러 흡수로 외환보유액 확충 (환율 상승: +20.0 WLD)
        newReserves += amountUsd;
        newRate = Math.min(1450.0, reserve.rate + 20.0);
      }

      await client.query(`
        UPDATE public.foreign_exchange_reserves
        SET 
          current_rate = $1,
          total_reserves_usd = $2,
          total_interventions_count = total_interventions_count + 1,
          total_intervened_usd = total_intervened_usd + $3,
          updated_at = now();
      `, [newRate, newReserves, amountUsd]);

      // 틱 기록
      const changePct = ((newRate - reserve.rate) / reserve.rate) * 100;
      await client.query(`
        INSERT INTO public.foreign_exchange_rates (rate, change_pct, volume_usd, intervention_type, note)
        VALUES ($1, $2, $3, $4, '중앙은행 외환당국 스무딩 오퍼레이션 시장개입');
      `, [newRate, changePct, amountUsd, type]);

      await client.query('COMMIT');
      return { newRate, newReservesUsd: newReserves };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async listTransactions(limit: number = 20): Promise<FxTransaction[]> {
    const res = await this.pool.query(`
      SELECT 
        t.id,
        t.user_id AS "userId",
        coalesce(mp.display_name, 'SYSTEM') AS "displayName",
        t.transaction_type AS "transactionType",
        t.from_currency AS "fromCurrency",
        t.to_currency AS "toCurrency",
        t.from_amount::float AS "fromAmount",
        t.to_amount::float AS "toAmount",
        t.applied_rate::float AS "appliedRate",
        t.fee_wld::float AS "feeWld",
        t.created_at AS "createdAt"
      FROM public.foreign_exchange_transactions t
      LEFT JOIN public.member_profiles mp ON mp.user_id = t.user_id
      ORDER BY t.created_at DESC
      LIMIT $1;
    `, [limit]);

    return res.rows;
  }

  async getSdrAllocations(): Promise<SdrAssetAllocation[]> {
    const res = await this.pool.query(`
      SELECT 
        id,
        asset_name AS "assetName",
        asset_type AS "assetType",
        allocation_weight_pct::float AS "allocationWeightPct",
        holding_amount::float AS "holdingAmount",
        unit,
        usd_value::float AS "usdValue",
        updated_at AS "updatedAt"
      FROM public.foreign_exchange_asset_allocations
      ORDER BY allocation_weight_pct DESC;
    `);
    return res.rows;
  }

  async getSwapAgreements(): Promise<CurrencySwapAgreement[]> {
    const res = await this.pool.query(`
      SELECT 
        id,
        counterparty,
        total_facility_usd::float AS "totalFacilityUsd",
        drawn_amount_usd::float AS "drawnAmountUsd",
        (total_facility_usd - drawn_amount_usd)::float AS "availableFacilityUsd",
        status,
        interest_rate_pct::float AS "interestRatePct",
        effective_date AS "effectiveDate",
        expiry_date AS "expiryDate",
        updated_at AS "updatedAt"
      FROM public.currency_swap_agreements
      ORDER BY total_facility_usd DESC;
    `);
    return res.rows;
  }

  async drawdownCurrencySwap(
    agreementId: string,
    amountUsd: number,
    adminId: string,
    purpose: string = '외환 유동성 공급 및 환율 안정화'
  ): Promise<{ agreement: CurrencySwapAgreement; newReservesUsd: number }> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const swapRes = await client.query(`
        SELECT id, counterparty, total_facility_usd::float AS total, drawn_amount_usd::float AS drawn
        FROM public.currency_swap_agreements
        WHERE id = $1
        FOR UPDATE;
      `, [agreementId]);

      if (swapRes.rows.length === 0) {
        throw new Error('해당 통화스왑 협정을 찾을 수 없습니다.');
      }

      const swap = swapRes.rows[0];
      const available = swap.total - swap.drawn;
      if (available < amountUsd) {
        throw new Error(`스왑 잔여 가용한도($${available.toLocaleString()} USD)를 초과했습니다.`);
      }

      const newDrawn = swap.drawn + amountUsd;
      await client.query(`
        UPDATE public.currency_swap_agreements
        SET drawn_amount_usd = $1, status = 'DRAWN', updated_at = now()
        WHERE id = $2;
      `, [newDrawn, agreementId]);

      // 외환보유액 가산
      const reserveRes = await client.query(`
        UPDATE public.foreign_exchange_reserves
        SET total_reserves_usd = total_reserves_usd + $1, updated_at = now()
        RETURNING total_reserves_usd::float AS reserves;
      `, [amountUsd]);

      // 인출 이력 기록
      await client.query(`
        INSERT INTO public.currency_swap_drawdowns (agreement_id, action, amount_usd, purpose, executed_by)
        VALUES ($1, 'DRAWDOWN', $2, $3, $4);
      `, [agreementId, amountUsd, purpose, adminId]);

      await client.query('COMMIT');

      const updatedAgreements = await this.getSwapAgreements();
      const updatedAgreement = updatedAgreements.find(a => a.id === agreementId)!;
      return {
        agreement: updatedAgreement,
        newReservesUsd: reserveRes.rows[0]?.reserves ?? 0,
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async createForwardContract(
    userId: string,
    position: 'BUY_USD' | 'SELL_USD',
    tenor: '1M' | '3M' | '6M',
    contractAmountUsd: number,
    contractRate: number,
    spotRate: number
  ): Promise<FxForwardContract> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // 10% 증거금(Margin) WLD 계산
      const totalContractValueWld = contractAmountUsd * contractRate;
      const marginWld = Math.round(totalContractValueWld * 0.1);

      // 잔고 확인 및 증거금 잠금 차감
      const balanceRes = await client.query(`
        SELECT ab.available_balance::float AS balance
        FROM public.accounts a
        JOIN public.account_balances ab ON ab.account_id = a.id
        WHERE a.user_id = $1 AND a.account_type = 'USER_CASH'
        FOR UPDATE;
      `, [userId]);

      const balance = balanceRes.rows[0]?.balance ?? 0;
      if (balance < marginWld) {
        throw new Error(`선물환 증거금(10%: ${marginWld.toLocaleString()} WLD)이 부족합니다. (현재 가용: ${balance.toLocaleString()} WLD)`);
      }

      await client.query(`
        UPDATE public.account_balances ab
        SET available_balance = available_balance - $2,
            updated_at = now()
        FROM public.accounts a
        WHERE a.id = ab.account_id AND a.user_id = $1 AND a.account_type = 'USER_CASH';
      `, [userId, marginWld]);

      // 만기일 계산 (1M=30일, 3M=90일, 6M=180일)
      const days = tenor === '1M' ? 30 : tenor === '3M' ? 90 : 180;
      const maturityDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

      const insertRes = await client.query(`
        INSERT INTO public.fx_forward_contracts (
          user_id, position, tenor, contract_amount_usd, contract_rate, spot_rate_at_contract, margin_wld, maturity_date, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'ACTIVE')
        RETURNING 
          id,
          user_id AS "userId",
          position,
          tenor,
          contract_amount_usd::float AS "contractAmountUsd",
          contract_rate::float AS "contractRate",
          spot_rate_at_contract::float AS "spotRateAtContract",
          margin_wld::float AS "marginWld",
          maturity_date AS "maturityDate",
          settlement_rate::float AS "settlementRate",
          realized_pnl_wld::float AS "realizedPnlWld",
          status,
          created_at AS "createdAt",
          settled_at AS "settledAt";
      `, [userId, position, tenor, contractAmountUsd, contractRate, spotRate, marginWld, maturityDate]);

      await client.query('COMMIT');
      return insertRes.rows[0];
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async getUserForwardContracts(userId: string): Promise<FxForwardContract[]> {
    const res = await this.pool.query(`
      SELECT 
        fc.id,
        fc.user_id AS "userId",
        coalesce(mp.display_name, '유저') AS "displayName",
        fc.position,
        fc.tenor,
        fc.contract_amount_usd::float AS "contractAmountUsd",
        fc.contract_rate::float AS "contractRate",
        fc.spot_rate_at_contract::float AS "spotRateAtContract",
        fc.margin_wld::float AS "marginWld",
        fc.maturity_date AS "maturityDate",
        fc.settlement_rate::float AS "settlementRate",
        fc.realized_pnl_wld::float AS "realizedPnlWld",
        fc.status,
        fc.created_at AS "createdAt",
        fc.settled_at AS "settledAt"
      FROM public.fx_forward_contracts fc
      LEFT JOIN public.member_profiles mp ON mp.user_id = fc.user_id
      WHERE fc.user_id = $1
      ORDER BY fc.created_at DESC;
    `, [userId]);
    return res.rows;
  }

  async listAllForwardContracts(limit: number = 30): Promise<FxForwardContract[]> {
    const res = await this.pool.query(`
      SELECT 
        fc.id,
        fc.user_id AS "userId",
        coalesce(mp.display_name, '익명 유저') AS "displayName",
        fc.position,
        fc.tenor,
        fc.contract_amount_usd::float AS "contractAmountUsd",
        fc.contract_rate::float AS "contractRate",
        fc.spot_rate_at_contract::float AS "spotRateAtContract",
        fc.margin_wld::float AS "marginWld",
        fc.maturity_date AS "maturityDate",
        fc.settlement_rate::float AS "settlementRate",
        fc.realized_pnl_wld::float AS "realizedPnlWld",
        fc.status,
        fc.created_at AS "createdAt",
        fc.settled_at AS "settledAt"
      FROM public.fx_forward_contracts fc
      LEFT JOIN public.member_profiles mp ON mp.user_id = fc.user_id
      ORDER BY fc.created_at DESC
      LIMIT $1;
    `, [limit]);
    return res.rows;
  }

  async settleForwardContract(
    contractId: string,
    currentSpotRate: number
  ): Promise<{ contract: FxForwardContract; refundWld: number }> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const contractRes = await client.query(`
        SELECT 
          id, user_id, position, tenor, contract_amount_usd::float AS amount,
          contract_rate::float AS "contractRate", margin_wld::float AS margin, status
        FROM public.fx_forward_contracts
        WHERE id = $1
        FOR UPDATE;
      `, [contractId]);

      if (contractRes.rows.length === 0) {
        throw new Error('선물환 계약을 찾을 수 없습니다.');
      }
      const contract = contractRes.rows[0];
      if (contract.status !== 'ACTIVE') {
        throw new Error('이미 정산되었거나 취소된 계약입니다.');
      }

      // 손익 계산
      // BUY_USD: 만기 현물환율이 계약환율보다 높으면 이익
      // SELL_USD: 계약환율이 만기 현물환율보다 높으면 이익
      let pnlWld = 0;
      if (contract.position === 'BUY_USD') {
        pnlWld = (currentSpotRate - contract.contractRate) * contract.amount;
      } else {
        pnlWld = (contract.contractRate - currentSpotRate) * contract.amount;
      }

      pnlWld = Math.round(pnlWld);
      const refundWld = Math.max(0, contract.margin + pnlWld);

      // 계좌 환급
      await client.query(`
        UPDATE public.account_balances ab
        SET available_balance = available_balance + $2,
            updated_at = now()
        FROM public.accounts a
        WHERE a.id = ab.account_id AND a.user_id = $1 AND a.account_type = 'USER_CASH';
      `, [contract.user_id, refundWld]);

      // 상태 업데이트
      const updatedRes = await client.query(`
        UPDATE public.fx_forward_contracts
        SET 
          status = 'SETTLED',
          settlement_rate = $1,
          realized_pnl_wld = $2,
          settled_at = now()
        WHERE id = $3
        RETURNING 
          id,
          user_id AS "userId",
          position,
          tenor,
          contract_amount_usd::float AS "contractAmountUsd",
          contract_rate::float AS "contractRate",
          spot_rate_at_contract::float AS "spotRateAtContract",
          margin_wld::float AS "marginWld",
          maturity_date AS "maturityDate",
          settlement_rate::float AS "settlementRate",
          realized_pnl_wld::float AS "realizedPnlWld",
          status,
          created_at AS "createdAt",
          settled_at AS "settledAt";
      `, [currentSpotRate, pnlWld, contractId]);

      await client.query('COMMIT');
      return { contract: updatedRes.rows[0], refundWld };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  getEarlyWarningStatus(currentRate: number): FxEarlyWarning {
    // 앵커 1,350.00 대비 괴리율 및 변동성 평가
    const deviation = Math.abs(currentRate - 1350.0);
    let fsiScore = Math.min(100, Math.round((deviation / 80.0) * 100));

    let stage: 'NORMAL' | 'WATCH' | 'CAUTION' | 'EMERGENCY' = 'NORMAL';
    let triggerReason = '외환시장 정상 범위 내 안정 유지';

    if (fsiScore >= 80 || currentRate >= 1420.0 || currentRate <= 1280.0) {
      stage = 'EMERGENCY';
      triggerReason = `심각 위기: 환율 괴리율 극대화 (${currentRate.toFixed(1)} WLD) - 통화스왑 비상 인출 권고`;
    } else if (fsiScore >= 60 || currentRate >= 1390.0 || currentRate <= 1300.0) {
      stage = 'CAUTION';
      triggerReason = `주의 단계: 외환시장 변동성 급증 (${currentRate.toFixed(1)} WLD) - 구두개입 및 스무딩 경계`;
    } else if (fsiScore >= 40 || currentRate >= 1370.0 || currentRate <= 1320.0) {
      stage = 'WATCH';
      triggerReason = `관심 단계: 환율 미세 변동 관찰 (${currentRate.toFixed(1)} WLD)`;
    }

    return {
      fsiScore,
      stage,
      triggerReason,
      currentSpotRate: currentRate,
    };
  }
}
