import { Injectable } from '@nestjs/common';
import { BusinessInputError } from './business.repository';
import type {
  BusinessCatalogRow,
  BusinessOwnershipRow,
  BusinessOwnershipV2Row,
  BusinessEquityRow,
  BusinessPurchaseRow,
  BusinessSettleRow,
  BusinessActivateRow,
} from './business.repository';
import { wldAmount } from '@moneyverse/contract';
import type { WldAmount } from '@moneyverse/contract';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const validId = (value: unknown, field: string): string => {
  if (typeof value !== 'string' || !UUID.test(value))
    throw new BusinessInputError(`${field} must be a UUID`);
  return value.toLowerCase();
};

function amount(value: unknown, field: string): WldAmount {
  if (typeof value !== 'string') throw new Error(`database returned invalid ${field}`);
  return wldAmount(value, field);
}

const iso = (value: unknown, field: string): string => {
  const date =
    typeof value === 'string' || typeof value === 'number' || value instanceof Date
      ? new Date(value)
      : new Date(NaN);
  if (Number.isNaN(date.valueOf())) throw new Error(`database returned invalid ${field}`);
  return date.toISOString();
};

export interface BusinessType {
  readonly id: string;
  readonly symbol: string;
  readonly name: string;
  readonly description: string;
  readonly purchaseCost: WldAmount;
  readonly dailyRevenue: WldAmount;
  readonly dailyOperatingCost: WldAmount;
}

export interface BusinessOwnership {
  readonly ownershipId: string;
  readonly businessTypeId: string;
  readonly symbol: string;
  readonly name: string;
  readonly description: string;
  readonly purchaseCost: WldAmount;
  readonly dailyRevenue: WldAmount;
  readonly dailyOperatingCost: WldAmount;
  readonly purchasedAt: string;
  readonly lastSettlementDate: string | null;
}

export interface BusinessOwnershipV2 extends BusinessOwnership {
  readonly isSettledToday: boolean;
  readonly boostActive: Record<string, unknown> | null;
  readonly status: string;
}

export interface BusinessEquityStanding {
  readonly holdingsAmount: WldAmount;
  readonly debtAmount: WldAmount;
  readonly equityAmount: WldAmount;
  readonly minimumRatioBps: number;
}

export interface BusinessPurchaseResult {
  readonly ownershipId: string;
  readonly businessTypeId: string;
  readonly purchaseCost: WldAmount;
  readonly transactionId: string;
  readonly replayed: boolean;
}

export interface BusinessSettleResult {
  readonly ownershipId: string;
  readonly settlementDate: string;
  readonly grossRevenue: WldAmount;
  readonly operatingCost: WldAmount;
  readonly netAmount: WldAmount;
  readonly transactionId: string;
  readonly replayed: boolean;
}

export interface BusinessActivateResult {
  readonly ownershipId: string;
  readonly businessSymbol: string;
  readonly businessName: string;
  readonly dailyRevenue: WldAmount;
  readonly dailyOperatingCost: WldAmount;
}

export interface BusinessPurchaseInput {
  readonly userId: string;
  readonly businessTypeId: string;
  readonly idempotencyKey: string;
}

export interface BusinessSettleInput {
  readonly userId: string;
  readonly ownershipId: string;
  readonly idempotencyKey: string;
}

export interface BusinessActivateInput {
  readonly userId: string;
  readonly catalogCode: string;
  readonly idempotencyKey?: string;
}

export interface BusinessApplyBoostInput {
  readonly userId: string;
  readonly ownershipId: string;
  readonly boostCode: string;
}

