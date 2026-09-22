import { Inject, Injectable } from '@nestjs/common';
import type { Queryable } from '../../core/db';
import { PG_POOL } from '../../core/pool.provider';

export interface TreasuryVaultRow {
  id: string;
  code: string;
  name: string;
  balance_wld: string;
  description: string;
  created_at: Date;
  updated_at: Date;
}

export interface TreasuryLedgerRow {
  id: string;
  vault_id: string;
  vault_code: string;
  vault_name: string;
  tx_type: 'INJECTION' | 'ABSORPTION_SINK' | 'STOCK_HALT_SETTLEMENT' | 'FEE_RECIRCULATION' | 'EMERGENCY_RESERVE_TRANSFER';
  amount_wld: string;
  actor_id: string | null;
  actor_name: string | null;
  reason: string;
  balance_before: string;
  balance_after: string;
  created_at: Date;
}

export interface TreasuryOverview {
  vaults: TreasuryVaultRow[];
  total_treasury_wld: string;
  total_circulating_wld: string;
  reserve_ratio_pct: number;
  stats_24h: {
    injected_wld: string;
    absorbed_wld: string;
    stock_halt_funded_wld: string;
    recirculated_wld: string;
  };
}

@Injectable()
export class TreasuryRepository {
  constructor(@Inject(PG_POOL) private readonly pool: Queryable) {}

  async getOverview(): Promise<TreasuryOverview> {
    // 1. Vaults
    const vaultsRes = await this.pool.query<TreasuryVaultRow>(`
      SELECT id, code, name, balance_wld, description, created_at, updated_at
      FROM public.system_treasury_vaults
      ORDER BY code ASC
    `);
    const vaults = vaultsRes.rows;

    let totalTreasury = BigInt(0);
    for (const v of vaults) {
      totalTreasury += BigInt(v.balance_wld);
    }

    // 2. Circulating user currency M0 (sum of all user balances)
    let totalCirculating = BigInt(0);
    try {
      const circRes = await this.pool.query<{ total: string }>(`
        SELECT coalesce(sum(balance), 0)::text AS total FROM public.users
      `);
      if (circRes.rows[0]?.total) {
        totalCirculating = BigInt(circRes.rows[0].total);
      }
    } catch {
      // fallback
    }

    const reserveRatio =
      totalCirculating > BigInt(0)
        ? Number((totalTreasury * BigInt(10000)) / totalCirculating) / 100
        : 100;

    // 3. 24h Stats from ledger
    const statsRes = await this.pool.query<{
      tx_type: string;
      total_amount: string;
    }>(`
      SELECT tx_type, coalesce(sum(amount_wld::numeric), 0)::text AS total_amount
      FROM public.system_treasury_ledger
      WHERE created_at >= NOW() - INTERVAL '24 hours'
      GROUP BY tx_type
    `);

    let injected = '0';
    let absorbed = '0';
    let stockHaltFunded = '0';
    let recirculated = '0';

    for (const row of statsRes.rows) {
      if (row.tx_type === 'INJECTION') injected = row.total_amount;
      else if (row.tx_type === 'ABSORPTION_SINK') absorbed = row.total_amount;
      else if (row.tx_type === 'STOCK_HALT_SETTLEMENT') stockHaltFunded = row.total_amount;
      else if (row.tx_type === 'FEE_RECIRCULATION') recirculated = row.total_amount;
    }

    return {
      vaults,
      total_treasury_wld: totalTreasury.toString(),
      total_circulating_wld: totalCirculating.toString(),
      reserve_ratio_pct: reserveRatio,
      stats_24h: {
        injected_wld: injected,
        absorbed_wld: absorbed,
        stock_halt_funded_wld: stockHaltFunded,
        recirculated_wld: recirculated,
      },
    };
  }

  async listTransactions(limit = 30, cursor?: string): Promise<{ items: TreasuryLedgerRow[]; next_cursor: string | null }> {
    const boundedLimit = Math.max(1, Math.min(limit, 100));
    let query = `
      SELECT
        l.id,
        l.vault_id,
        v.code AS vault_code,
        v.name AS vault_name,
        l.tx_type,
        l.amount_wld,
        l.actor_id,
        u.username AS actor_name,
        l.reason,
        l.balance_before,
        l.balance_after,
        l.created_at
      FROM public.system_treasury_ledger l
      JOIN public.system_treasury_vaults v ON v.id = l.vault_id
      LEFT JOIN public.users u ON u.id = l.actor_id
    `;
    const params: unknown[] = [];

    if (cursor) {
      query += ` WHERE l.created_at < $1`;
      params.push(cursor);
      query += ` ORDER BY l.created_at DESC LIMIT $2`;
      params.push(boundedLimit + 1);
    } else {
      query += ` ORDER BY l.created_at DESC LIMIT $1`;
      params.push(boundedLimit + 1);
    }

    const res = await this.pool.query<TreasuryLedgerRow>(query, params);
    const rows = res.rows;
    let nextCursor: string | null = null;

    if (rows.length > boundedLimit) {
      const last = rows[boundedLimit - 1];
      nextCursor = last ? last.created_at.toISOString() : null;
      rows.pop();
    }

    return { items: rows, next_cursor: nextCursor };
  }

  async injectFunds(adminId: string, vaultCode: string, amountWld: string, reason: string): Promise<Record<string, unknown>> {
    const res = await this.pool.query<{ treasury_inject: Record<string, unknown> }>(
      `SELECT public.treasury_inject($1, $2, $3, $4)`,
      [adminId, vaultCode, amountWld, reason],
    );
    return res.rows[0]?.treasury_inject ?? {};
  }

  async absorbFunds(adminId: string, vaultCode: string, amountWld: string, reason: string): Promise<Record<string, unknown>> {
    const res = await this.pool.query<{ treasury_absorb: Record<string, unknown> }>(
      `SELECT public.treasury_absorb($1, $2, $3, $4)`,
      [adminId, vaultCode, amountWld, reason],
    );
    return res.rows[0]?.treasury_absorb ?? {};
  }
}
