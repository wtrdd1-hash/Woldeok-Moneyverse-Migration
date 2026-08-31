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

// Raw rows from business_catalog()/business_my_ownerships() (see migration
// 036-virtual-business-game.sql). purchase_cost/daily_revenue/
// daily_operating_cost are bigint columns cast to text; business-service.ts
// re-validates and brands them WldAmount rather than trusting the string
// here. purchased_at is a timestamptz and last_settlement_date a date,
// both returned by the driver as Date objects (or null when a business has
// never been settled).
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

// business_equity_standing() (105) always returns exactly one row -- zeros for
// a member with no accounts -- so `equity()` below treats a missing row as an
// assertion violation rather than a normal branch. The three amounts are bigint
// columns cast to text; `minimum_ratio_bps` is an int4 ratio and stays a
// number, the one number in this file that is not money.
export interface BusinessEquityRow {
  readonly holdings_amount: string;
  readonly debt_amount: string;
  readonly equity_amount: string;
  readonly minimum_ratio_bps: number;
}

// business_purchase()/business_settle_daily() always return exactly one row
// (idempotent replay included); the methods below throw if the driver ever
// returns none, so callers can treat a missing row as an assertion
// violation, not a normal branch.
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

  // Declared `async` so uuid()'s synchronous throw below becomes a rejected
  // promise rather than a synchronous exception at the call site — see the
  // matching note in postgres-stock-repository.ts.
  async mine(userId: string): Promise<readonly BusinessOwnershipRow[]> {
    const actor = uuid(userId, 'user id');
    return queryRows<BusinessOwnershipRow>(
      this.pool,
      'SELECT ownership_id::text,business_type_id::text,symbol,name,description,purchase_cost::text,daily_revenue::text,daily_operating_cost::text,purchased_at,last_settlement_date FROM public.business_my_ownerships($1)',
      [actor],
    );
  }

  // A function and not a SELECT over `account_balances` and
  // `virtual_bank_loans`: the first is readable by this role and the second is
  // not, and a read assembled here would be the 30% rule computed in two
  // places -- the copy in TypeScript being the one nothing refuses to be wrong.
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
}