export interface BusinessRepository {
  catalog(): Promise<readonly BusinessCatalogRow[]>;
  mine(userId: string): Promise<readonly BusinessOwnershipRow[]>;
  mineV2(userId: string): Promise<readonly BusinessOwnershipV2Row[]>;
  equity(userId: string): Promise<BusinessEquityRow | null>;
  purchase(input: BusinessPurchaseInput): Promise<BusinessPurchaseRow>;
  settle(input: BusinessSettleInput): Promise<BusinessSettleRow>;
  settleV2(input: BusinessSettleInput): Promise<BusinessSettleRow>;
  activateFromLicense(input: BusinessActivateInput): Promise<BusinessActivateRow>;
  applyBoost(input: BusinessApplyBoostInput): Promise<Record<string, unknown>>;
}

function businessType(row: BusinessCatalogRow): BusinessType {
  return {
    id: validId(row?.id, 'business id'),
    symbol: String(row?.symbol ?? ''),
    name: String(row?.name ?? ''),
    description: String(row?.description ?? ''),
    purchaseCost: amount(row?.purchase_cost, 'purchase cost'),
    dailyRevenue: amount(row?.daily_revenue, 'daily revenue'),
    dailyOperatingCost: amount(row?.daily_operating_cost, 'operating cost'),
  };
}

export interface CreateBusinessPurchaseInput {
  readonly businessTypeId?: unknown;
  readonly idempotencyKey?: unknown;
}

export interface CreateBusinessSettleInput {
  readonly ownershipId?: unknown;
  readonly idempotencyKey?: unknown;
}

export interface CreateBusinessActivateInput {
  readonly catalogCode?: unknown;
  readonly idempotencyKey?: unknown;
}

export interface CreateBusinessApplyBoostInput {
  readonly ownershipId?: unknown;
  readonly boostCode?: unknown;
}

@Injectable()
export class BusinessService {
  readonly repository: BusinessRepository;

  constructor(repository: BusinessRepository) {
    if (!repository) throw new TypeError('a business repository is required');
    this.repository = repository;
  }

  async catalog(): Promise<BusinessType[]> {
    const rows = await this.repository.catalog();
    return rows.map(businessType);
  }

  async mine(userId: unknown): Promise<BusinessOwnership[]> {
    const rows = await this.repository.mine(validId(userId, 'user id'));
    return rows.map((row) => ({
      ownershipId: validId(row?.ownership_id, 'ownership id'),
      businessTypeId: validId(row?.business_type_id, 'business id'),
      symbol: String(row?.symbol ?? ''),
      name: String(row?.name ?? ''),
      description: String(row?.description ?? ''),
      purchaseCost: amount(row?.purchase_cost, 'purchase cost'),
      dailyRevenue: amount(row?.daily_revenue, 'daily revenue'),
      dailyOperatingCost: amount(row?.daily_operating_cost, 'operating cost'),
      purchasedAt: iso(row?.purchased_at, 'purchased timestamp'),
      lastSettlementDate: row?.last_settlement_date ? String(row.last_settlement_date) : null,
    }));
  }

  async mineV2(userId: unknown): Promise<BusinessOwnershipV2[]> {
    const rows = await this.repository.mineV2(validId(userId, 'user id'));
    return rows.map((row) => ({
      ownershipId: validId(row?.ownership_id, 'ownership id'),
      businessTypeId: validId(row?.business_type_id, 'business id'),
      symbol: String(row?.symbol ?? ''),
      name: String(row?.name ?? ''),
      description: String(row?.description ?? ''),
      purchaseCost: amount(row?.purchase_cost, 'purchase cost'),
      dailyRevenue: amount(row?.daily_revenue, 'daily revenue'),
      dailyOperatingCost: amount(row?.daily_operating_cost, 'operating cost'),
      purchasedAt: iso(row?.purchased_at, 'purchased timestamp'),
      lastSettlementDate: row?.last_settlement_date ? String(row.last_settlement_date) : null,
      isSettledToday: row?.is_settled_today === true,
      boostActive: row?.boost_active ?? null,
      status: String(row?.status ?? 'active'),
    }));
  }

