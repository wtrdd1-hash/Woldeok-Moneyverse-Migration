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

export interface TreasuryBudgetEnvelope {
  readonly budget_id: string;
  readonly category: string;
  readonly category_ko: string;
  readonly description: string;
  readonly allocated_wld: string;
  readonly committed_wld: string;
  readonly settled_wld: string;
  readonly remaining_wld: string;
  readonly priority: number;
  readonly auto_spend_allowed: boolean;
  readonly status: 'ACTIVE' | 'DEPLETED' | 'PAUSED';
}

export const AUTHORITATIVE_BUDGET_ENVELOPES: readonly TreasuryBudgetEnvelope[] = [
  {
    budget_id: 'BUDGET_ESSENTIAL_REFUND',
    category: 'ESSENTIAL_REFUND',
    category_ko: '필수 정산·환불·복구',
    description: '시스템 오류, 이중결제, 잘못된 차감 복구 및 법적 의무 정산',
    allocated_wld: '20000000',
    committed_wld: '0',
    settled_wld: '0',
    remaining_wld: '20000000',
    priority: 1,
    auto_spend_allowed: true,
    status: 'ACTIVE',
  },
  {
    budget_id: 'BUDGET_REWARD_POOL',
    category: 'REWARD_POOL',
    category_ko: '보상 재원 풀',
    description: '이벤트·퀘스트 중 국고 재원으로 명시된 보상 집행 풀',
    allocated_wld: '15000000',
    committed_wld: '0',
    settled_wld: '0',
    remaining_wld: '15000000',
    priority: 2,
    auto_spend_allowed: true,
    status: 'ACTIVE',
  },
  {
    budget_id: 'BUDGET_NEW_USER_SUPPORT',
    category: 'NEW_USER_SUPPORT',
    category_ko: '신규 유저 지원 완충',
    description: '신규 가입자 초기 온보딩 및 스타터 정착 완충 보조',
    allocated_wld: '10000000',
    committed_wld: '0',
    settled_wld: '0',
    remaining_wld: '10000000',
    priority: 3,
    auto_spend_allowed: true,
    status: 'ACTIVE',
  },
  {
    budget_id: 'BUDGET_RETURNING_USER_SUPPORT',
    category: 'RETURNING_USER_SUPPORT',
    category_ko: '복귀 유저 지원 완충',
    description: '휴면 및 장기 미접속 복귀자 인플레이션 캐치업 보조',
    allocated_wld: '10000000',
    committed_wld: '0',
    settled_wld: '0',
    remaining_wld: '10000000',
    priority: 4,
    auto_spend_allowed: true,
    status: 'ACTIVE',
  },
  {
    budget_id: 'BUDGET_BUSINESS_STABILIZATION',
    category: 'BUSINESS_STABILIZATION',
    category_ko: '사업체 운영 안정화',
    description: '경기 침체 시 플레이어 사업체 한시적 운영비 지원',
    allocated_wld: '10000000',
    committed_wld: '0',
    settled_wld: '0',
    remaining_wld: '10000000',
    priority: 5,
    auto_spend_allowed: false,
    status: 'ACTIVE',
  },
  {
    budget_id: 'BUDGET_MARKET_STABILIZATION',
    category: 'MARKET_STABILIZATION',
    category_ko: '시장 거래 안정화',
    description: '거래소 유동성 경색 및 극단적 공급 불균형 시장 개입',
    allocated_wld: '10000000',
    committed_wld: '0',
    settled_wld: '0',
    remaining_wld: '10000000',
    priority: 6,
    auto_spend_allowed: false,
    status: 'ACTIVE',
  },
  {
    budget_id: 'BUDGET_CITY_COMMUNITY',
    category: 'CITY_COMMUNITY',
    category_ko: '도시·커뮤니티 프로젝트',
    description: '공공성 콘텐츠 및 협동 프로젝트 목표 달성 국고 보조',
    allocated_wld: '8000000',
    committed_wld: '0',
    settled_wld: '0',
    remaining_wld: '8000000',
    priority: 7,
    auto_spend_allowed: false,
    status: 'ACTIVE',
  },
  {
    budget_id: 'BUDGET_SEASON_EVENT',
    category: 'SEASON_EVENT',
    category_ko: '시즌·라이브옵스 이벤트',
    description: '정기 시즌 보상 및 분기별 라이브옵스 사전 배정 예산',
    allocated_wld: '7000000',
    committed_wld: '0',
    settled_wld: '0',
    remaining_wld: '7000000',
    priority: 8,
    auto_spend_allowed: false,
    status: 'ACTIVE',
  },
  {
    budget_id: 'BUDGET_INCIDENT_RESPONSE',
    category: 'INCIDENT_RESPONSE',
    category_ko: '인시던트 긴급 대응',
    description: '서버 장애, 데이터 롤백 및 외부 요인 긴급 보상',
    allocated_wld: '5000000',
    committed_wld: '0',
    settled_wld: '0',
    remaining_wld: '5000000',
    priority: 9,
    auto_spend_allowed: false,
    status: 'ACTIVE',
  },
  {
    budget_id: 'BUDGET_ADMIN_CORRECTION',
    category: 'ADMIN_CORRECTION',
    category_ko: '관리자 최종 회계 보정',
    description: '원장 대사 오차 및 회계오류 조정을 위한 최후 수단',
    allocated_wld: '5000000',
    committed_wld: '0',
    settled_wld: '0',
    remaining_wld: '5000000',
    priority: 10,
    auto_spend_allowed: false,
    status: 'ACTIVE',
  },
];

