import { Injectable } from '@nestjs/common';
import type { Queryable } from '../core/db';
import { queryOne, queryRows } from '../core/db';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PRICE_CONDITIONS = new Set(['price_at_or_above', 'price_at_or_below']);
const CHANGE_CONDITIONS = new Set(['day_change_at_or_above', 'day_change_at_or_below']);
const BIGINT_MAX = 9_223_372_036_854_775_807n;

export class StockAlertInputError extends Error {}

export interface StockAlertRuleRow {
  readonly alert_id: string;
  readonly stock_id: string;
  readonly symbol: string;
  readonly name: string;
  readonly condition_kind: string;
  readonly threshold_amount: string | null;
  readonly threshold_bps: number | null;
  readonly cooldown_seconds: number;
  readonly current_price: string;
  readonly day_open_price: string;
  readonly current_day_change_bps: number;
  readonly condition_met: boolean;
  readonly last_evaluated_at: Date | null;
  readonly last_triggered_at: Date | null;
  readonly created_at: Date;
}

export interface StockAlertEventRow {
  readonly event_id: string;
  readonly alert_id: string;
  readonly stock_id: string;
  readonly symbol: string;
  readonly name: string;
  readonly condition_kind: string;
  readonly threshold_amount: string | null;
  readonly threshold_bps: number | null;
  readonly trigger_price: string;
  readonly trigger_day_change_bps: number;
  readonly triggered_at: Date;
}

export interface CreateStockAlertInput {
  readonly userId: unknown;
  readonly stockId: unknown;
  readonly conditionKind: unknown;
  readonly thresholdAmount?: unknown;
  readonly thresholdBps?: unknown;
  readonly cooldownSeconds?: unknown;
}

function uuid(value: unknown, name: string): string {
  if (typeof value !== 'string' || !UUID.test(value)) throw new StockAlertInputError(`${name} must be a UUID`);
  return value;
}

@Injectable()
export class StockAlertRepository {
  constructor(private readonly pool: Queryable) {
    if (!pool?.query) throw new TypeError('a PostgreSQL pool is required');
  }

  list(userId: unknown): Promise<readonly StockAlertRuleRow[]> {
    const actor = uuid(userId, 'user id');
    return queryRows<StockAlertRuleRow>(
      this.pool,
      `SELECT alert_id::text, stock_id::text, symbol, name, condition_kind,
        threshold_amount::text, threshold_bps, cooldown_seconds,
        current_price::text, day_open_price::text, current_day_change_bps,
        condition_met, last_evaluated_at, last_triggered_at, created_at
       FROM public.stock_alert_rules_list($1)`,
      [actor],
    );
  }

  events(userId: unknown, limit: unknown = 20): Promise<readonly StockAlertEventRow[]> {
    const actor = uuid(userId, 'user id');
    const requested = typeof limit === 'number' && Number.isSafeInteger(limit) ? limit : 20;
    const bounded = Math.min(100, Math.max(1, requested));
    return queryRows<StockAlertEventRow>(
      this.pool,
      `SELECT event_id::text, alert_id::text, stock_id::text, symbol, name, condition_kind,
        threshold_amount::text, threshold_bps, trigger_price::text,
        trigger_day_change_bps, triggered_at
       FROM public.stock_alert_events_list($1,$2)`,
      [actor, bounded],
    );
  }

  async create(input: CreateStockAlertInput): Promise<{ readonly alertId: string }> {
    const userId = uuid(input.userId, 'user id');
    const stockId = uuid(input.stockId, 'stock id');
    if (typeof input.conditionKind !== 'string' || (!PRICE_CONDITIONS.has(input.conditionKind) && !CHANGE_CONDITIONS.has(input.conditionKind))) {
      throw new StockAlertInputError('unsupported alert condition');
    }

    let thresholdAmount: string | null = null;
    let thresholdBps: number | null = null;
    if (PRICE_CONDITIONS.has(input.conditionKind)) {
      if (typeof input.thresholdAmount !== 'string' || !/^[1-9]\d{0,18}$/.test(input.thresholdAmount)) {
        throw new StockAlertInputError('price threshold must be a positive integer string');
      }
      const amount = BigInt(input.thresholdAmount);
      if (amount > BIGINT_MAX) throw new StockAlertInputError('price threshold is outside the WLD range');
      thresholdAmount = amount.toString();
      if (input.thresholdBps !== undefined && input.thresholdBps !== null) {
        throw new StockAlertInputError('price alerts cannot include a change threshold');
      }
    } else {
      if (typeof input.thresholdBps !== 'number' || !Number.isSafeInteger(input.thresholdBps) || input.thresholdBps < -100_000 || input.thresholdBps > 100_000) {
        throw new StockAlertInputError('change threshold must be an integer basis-point value');
      }
      thresholdBps = input.thresholdBps;
      if (input.thresholdAmount !== undefined && input.thresholdAmount !== null) {
        throw new StockAlertInputError('change alerts cannot include a price threshold');
      }
    }

    const cooldown = input.cooldownSeconds === undefined ? 3600 : input.cooldownSeconds;
    if (typeof cooldown !== 'number' || !Number.isSafeInteger(cooldown) || cooldown < 300 || cooldown > 604_800) {
      throw new StockAlertInputError('cooldown must be between 300 and 604800 seconds');
    }
    const row = await queryOne<{ alert_id: string }>(
      this.pool,
      'SELECT public.stock_alert_rule_create($1,$2,$3,$4::bigint,$5,$6)::text AS alert_id',
      [userId, stockId, input.conditionKind, thresholdAmount, thresholdBps, cooldown],
    );
    if (!row) throw new Error('database did not return stock alert id');
    return { alertId: row.alert_id };
  }

  async remove(userId: unknown, alertId: unknown): Promise<{ readonly deleted: boolean }> {
    const actor = uuid(userId, 'user id');
    const id = uuid(alertId, 'alert id');
    const row = await queryOne<{ deleted: boolean }>(
      this.pool,
      'SELECT public.stock_alert_rule_delete($1,$2) AS deleted',
      [actor, id],
    );
    return { deleted: row?.deleted ?? false };
  }

  async evaluateDue(): Promise<number> {
    const row = await queryOne<{ triggered: string }>(
      this.pool,
      'SELECT public.stock_alerts_evaluate_due()::text AS triggered',
    );
    return Number(row?.triggered ?? 0);
  }
}