  async equity(userId: unknown): Promise<BusinessEquityStanding> {
    const row = await this.repository.equity(validId(userId, 'user id'));
    if (!row) throw new Error('database did not return a business equity standing');
    const bps = row.minimum_ratio_bps;
    if (typeof bps !== 'number' || !Number.isInteger(bps) || bps < 0 || bps > 10000) {
      throw new Error('database returned invalid minimum equity ratio');
    }
    return {
      holdingsAmount: amount(row.holdings_amount, 'holdings amount'),
      debtAmount: amount(row.debt_amount, 'debt amount'),
      equityAmount: amount(row.equity_amount, 'equity amount'),
      minimumRatioBps: bps,
    };
  }

  async purchase(
    userId: unknown,
    input: CreateBusinessPurchaseInput = {},
  ): Promise<BusinessPurchaseResult> {
    const row = await this.repository.purchase({
      userId: validId(userId, 'user id'),
      businessTypeId: validId(input.businessTypeId, 'business type id'),
      idempotencyKey: validId(input.idempotencyKey, 'idempotency key'),
    });
    return {
      ownershipId: validId(row.ownership_id, 'ownership id'),
      businessTypeId: validId(row.business_type_id, 'business id'),
      purchaseCost: amount(row.purchase_cost, 'purchase cost'),
      transactionId: validId(row.transaction_id, 'transaction id'),
      replayed: row.replayed === true,
    };
  }

  async settle(
    userId: unknown,
    input: CreateBusinessSettleInput = {},
  ): Promise<BusinessSettleResult> {
    const row = await this.repository.settle({
      userId: validId(userId, 'user id'),
      ownershipId: validId(input.ownershipId, 'ownership id'),
      idempotencyKey: validId(input.idempotencyKey, 'idempotency key'),
    });
    return {
      ownershipId: validId(row.ownership_id, 'ownership id'),
      settlementDate: String(row.settlement_date),
      grossRevenue: amount(row.gross_revenue, 'gross revenue'),
      operatingCost: amount(row.operating_cost, 'operating cost'),
      netAmount: amount(row.net_amount, 'net amount'),
      transactionId: validId(row.transaction_id, 'transaction id'),
      replayed: row.replayed === true,
    };
  }

  async settleV2(
    userId: unknown,
    input: CreateBusinessSettleInput = {},
  ): Promise<BusinessSettleResult> {
    const row = await this.repository.settleV2({
      userId: validId(userId, 'user id'),
      ownershipId: validId(input.ownershipId, 'ownership id'),
      idempotencyKey: validId(input.idempotencyKey, 'idempotency key'),
    });
    return {
      ownershipId: validId(row.ownership_id, 'ownership id'),
      settlementDate: String(row.settlement_date),
      grossRevenue: amount(row.gross_revenue, 'gross revenue'),
      operatingCost: amount(row.operating_cost, 'operating cost'),
      netAmount: amount(row.net_amount, 'net amount'),
      transactionId: validId(row.transaction_id, 'transaction id'),
      replayed: row.replayed === true,
    };
  }

  async activateFromLicense(
    userId: unknown,
    input: CreateBusinessActivateInput = {},
  ): Promise<BusinessActivateResult> {
    const row = await this.repository.activateFromLicense({
      userId: validId(userId, 'user id'),
      catalogCode: String(input.catalogCode ?? ''),
      idempotencyKey: validId(input.idempotencyKey, 'idempotency key'),
    });
    return {
      ownershipId: validId(row.ownership_id, 'ownership id'),
      businessSymbol: String(row.business_symbol),
      businessName: String(row.business_name),
      dailyRevenue: amount(row.daily_revenue, 'daily revenue'),
      dailyOperatingCost: amount(row.daily_operating_cost, 'operating cost'),
    };
  }

  async applyBoost(
    userId: unknown,
    input: CreateBusinessApplyBoostInput = {},
  ): Promise<Record<string, unknown>> {
    return this.repository.applyBoost({
      userId: validId(userId, 'user id'),
      ownershipId: validId(input.ownershipId, 'ownership id'),
      boostCode: String(input.boostCode ?? ''),
    });
  }
}