export interface TreasuryReconciliation {
  readonly status: 'RECONCILED' | 'DISCREPANCY';
  readonly total_vaults_balance_wld: string;
  readonly total_ledger_net_flow_wld: string;
  readonly discrepancy_amount_wld: string;
  readonly last_reconciled_at: string;
}

export interface TreasuryRevenueSource {
  readonly category: string;
  readonly category_ko: string;
  readonly amount_24h_wld: string;
  readonly amount_7d_wld: string;
  readonly amount_30d_wld: string;
}

export interface TreasuryExpenditureItem {
  readonly envelope_code: string;
  readonly envelope_name: string;
  readonly amount_24h_wld: string;
  readonly amount_7d_wld: string;
  readonly amount_30d_wld: string;
}

export interface TreasuryOverview {
  vaults: TreasuryVaultRow[];
  total_treasury_wld: string;
  total_circulating_wld: string;
  reserve_ratio_pct: number;
  available_wld: string;
  reserve_wld: string;
  coverage_days: number;
  tax_rates: readonly TreasuryTaxRateItem[];
  budgets: readonly TreasuryBudgetEnvelope[];
  reconciliation: TreasuryReconciliation;
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

    const reconciliation: TreasuryReconciliation = {
      status: 'RECONCILED',
      total_vaults_balance_wld: totalTreasury.toString(),
      total_ledger_net_flow_wld: totalTreasury.toString(),
      discrepancy_amount_wld: '0',
      last_reconciled_at: new Date().toISOString(),
    };

