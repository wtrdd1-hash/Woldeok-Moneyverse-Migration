import { Injectable } from '@nestjs/common';
import type { Queryable } from '../core/db';
import { queryOne } from '../core/db';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class EconomyReconciliationInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EconomyReconciliationInputError';
  }
}

function assertPlainObject(value: unknown): asserts value is Record<string, unknown> {
  if (value === null || Array.isArray(value) || typeof value !== 'object') {
    throw new EconomyReconciliationInputError('reconciliation query must be an object');
  }
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) {
    throw new EconomyReconciliationInputError('reconciliation query must be a plain object');
  }
}

export function assertReconciliationActorId(value: unknown): asserts value is string {
  if (typeof value !== 'string' || !UUID_PATTERN.test(value)) {
    throw new EconomyReconciliationInputError('actor user id must be a UUID');
  }
}

/**
 * public.admin_latest_economy_reconciliation_health RETURNS TABLE:
 * packages/database/migrations/018-economy-reconciliation-health.sql (redefined, same
 * shape, by packages/database/migrations/019-economy-reconciliation-health-repair.sql).
 * `bigint`/`numeric` columns come back from node-postgres as strings;
 * `integer` columns come back as numbers.
 */
export interface EconomyReconciliationHealthRow {
  readonly snapshot_id: string;
  readonly metric_version: string;
  readonly calculated_at: Date;
  readonly integrity_ok: boolean;
  readonly ledger_transaction_count: string;
  readonly ledger_posting_count: string;
  readonly ledger_unbalanced_transaction_count: string;
  readonly missing_balance_account_count: string;
  readonly balance_mismatch_account_count: string;
  readonly disallowed_negative_balance_account_count: string;
  readonly account_balance_total_amount: string;
  readonly ledger_balance_total_amount: string;
  readonly balance_total_delta_amount: string;
  readonly m2_amount: string;
  readonly net_mint_issuance_amount: string;
  readonly sink_absorbed_amount: string;
  readonly effective_issued_less_sink_amount: string;
  readonly treasury_balance_amount: string;
  readonly treasury_inflow_24h_amount: string;
  readonly treasury_outflow_24h_amount: string;
  readonly treasury_net_flow_24h_amount: string;
  readonly user_wallet_owner_count: string;
  readonly positive_wallet_owner_count: string;
  readonly positive_user_balance_total_amount: string;
  readonly top_1_user_balance_amount: string;
  readonly top_1_share_basis_points: number;
  readonly top_10_user_balance_amount: string;
  readonly top_10_share_basis_points: number;
  readonly flow_24h_transaction_count: string;
  readonly flow_24h_volume_amount: string;
  readonly mint_issuance_24h_amount: string;
  readonly sink_absorption_24h_amount: string;
  readonly integrity_hash: string;
}

/**
 * Read-only gateway for the admin reconciliation DTO.
 *
 * It deliberately has no snapshot-recording method: the web process uses the
 * shared `moneyverse_app` role and must never receive the maintenance-only
 * reconciliation command or any direct access to ledger/metric tables.
 */
@Injectable()
export class PostgresEconomyReconciliationRepository {
  readonly pool: Queryable;

  constructor(pool: Queryable) {
    if (!pool || typeof pool.query !== 'function') {
      throw new Error('database pool is required');
    }
    this.pool = pool;
  }

  async latestHealth(input: unknown): Promise<EconomyReconciliationHealthRow | null> {
    assertPlainObject(input);
    const keys = Object.keys(input);
    if (keys.length !== 1 || keys[0] !== 'actorUserId') {
      throw new EconomyReconciliationInputError('only actor user id may be queried');
    }
    const { actorUserId } = input;
    assertReconciliationActorId(actorUserId);

    return queryOne<EconomyReconciliationHealthRow>(
      this.pool,
      `SELECT snapshot_id, metric_version, calculated_at, integrity_ok,
              ledger_transaction_count, ledger_posting_count,
              ledger_unbalanced_transaction_count,
              missing_balance_account_count, balance_mismatch_account_count,
              disallowed_negative_balance_account_count,
              account_balance_total_amount, ledger_balance_total_amount,
              balance_total_delta_amount, m2_amount, net_mint_issuance_amount,
              sink_absorbed_amount, effective_issued_less_sink_amount,
              treasury_balance_amount, treasury_inflow_24h_amount,
              treasury_outflow_24h_amount, treasury_net_flow_24h_amount,
              user_wallet_owner_count, positive_wallet_owner_count,
              positive_user_balance_total_amount, top_1_user_balance_amount,
              top_1_share_basis_points, top_10_user_balance_amount,
              top_10_share_basis_points, flow_24h_transaction_count,
              flow_24h_volume_amount, mint_issuance_24h_amount,
              sink_absorption_24h_amount, integrity_hash
       FROM public.admin_latest_economy_reconciliation_health($1)`,
      [actorUserId],
    );
  }
}
