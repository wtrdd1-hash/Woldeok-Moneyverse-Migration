import { randomUUID } from 'node:crypto';
import type { Queryable } from '../core/db';
import { queryOne, queryRows } from '../core/db';
import type { BusinessRepository } from './business.service';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export class BusinessInputError extends Error {}
const uuid = (value: unknown, field: string): string => {
  if (typeof value !== 'string' || !UUID.test(value))
    throw new BusinessInputError(`${field} must be a UUID`);
  return value.toLowerCase();
};

export interface BusinessCatalogRow {
  readonly id: string;
  readonly symbol: string;
  readonly name: string;
  readonly description: string;
  readonly purchase_cost: string;
  readonly daily_revenue: string;
  readonly daily_operating_cost: string;
}

export interface BusinessOwnershipRow extends BusinessCatalogRow {
  readonly ownership_id: string;
  readonly business_type_id: string;
  readonly purchased_at: Date;
  readonly last_settlement_date: Date | null;
}

export interface BusinessOwnershipV2Row extends BusinessOwnershipRow {
  readonly is_settled_today: boolean;
  readonly boost_active: Record<string, unknown> | null;
  readonly status: string;
}

export interface BusinessEquityRow {
  readonly holdings_amount: string;
  readonly debt_amount: string;
  readonly equity_amount: string;
  readonly minimum_ratio_bps: number;
}

export interface BusinessPurchaseRow {
  readonly ownership_id: string;
  readonly business_type_id: string;
  readonly purchase_cost: string;
  readonly transaction_id: string;
  readonly replayed: boolean;
}

export interface BusinessSettleRow {
  readonly ownership_id: string;
  readonly settlement_date: Date;
  readonly gross_revenue: string;
  readonly operating_cost: string;
  readonly net_amount: string;
  readonly transaction_id: string;
  readonly replayed: boolean;
}

export interface BusinessActivateRow {
  readonly ownership_id: string;
  readonly business_symbol: string;
  readonly business_name: string;
  readonly daily_revenue: string;
  readonly daily_operating_cost: string;
}

interface PurchaseInput {
  readonly userId: string;
  readonly businessTypeId: string;
  readonly idempotencyKey?: string;
}

interface SettleInput {
  readonly userId: string;
  readonly ownershipId: string;
  readonly idempotencyKey?: string;
}

interface ActivateLicenseInput {
  readonly userId: string;
  readonly catalogCode: string;
  readonly idempotencyKey?: string;
}

interface ApplyBoostInput {
  readonly userId: string;
  readonly ownershipId: string;
  readonly boostCode: string;
}

export class PostgresBusinessRepository implements BusinessRepository {
  readonly pool: Queryable;

  constructor(pool: Queryable) {
    if (!pool?.query) throw new TypeError('a PostgreSQL pool is required');
    this.pool = pool;
  }

  async catalog(): Promise<readonly BusinessCatalogRow[]> {
    return queryRows<BusinessCatalogRow>(
      this.pool,
      'SELECT id::text,symbol,name,description,purchase_cost::text,daily_revenue::text,daily_operating_cost::text FROM public.business_catalog()',
    );
  }

  async mine(userId: string): Promise<readonly BusinessOwnershipRow[]> {
    const actor = uuid(userId, 'user id');
    return queryRows<BusinessOwnershipRow>(
      this.pool,
      'SELECT ownership_id::text,business_type_id::text,symbol,name,description,purchase_cost::text,daily_revenue::text,daily_operating_cost::text,purchased_at,last_settlement_date FROM public.business_my_ownerships($1)',
      [actor],
    );
  }

  async mineV2(userId: string): Promise<readonly BusinessOwnershipV2Row[]> {
    const actor = uuid(userId, 'user id');
    return queryRows<BusinessOwnershipV2Row>(
      this.pool,
      `SELECT ownership_id::text, business_type_id::text, symbol, name, description,
              purchase_cost::text, daily_revenue::text, daily_operating_cost::text,
              purchased_at, last_settlement_date, is_settled_today, boost_active, status
       FROM public.business_my_ownerships_v2($1)`,
      [actor],
    );
  }

