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

export interface TreasuryTaxRateItem {
  readonly id: string;
  readonly category: string;
  readonly category_ko: string;
  readonly taxable_event: string;
  readonly current_rate_pct: number;
  readonly min_rate_pct: number;
  readonly max_rate_pct: number;
  readonly treasury_attribution_pct: number;
  readonly is_exempt: boolean;
}

export const AUTHORITATIVE_TAX_RATES: readonly TreasuryTaxRateItem[] = [
  {
    id: 'tax_user_transfer',
    category: 'User Transfers',
    category_ko: '일반 사용자 간 송금세',
    taxable_event: '수취인에게 실제 이전되는 WLD, 송금 확정 시',
    current_rate_pct: 0,
    min_rate_pct: 0,
    max_rate_pct: 2,
    treasury_attribution_pct: 100,
    is_exempt: false,
  },
  {
    id: 'tax_marketplace_sale',
    category: 'Marketplace Sales',
    category_ko: '장터 판매세',
    taxable_event: '판매자 실수령 전 체결금액 (2% 원천징수)',
    current_rate_pct: 2,
    min_rate_pct: 0,
    max_rate_pct: 5,
    treasury_attribution_pct: 100,
    is_exempt: false,
  },
  {
    id: 'tax_stock_trade',
    category: 'Stock Trades',
    category_ko: '주식 매매세',
    taxable_event: '체결금액 기준 매도 시',
    current_rate_pct: 1,
    min_rate_pct: 0,
    max_rate_pct: 3,
    treasury_attribution_pct: 100,
    is_exempt: false,
  },
  {
    id: 'tax_business_settlement',
    category: 'Business Settlements',
    category_ko: '사업 정산 소득세',
    taxable_event: '비용 차감 후 양(+)의 정산이익',
    current_rate_pct: 3,
    min_rate_pct: 0,
    max_rate_pct: 8,
    treasury_attribution_pct: 100,
    is_exempt: false,
  },
  {
    id: 'tax_b2b_trade',
    category: 'B2B Trade',
    category_ko: '사업체 간 B2B 거래세',
    taxable_event: '실제 정산대금',
    current_rate_pct: 1,
    min_rate_pct: 0,
    max_rate_pct: 3,
    treasury_attribution_pct: 100,
    is_exempt: false,
  },
  {
    id: 'tax_general_shop',
    category: 'General Shop',
    category_ko: '일반 상점 소비세',
    taxable_event: '과세대상 SKU 결제금액',
    current_rate_pct: 1,
    min_rate_pct: 0,
    max_rate_pct: 3,
    treasury_attribution_pct: 100,
    is_exempt: false,
  },
  {
    id: 'tax_luxury_sku',
    category: 'Luxury SKUs',
    category_ko: '고급/사치 SKU 소비세',
    taxable_event: '지정 luxury SKU 결제금액',
    current_rate_pct: 3,
    min_rate_pct: 0,
    max_rate_pct: 8,
    treasury_attribution_pct: 100,
    is_exempt: false,
  },
  {
    id: 'tax_club_city_project',
    category: 'Club & City Projects',
    category_ko: '클럽/도시 프로젝트 관리세',
    taxable_event: '환급되지 않는 참가·등록금 중 지정분',
    current_rate_pct: 1,
    min_rate_pct: 0,
    max_rate_pct: 3,
    treasury_attribution_pct: 100,
    is_exempt: false,
  },
  {
    id: 'tax_casino_exempt',
    category: 'Casino Gaming',
    category_ko: '카지노/확률형 흐름',
    taxable_event: '별도 카지노 계약 우선',
    current_rate_pct: 0,
    min_rate_pct: 0,
    max_rate_pct: 0,
    treasury_attribution_pct: 0,
    is_exempt: true,
  },
  {
    id: 'tax_reward_exempt',
    category: 'Work/Attendance/Quests',
    category_ko: '작업/출석/퀘스트 보상',
    taxable_event: '보상 지급액 (면세/비과세)',
    current_rate_pct: 0,
    min_rate_pct: 0,
    max_rate_pct: 0,
    treasury_attribution_pct: 0,
    is_exempt: true,
  },
  {
    id: 'tax_halt_refund_exempt',
    category: 'Stock Halt Refund',
    category_ko: '거래정지 매수원가 환급',
    taxable_event: '환급원금 (면세/비과세)',
    current_rate_pct: 0,
    min_rate_pct: 0,
    max_rate_pct: 0,
    treasury_attribution_pct: 0,
    is_exempt: true,
  },
];

export interface TreasuryOverview {
  vaults: TreasuryVaultRow[];
  total_treasury_wld: string;
  total_circulating_wld: string;
  reserve_ratio_pct: number;
  available_wld: string;
  reserve_wld: string;
  coverage_days: number;
  tax_rates: readonly TreasuryTaxRateItem[];
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

    // 4. Reserve & Available calculation (ADMIN_TREASURY_MANAGEMENT_SPEC §5)
    let reserveVaultWld = BigInt(0);
    const emergencyVault = vaults.find((v) => v.code === 'VAULT_EMERGENCY');
    if (emergencyVault) {
      reserveVaultWld = BigInt(emergencyVault.balance_wld);
    }
    const committedWld = BigInt(0); // committed reservation
    const availableWld =
      totalTreasury > reserveVaultWld + committedWld
        ? totalTreasury - (reserveVaultWld + committedWld)
        : BigInt(0);

    // 5. 30-day average daily outflow / expense for coverage calculation
    let dailyOutflow30d = BigInt(10000); // minimum safe baseline
    try {
      const outflowRes = await this.pool.query<{ daily_avg: string }>(`
        SELECT coalesce(sum(amount_wld::numeric) / 30, 10000)::bigint::text AS daily_avg
        FROM public.system_treasury_ledger
        WHERE created_at >= NOW() - INTERVAL '30 days'
          AND tx_type IN ('INJECTION', 'STOCK_HALT_SETTLEMENT', 'EMERGENCY_RESERVE_TRANSFER')
      `);
      if (outflowRes.rows[0]?.daily_avg && BigInt(outflowRes.rows[0].daily_avg) > BigInt(0)) {
        dailyOutflow30d = BigInt(outflowRes.rows[0].daily_avg);
      }
    } catch {
      // fallback safe value
    }

    const coverageDays = Number(availableWld / dailyOutflow30d);

    return {
      vaults,
      total_treasury_wld: totalTreasury.toString(),
      total_circulating_wld: totalCirculating.toString(),
      reserve_ratio_pct: reserveRatio,
      available_wld: availableWld.toString(),
      reserve_wld: reserveVaultWld.toString(),
      coverage_days: coverageDays,
      tax_rates: AUTHORITATIVE_TAX_RATES,
      stats_24h: {
        injected_wld: injected,
        absorbed_wld: absorbed,
        stock_halt_funded_wld: stockHaltFunded,
        recirculated_wld: recirculated,
      },
    };
  }

  getTaxRates(): readonly TreasuryTaxRateItem[] {
    return AUTHORITATIVE_TAX_RATES;
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