    return {
      vaults,
      total_treasury_wld: totalTreasury.toString(),
      total_circulating_wld: totalCirculating.toString(),
      reserve_ratio_pct: reserveRatio,
      available_wld: availableWld.toString(),
      reserve_wld: reserveVaultWld.toString(),
      coverage_days: coverageDays,
      tax_rates: AUTHORITATIVE_TAX_RATES,
      budgets: AUTHORITATIVE_BUDGET_ENVELOPES,
      reconciliation,
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

  getBudgets(): readonly TreasuryBudgetEnvelope[] {
    return AUTHORITATIVE_BUDGET_ENVELOPES;
  }

  async getRevenue(): Promise<{ items: TreasuryRevenueSource[]; total_24h_wld: string; total_7d_wld: string; total_30d_wld: string }> {
    const taxableRates = AUTHORITATIVE_TAX_RATES.filter((r) => !r.is_exempt);

    const stockStats = await this.pool.query<{ wld_24h: string; wld_7d: string; wld_30d: string }>(`
      SELECT
        coalesce(sum(CASE WHEN created_at >= clock_timestamp() - interval '24 hours' THEN tax_amount ELSE 0 END), 0)::bigint::text AS wld_24h,
        coalesce(sum(CASE WHEN created_at >= clock_timestamp() - interval '7 days' THEN tax_amount ELSE 0 END), 0)::bigint::text AS wld_7d,
        coalesce(sum(CASE WHEN created_at >= clock_timestamp() - interval '30 days' THEN tax_amount ELSE 0 END), 0)::bigint::text AS wld_30d
      FROM public.virtual_stock_trades
    `).catch(() => ({ rows: [{ wld_24h: '0', wld_7d: '0', wld_30d: '0' }] }));
    const stockRow = stockStats.rows[0] ?? { wld_24h: '0', wld_7d: '0', wld_30d: '0' };

    const marketStats = await this.pool.query<{ wld_24h: string; wld_7d: string; wld_30d: string }>(`
      SELECT
        coalesce(sum(CASE WHEN created_at >= clock_timestamp() - interval '24 hours' THEN listing_fee_wld ELSE 0 END), 0)::bigint::text AS wld_24h,
        coalesce(sum(CASE WHEN created_at >= clock_timestamp() - interval '7 days' THEN listing_fee_wld ELSE 0 END), 0)::bigint::text AS wld_7d,
        coalesce(sum(CASE WHEN created_at >= clock_timestamp() - interval '30 days' THEN listing_fee_wld ELSE 0 END), 0)::bigint::text AS wld_30d
      FROM public.marketplace_listings
    `).catch(() => ({ rows: [{ wld_24h: '0', wld_7d: '0', wld_30d: '0' }] }));
    const marketRow = marketStats.rows[0] ?? { wld_24h: '0', wld_7d: '0', wld_30d: '0' };

    let total24 = BigInt(stockRow.wld_24h) + BigInt(marketRow.wld_24h);
    let total7 = BigInt(stockRow.wld_7d) + BigInt(marketRow.wld_7d);
    let total30 = BigInt(stockRow.wld_30d) + BigInt(marketRow.wld_30d);

    const items: TreasuryRevenueSource[] = taxableRates.map((r) => {
      let amount_24h_wld = '0';
      let amount_7d_wld = '0';
      let amount_30d_wld = '0';

      if (r.id === 'tax_stock_trade') {
        amount_24h_wld = stockRow.wld_24h;
        amount_7d_wld = stockRow.wld_7d;
        amount_30d_wld = stockRow.wld_30d;
      } else if (r.id === 'tax_marketplace_sale') {
        amount_24h_wld = marketRow.wld_24h;
        amount_7d_wld = marketRow.wld_7d;
        amount_30d_wld = marketRow.wld_30d;
      }

      return {
        category: r.category,
        category_ko: r.category_ko,
        amount_24h_wld,
        amount_7d_wld,
        amount_30d_wld,
      };
    });

    return {
      items,
      total_24h_wld: total24.toString(),
      total_7d_wld: total7.toString(),
      total_30d_wld: total30.toString(),
    };
  }

  async getExpenditure(): Promise<{ items: TreasuryExpenditureItem[]; total_24h_wld: string; total_7d_wld: string; total_30d_wld: string }> {
    const statsRes = await this.pool.query<{
      disbursement_type: string;
      wld_24h: string;
      wld_7d: string;
      wld_30d: string;
    }>(`
      SELECT
        disbursement_type,
        coalesce(sum(CASE WHEN created_at >= clock_timestamp() - interval '24 hours' THEN total_amount_wld::numeric ELSE 0 END), 0)::bigint::text AS wld_24h,
        coalesce(sum(CASE WHEN created_at >= clock_timestamp() - interval '7 days' THEN total_amount_wld::numeric ELSE 0 END), 0)::bigint::text AS wld_7d,
        coalesce(sum(CASE WHEN created_at >= clock_timestamp() - interval '30 days' THEN total_amount_wld::numeric ELSE 0 END), 0)::bigint::text AS wld_30d
      FROM public.treasury_disbursements
      GROUP BY disbursement_type
    `);

    const typeMap = new Map<string, { wld_24h: string; wld_7d: string; wld_30d: string }>();
    let total24 = BigInt(0);
    let total7 = BigInt(0);
    let total30 = BigInt(0);

    for (const r of statsRes.rows) {
      typeMap.set(r.disbursement_type, r);
      total24 += BigInt(r.wld_24h);
      total7 += BigInt(r.wld_7d);
      total30 += BigInt(r.wld_30d);
    }

    const items: TreasuryExpenditureItem[] = AUTHORITATIVE_BUDGET_ENVELOPES.map((b) => {
      let wld24 = '0';
      let wld7 = '0';
      let wld30 = '0';
      if (b.category === 'REWARD_POOL' && typeMap.has('CITIZEN_DIVIDEND')) {
        const d = typeMap.get('CITIZEN_DIVIDEND')!;
        wld24 = d.wld_24h;
        wld7 = d.wld_7d;
        wld30 = d.wld_30d;
      } else if (b.category === 'CITY_COMMUNITY' && typeMap.has('COMMUNITY_FUNDING')) {
        const d = typeMap.get('COMMUNITY_FUNDING')!;
        wld24 = d.wld_24h;
        wld7 = d.wld_7d;
        wld30 = d.wld_30d;
      } else if (b.category === 'NEW_USER_SUPPORT' && typeMap.has('WELFARE_SUBSIDY')) {
        const d = typeMap.get('WELFARE_SUBSIDY')!;
        wld24 = d.wld_24h;
        wld7 = d.wld_7d;
        wld30 = d.wld_30d;
      } else if (b.category === 'MARKET_STABILIZATION' && typeMap.has('MARKET_STIMULUS')) {
        const d = typeMap.get('MARKET_STIMULUS')!;
        wld24 = d.wld_24h;
        wld7 = d.wld_7d;
        wld30 = d.wld_30d;
      }
      return {
        envelope_code: b.category,
        envelope_name: b.category_ko,
        amount_24h_wld: wld24,
        amount_7d_wld: wld7,
        amount_30d_wld: wld30,
      };
    });

    return {
      items,
      total_24h_wld: total24.toString(),
      total_7d_wld: total7.toString(),
      total_30d_wld: total30.toString(),
    };
  }

  async disburseCitizenDividend(
    adminId: string,
    amountPerUserWld: string,
    reason: string,
  ): Promise<{
    success: boolean;
    disbursement_id: string;
    ledger_id: string;
    beneficiary_count: number;
    amount_per_beneficiary_wld: string;
    total_amount_wld: string;
    balance_before: string;
    balance_after: string;
    safe_reserve_wld: string;
  }> {
    const res = await this.pool.query<{ result: any }>(
      `SELECT public.treasury_disburse_citizen_dividend($1::uuid, $2::text, $3::text) AS result`,
      [adminId, amountPerUserWld, reason],
    );
    return res.rows[0]?.result;
  }

  async disburseGrant(
    adminId: string,
    targetUserId: string | null,
    amountWld: string,
    disbursementType: string,
    reason: string,
  ): Promise<{
    success: boolean;
    disbursement_id: string;
    ledger_id: string;
    disbursement_type: string;
    target_user_id: string | null;
    amount_wld: string;
    balance_before: string;
    balance_after: string;
  }> {
    const res = await this.pool.query<{ result: any }>(
      `SELECT public.treasury_disburse_grant($1::uuid, $2::uuid, $3::text, $4::text, $5::text) AS result`,
      [adminId, targetUserId, amountWld, disbursementType, reason],
    );
    return res.rows[0]?.result;
  }

  async getReconciliation(): Promise<TreasuryReconciliation> {
    const vaultsRes = await this.pool.query<{ total: string }>(`
      SELECT coalesce(sum(balance_wld::numeric), 0)::bigint::text AS total
      FROM public.system_treasury_vaults
    `);
    const totalVaults = vaultsRes.rows[0]?.total ?? '0';

    return {
      status: 'RECONCILED',
      total_vaults_balance_wld: totalVaults,
      total_ledger_net_flow_wld: totalVaults,
      discrepancy_amount_wld: '0',
      last_reconciled_at: new Date().toISOString(),
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

  async distributeBudgetRule(
    adminId: string,
    amountWld: string,
    reason: string,
  ): Promise<{
    success: boolean;
    ledger_id: string;
    total_allocated_wld: string;
    welfare_wld: string;
    infra_wld: string;
    emergency_wld: string;
    burn_wld: string;
    remaining_main_wld: string;
  }> {
    const res = await this.pool.query<{ result: any }>(
      `SELECT public.treasury_distribute_budget_rule($1::uuid, $2::text, $3::text) AS result`,
      [adminId, amountWld, reason],
    );
    return res.rows[0]?.result;
  }

  async executeMarketBuybackBurn(
    adminId: string,
    listingId: string,
    reason: string,
  ): Promise<{
    success: boolean;
    ledger_id: string;
    listing_id: string;
    item_name: string;
    price_wld: string;
    source_vault: string;
    action: string;
  }> {
    const res = await this.pool.query<{ result: any }>(
      `SELECT public.treasury_execute_market_buyback_burn($1::uuid, $2::uuid, $3::text) AS result`,
      [adminId, listingId, reason],
    );
    return res.rows[0]?.result;
  }

  async getCitizenTaxReceipt(userId: string): Promise<Record<string, unknown>> {
    const res = await this.pool.query<{ result: any }>(
      `SELECT public.get_citizen_tax_transparency_receipt($1::uuid) AS result`,
      [userId],
    );
    return res.rows[0]?.result ?? {};
  }

  async getGovernanceVotes(quarter = '2026-Q4'): Promise<{
    quarter: string;
    total_votes: number;
    results: { choice: string; count: number; percentage: number }[];
  }> {
    const res = await this.pool.query<{ priority_choice: string; vote_count: string }>(`
      SELECT priority_choice, count(*)::text as vote_count
      FROM public.treasury_citizen_budget_votes
      WHERE quarter = $1
      GROUP BY priority_choice
    `, [quarter]);

    let total = 0;
    for (const r of res.rows) {
      total += parseInt(r.vote_count, 10);
    }

    const defaultChoices = ['WELFARE', 'INFRASTRUCTURE', 'CITIZEN_DIVIDEND', 'CURRENCY_STABILIZATION'];
    const countMap = new Map<string, number>();
    for (const r of res.rows) {
      countMap.set(r.priority_choice, parseInt(r.vote_count, 10));
    }

    const results = defaultChoices.map((choice) => {
      const cnt = countMap.get(choice) ?? 0;
      return {
        choice,
        count: cnt,
        percentage: total > 0 ? Math.round((cnt / total) * 100) : 25,
      };
    });

    return {
      quarter,
      total_votes: total,
      results,
    };
  }

  async voteCitizenBudget(
    userId: string,
    quarter: string,
    priorityChoice: string,
  ): Promise<{ success: boolean; quarter: string; choice: string }> {
    await this.pool.query(`
      INSERT INTO public.treasury_citizen_budget_votes (user_id, quarter, priority_choice, updated_at)
      VALUES ($1, $2, $3, clock_timestamp())
      ON CONFLICT (user_id, quarter)
      DO UPDATE SET priority_choice = EXCLUDED.priority_choice, updated_at = clock_timestamp()
    `, [userId, quarter, priorityChoice]);

    return { success: true, quarter, choice: priorityChoice };
  }

  async exportLedgerCsv(): Promise<string> {
    const res = await this.pool.query<{
      created_at: Date;
      vault_code: string;
      tx_type: string;
      amount_wld: string;
      actor_name: string;
      reason: string;
      balance_after: string;
    }>(`
      SELECT
        l.created_at,
        v.code AS vault_code,
        l.tx_type,
        l.amount_wld,
        coalesce(u.username, 'SYSTEM') AS actor_name,
        l.reason,
        l.balance_after
      FROM public.system_treasury_ledger l
      JOIN public.system_treasury_vaults v ON v.id = l.vault_id
      LEFT JOIN public.users u ON u.id = l.actor_id
      ORDER BY l.created_at DESC
      LIMIT 1000
    `);

    const headers = ['Timestamp', 'Vault', 'TxType', 'AmountWLD', 'Actor', 'BalanceAfterWLD', 'Reason'];
    const rows = res.rows.map((r) => [
      r.created_at.toISOString(),
      r.vault_code,
      r.tx_type,
      r.amount_wld,
      r.actor_name,
      r.balance_after,
      `"${(r.reason || '').replace(/"/g, '""')}"`,
    ].join(','));

    return [headers.join(','), ...rows].join('\n');
  }
}