  async equity(userId: string): Promise<BusinessEquityRow | null> {
    const actor = uuid(userId, 'user id');
    return queryOne<BusinessEquityRow>(
      this.pool,
      'SELECT holdings_amount::text,debt_amount::text,equity_amount::text,minimum_ratio_bps FROM public.business_equity_standing($1)',
      [actor],
    );
  }

  async purchase({
    userId,
    businessTypeId,
    idempotencyKey = randomUUID(),
  }: PurchaseInput): Promise<BusinessPurchaseRow> {
    const row = await queryOne<BusinessPurchaseRow>(
      this.pool,
      'SELECT ownership_id::text,business_type_id::text,purchase_cost::text,transaction_id::text,replayed FROM public.business_purchase($1,$2,$3)',
      [
        uuid(idempotencyKey, 'idempotency key'),
        uuid(userId, 'user id'),
        uuid(businessTypeId, 'business type id'),
      ],
    );
    if (!row?.ownership_id) throw new Error('database did not return a business purchase receipt');
    return row;
  }

  async settle({
    userId,
    ownershipId,
    idempotencyKey = randomUUID(),
  }: SettleInput): Promise<BusinessSettleRow> {
    const row = await queryOne<BusinessSettleRow>(
      this.pool,
      'SELECT ownership_id::text,settlement_date,gross_revenue::text,operating_cost::text,net_amount::text,transaction_id::text,replayed FROM public.business_settle_daily($1,$2,$3)',
      [
        uuid(idempotencyKey, 'idempotency key'),
        uuid(userId, 'user id'),
        uuid(ownershipId, 'ownership id'),
      ],
    );
    if (!row?.ownership_id)
      throw new Error('database did not return a business settlement receipt');
    return row;
  }

  async settleV2({
    userId,
    ownershipId,
    idempotencyKey = randomUUID(),
  }: SettleInput): Promise<BusinessSettleRow> {
    const row = await queryOne<BusinessSettleRow>(
      this.pool,
      `SELECT ownership_id::text, settlement_date, gross_revenue::text,
              operating_cost::text, net_amount::text, transaction_id::text, replayed
       FROM public.business_settle_daily_v2($1, $2, $3)`,
      [
        uuid(userId, 'user id'),
        uuid(ownershipId, 'ownership id'),
        uuid(idempotencyKey, 'idempotency key'),
      ],
    );
    if (!row?.ownership_id)
      throw new Error('database did not return a business settlement receipt');
    return row;
  }

  async activateFromLicense({
    userId,
    catalogCode,
    idempotencyKey = randomUUID(),
  }: ActivateLicenseInput): Promise<BusinessActivateRow> {
    const row = await queryOne<BusinessActivateRow>(
      this.pool,
      `SELECT ownership_id::text, business_symbol, business_name,
              daily_revenue::text, daily_operating_cost::text
       FROM public.business_activate_from_license($1, $2, $3)`,
      [
        uuid(userId, 'user id'),
        catalogCode,
        uuid(idempotencyKey, 'idempotency key'),
      ],
    );
    if (!row?.ownership_id)
      throw new Error('database did not return an activated business receipt');
    return row;
  }

  async applyBoost({
    userId,
    ownershipId,
    boostCode,
  }: ApplyBoostInput): Promise<Record<string, unknown>> {
    const row = await queryOne<{ boost_active: Record<string, unknown> }>(
      this.pool,
      `SELECT public.business_apply_boost($1, $2, $3) AS boost_active`,
      [
        uuid(userId, 'user id'),
        uuid(ownershipId, 'ownership id'),
        boostCode,
      ],
    );
    return row?.boost_active ?? {};
  }
}
