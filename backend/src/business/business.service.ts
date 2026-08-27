import { Injectable } from '@nestjs/common';
import { BusinessInputError } from './business.repository';
import { wldAmount } from '@moneyverse/contract';
import type { WldAmount } from '@moneyverse/contract';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const validId = (value: unknown, field: string): string => {
  if (typeof value !== 'string' || !UUID.test(value)) throw new BusinessInputError(`${field} must be a UUID`);
  return value.toLowerCase();
};

// purchase_cost/daily_revenue/... arrive from PostgresBusinessRepository as
// bigint columns cast to text (see migration 036-virtual-business-game.sql).
// They are re-validated here, exactly like a UUID or free-text field coming
// from outside the process, and only then branded WldAmount.
function amount(value: unknown, field: string): WldAmount {
  if (typeof value !== 'string') throw new Error(`database returned invalid ${field}`);
  return wldAmount(value, field);
}

const iso = (value: unknown, field: string): string => {
  // Date's constructor overloads accept string | number | Date, not
  // `unknown`; the repository returns a driver Date for timestamptz columns
  // in production and a plain ISO string in test doubles, so both are
  // handled explicitly and anything else is treated as the invalid
  // timestamp it would produce.
  const date = typeof value === 'string' || typeof value === 'number' || value instanceof Date
    ? new Date(value)
    : new Date(NaN);
  if (Number.isNaN(date.valueOf())) throw new Error(`database returned invalid ${field}`);
  return date.toISOString();
};

// Raw rows as returned by PostgresBusinessRepository (see
// business_catalog()/business_my_ownerships()/business_purchase()/
// business_settle_daily() in migration 036-virtual-business-game.sql).
// Fields are kept `unknown` and pushed through the validators above, the
// same defensive treatment board-service.ts gives its rows: this is the
// last line of defense against a corrupted or unexpected database row, not
// just a formatter.
interface BusinessCatalogRow {
  readonly id?: unknown;
  readonly symbol?: unknown;
  readonly name?: unknown;
  readonly description?: unknown;
  readonly purchase_cost?: unknown;
  readonly daily_revenue?: unknown;
  readonly daily_operating_cost?: unknown;
}

interface BusinessOwnershipRow extends BusinessCatalogRow {
  readonly ownership_id?: unknown;
  readonly business_type_id?: unknown;
  readonly purchased_at?: unknown;
  readonly last_settlement_date?: unknown;
}

interface BusinessPurchaseRow {
  readonly ownership_id: unknown;
  readonly business_type_id: unknown;
  readonly purchase_cost: unknown;
  readonly transaction_id: unknown;
  readonly replayed: unknown;
}

interface BusinessSettleRow {
  readonly ownership_id: unknown;
  readonly settlement_date: unknown;
  readonly gross_revenue: unknown;
  readonly operating_cost: unknown;
  readonly net_amount: unknown;
  readonly transaction_id: unknown;
  readonly replayed: unknown;
}

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

export interface BusinessRepository {
  catalog(): Promise<readonly BusinessCatalogRow[]>;
  mine(userId: string): Promise<readonly BusinessOwnershipRow[]>;
  purchase(input: BusinessPurchaseInput): Promise<BusinessPurchaseRow>;
  settle(input: BusinessSettleInput): Promise<BusinessSettleRow>;
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
    return rows.map(row => ({
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

  async purchase(userId: unknown, input: CreateBusinessPurchaseInput = {}): Promise<BusinessPurchaseResult> {
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

  async settle(userId: unknown, input: CreateBusinessSettleInput = {}): Promise<BusinessSettleResult> {
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
}
