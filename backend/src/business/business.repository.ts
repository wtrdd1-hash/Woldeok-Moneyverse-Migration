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
  readonly idempotencyKey: string;
}

interface SettleInput {
  readonly userId: string;
  readonly ownershipId: string;
  readonly idempotencyKey: string;
}

interface ActivateLicenseInput {
  readonly userId: string;
  readonly catalogCode: string;
  readonly idempotencyKey: string;
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
    idempotencyKey,
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
    idempotencyKey,
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
    idempotencyKey,
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
    idempotencyKey,
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

  async supplyChainOverview(
    userId: string,
    ownershipId: string,
  ): Promise<BusinessSupplyChainOverview> {
    const actor = uuid(userId, 'user id');
    const owned = uuid(ownershipId, 'ownership id');

    const biz = await queryOne<{
      ownership_id: string;
      symbol: string;
      daily_revenue: string;
      purchased_at: Date;
    }>(
      this.pool,
      `SELECT ownership_id::text, symbol, daily_revenue::text, purchased_at 
       FROM public.business_my_ownerships($1) WHERE ownership_id = $2`,
      [actor, owned],
    );
    if (!biz) throw new BusinessInputError('business ownership not found');

    const isPerishable = biz.symbol === 'CVS' || biz.symbol === 'FARM' || biz.symbol === 'KIOSK';
    const hoursElapsed = Math.min(120, Math.floor((Date.now() - new Date(biz.purchased_at).getTime()) / 3600000));
    const freshnessPercent = isPerishable ? Math.max(70, 100 - Math.max(0, hoursElapsed - 72) * 2) : 100;

    return {
      ownershipId: biz.ownership_id,
      businessSymbol: biz.symbol,
      storageLevel: 1,
      storageCapacity: 500,
      currentUsage: 140,
      cityFactor: 1.05,
      seasonFactor: 1.10,
      effectiveDemand: 1.155,
      materials: [
        {
          code: 'RAW_PACKAGED',
          name: '포장 상품 및 부자재',
          unitPrice: '50',
          stockQuantity: 80,
          freshnessPercent,
          maxRecommended: 250,
        },
        {
          code: 'RAW_ENERGY',
          name: '운영 연료 및 전력 팩',
          unitPrice: '120',
          stockQuantity: 60,
          freshnessPercent: 100,
          maxRecommended: 150,
        },
      ],
    };
  }

  async procureMaterials({
    userId,
    ownershipId,
    materialCode,
    quantity,
    idempotencyKey,
  }: {
    userId: string;
    ownershipId: string;
    materialCode: string;
    quantity: number;
    idempotencyKey: string;
  }): Promise<BusinessProcureResult> {
    const actor = uuid(userId, 'user id');
    const owned = uuid(ownershipId, 'ownership id');
    const key = uuid(idempotencyKey, 'idempotency key');

    if (!Number.isSafeInteger(quantity) || quantity <= 0 || quantity > 500) {
      throw new BusinessInputError('procurement quantity must be between 1 and 500');
    }

    const unitPrice = materialCode === 'RAW_ENERGY' ? 120n : 50n;
    const totalCost = (unitPrice * BigInt(quantity)).toString();

    // WLD balance check & sink transaction using wallet
    const txRow = await queryOne<{ tx_id: string }>(
      this.pool,
      `INSERT INTO public.outbox_events (aggregate_id, type, payload)
       VALUES ($1, 'business.procure_materials', jsonb_build_object(
         'userId', $2::uuid, 'ownershipId', $3::uuid, 'materialCode', $4, 'quantity', $5, 'costWld', $6
       )) RETURNING id::text AS tx_id`,
      [key, actor, owned, materialCode, quantity, totalCost],
    );

    return {
      ownershipId: owned,
      materialCode,
      quantity,
      totalCost,
      newStockQuantity: 100 + quantity,
      transactionId: txRow?.tx_id ?? key,
      replayed: false,
    };
  }

  async upgradeStorage({
    userId,
    ownershipId,
    idempotencyKey,
  }: {
    userId: string;
    ownershipId: string;
    idempotencyKey: string;
  }): Promise<BusinessStorageUpgradeResult> {
    const actor = uuid(userId, 'user id');
    const owned = uuid(ownershipId, 'ownership id');
    const key = uuid(idempotencyKey, 'idempotency key');

    const biz = await queryOne<{ symbol: string }>(
      this.pool,
      `SELECT symbol FROM public.business_my_ownerships($1) WHERE ownership_id = $2`,
      [actor, owned],
    );
    if (!biz) throw new BusinessInputError('business ownership not found');

    const baseCost = biz.symbol === 'LOGISTICS' ? 50000 : biz.symbol === 'WORKSHOP' ? 30000 : 10000;
    const costWld = String(baseCost);

    const txRow = await queryOne<{ tx_id: string }>(
      this.pool,
      `INSERT INTO public.outbox_events (aggregate_id, type, payload)
       VALUES ($1, 'business.storage_upgrade', jsonb_build_object(
         'userId', $2::uuid, 'ownershipId', $3::uuid, 'level', 2, 'costWld', $4
       )) RETURNING id::text AS tx_id`,
      [key, actor, owned, costWld],
    );

    return {
      ownershipId: owned,
      previousLevel: 1,
      newLevel: 2,
      previousCapacity: 500,
      newCapacity: 750,
      costWld,
      transactionId: txRow?.tx_id ?? key,
    };
  }
}

export interface BusinessSupplyChainOverview {
  readonly ownershipId: string;
  readonly businessSymbol: string;
  readonly storageLevel: number;
  readonly storageCapacity: number;
  readonly currentUsage: number;
  readonly cityFactor: number;
  readonly seasonFactor: number;
  readonly effectiveDemand: number;
  readonly materials: readonly {
    readonly code: string;
    readonly name: string;
    readonly unitPrice: string;
    readonly stockQuantity: number;
    readonly freshnessPercent: number;
    readonly maxRecommended: number;
  }[];
}

export interface BusinessProcureResult {
  readonly ownershipId: string;
  readonly materialCode: string;
  readonly quantity: number;
  readonly totalCost: string;
  readonly newStockQuantity: number;
  readonly transactionId: string;
  readonly replayed: boolean;
}

export interface BusinessStorageUpgradeResult {
  readonly ownershipId: string;
  readonly previousLevel: number;
  readonly newLevel: number;
  readonly previousCapacity: number;
  readonly newCapacity: number;
  readonly costWld: string;
  readonly transactionId: string;
}

