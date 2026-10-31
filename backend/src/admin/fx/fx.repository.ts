import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { Pool } from 'pg';

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
      throw new ServiceUnavailableException('FX reserve source is unavailable.');
    }
    return res.rows[0];
  }

  async getLatestRate(): Promise<number> {
    const res = await this.pool.query(`
      SELECT current_rate::float AS rate 
      FROM public.foreign_exchange_reserves 
      LIMIT 1;
    `);
    const rate: unknown = res.rows[0]?.rate;
    // An absent or invalid source rate is not a market observation. Never
    // substitute the historical 1350 WLD anchor as a live spot quote.
    if (typeof rate !== 'number' || !Number.isFinite(rate) || rate <= 0) {
      throw new ServiceUnavailableException('FX spot rate source is unavailable.');
    }
    return rate;
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

  async getOrCreateUserWallet(_userId: string): Promise<FxWallet> {
    // No direct balance, reserve or margin writes without an authoritative ledger receipt.
    throw new ServiceUnavailableException('FX financial operations are unavailable until ledger-backed settlement is verified.');
  }

  async setHalt(_isHalted: boolean): Promise<boolean> {
    // No direct balance, reserve or margin writes without an authoritative ledger receipt.
    throw new ServiceUnavailableException('FX financial operations are unavailable until ledger-backed settlement is verified.');
  }

  async swapWldToUsd(
    _userId: string,
    _wldAmount: number
  ): Promise<{ usdCredited: number; feeWld: number; appliedRate: number }> {
    // No direct balance, reserve or margin writes without an authoritative ledger receipt.
    throw new ServiceUnavailableException('FX financial operations are unavailable until ledger-backed settlement is verified.');
  }

  async swapUsdToWld(
    _userId: string,
    _usdAmount: number
  ): Promise<{ wldCredited: number; feeWld: number; appliedRate: number }> {
    // No direct balance, reserve or margin writes without an authoritative ledger receipt.
    throw new ServiceUnavailableException('FX financial operations are unavailable until ledger-backed settlement is verified.');
  }

  async executeSmoothingIntervention(
    _type: 'SELL_USD' | 'BUY_USD',
    _amountUsd: number,
    _adminId: string
  ): Promise<{ newRate: number; newReservesUsd: number }> {
    // No direct balance, reserve or margin writes without an authoritative ledger receipt.
    throw new ServiceUnavailableException('FX financial operations are unavailable until ledger-backed settlement is verified.');
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
    _agreementId: string,
    _amountUsd: number,
    _adminId: string,
    _purpose: string = '외환 유동성 공급 및 환율 안정화'
  ): Promise<{ agreement: CurrencySwapAgreement; newReservesUsd: number }> {
    // No direct balance, reserve or margin writes without an authoritative ledger receipt.
    throw new ServiceUnavailableException('FX financial operations are unavailable until ledger-backed settlement is verified.');
  }

  async createForwardContract(
    _userId: string,
    _position: 'BUY_USD' | 'SELL_USD',
    _tenor: '1M' | '3M' | '6M',
    _contractAmountUsd: number,
    _contractRate: number,
    _spotRate: number
  ): Promise<FxForwardContract> {
    // No direct balance, reserve or margin writes without an authoritative ledger receipt.
    throw new ServiceUnavailableException('FX financial operations are unavailable until ledger-backed settlement is verified.');
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
    _contractId: string,
    _currentSpotRate: number
  ): Promise<{ contract: FxForwardContract; refundWld: number }> {
    // No direct balance, reserve or margin writes without an authoritative ledger receipt.
    throw new ServiceUnavailableException('FX financial operations are unavailable until ledger-backed settlement is verified.');
  }

  getEarlyWarningStatus(currentRate: number): FxEarlyWarning {
    // 앵커 1,350.00 대비 괴리율 및 변동성 평가
    const deviation = Math.abs(currentRate - 1350.0);
    const fsiScore = Math.min(100, Math.round((deviation / 80.0) * 100));

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
